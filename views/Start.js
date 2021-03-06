import './Start.css';
import React, { useEffect, useState } from 'react';
import { WebMidi } from "webmidi";
import * as Tone from 'tone';
import Recorder from './Recorder';
import { useStateValue } from '../state';
import { addNote, setMetronomes, setBpm, setBars } from '../action';
import { polyrhythms } from '../utils/functions';

export default function Start() {

  const [state, dispatch] = useStateValue();
  const [audioReady, setAudioReady] = useState(false);
  const [midiInput, setMidiInput] = useState(undefined);
  const [startVisible, setStartVisible]= useState(true);
  const [loopTime, setLoopTime] = useState(16);

  const latencyOffset = 0.01;
  const noteCur = new Map();
  
  const metronomeLoopTime = loopTime/state.bars;
  
  const loopTimeRef = React.useRef(loopTime);
  const newLoopTime = time => {
    loopTimeRef.current = time;
    setLoopTime(time);
  };
  useEffect(()=>{newLoopTime((60/state.bpm)*state.bars*state.bpb)},[state.bpm,state.bars,state.bpb])

  // loopCounter
  const [loopCounter, setLoopCounter] = useState(0);
  const loopCounterRef = React.useRef(loopCounter);
  const incrementLoop = newLoop => {
    loopCounterRef.current = newLoop;
    setLoopCounter(newLoop);
  };
  useEffect(()=>{incrementLoop(-loopTime)},[loopTime])

  // currentInstument
  const [currentInstrument, setCurrentInstrument] = React.useState('keys');
  const instrumentRef = React.useRef(currentInstrument);
  const changeInstrument = instrument => {
    console.log("NEW INSTRUMENT " + instrument);
    instrumentRef.current = instrument;
    setCurrentInstrument(instrument);
  };

  // startRec and stopRec
  const [startRec, setStartRec] = React.useState(false);
  const [stopRec, setStopRec] = React.useState(false);
  const startRecRef = React.useRef(startRec);
  const stopRecRef = React.useRef(stopRec);
  const recOn = on => {
    startRecRef.current = on;
    setStartRec(on);
  };
  const recOff = off => {
    stopRecRef.current = off;
    setStopRec(off);
  };

  useEffect(() => {
    if(!audioReady) startAudio();
  });

  function onStart() {
    Tone.Transport.bpm.value = state.bpm;
    Tone.Transport.loop = true;
    Tone.Transport.loopStart = 0;
    Tone.Transport.loopEnd = loopTime;

    // Loop counter callback
    Tone.Transport.schedule((time) => {
      console.log("CHIAMATA CALLBACK",loopTimeRef.current)
      incrementLoop(loopCounterRef.current+loopTimeRef.current);
    }, loopTimeRef.current-0.005);

    initializeMetronomes();
    setStartVisible(false);
  }

  async function startAudio() {
    try {
      await Tone.start();
    } catch(e) {
      console.log("Tone could not be started - " + e);
    }
    // console.log("Tone is ready");
    try {
      await WebMidi.enable();
    } catch(e) {
      console.log("WebMidi could not be started - " + e);
    }
    onMidiEnabled();
    setAudioReady(true);
  };

  function initializeMetronomes() {
    const metronomes = polyrhythms(metronomeLoopTime);
    dispatch(setMetronomes(metronomes));
  }

  function onMidiEnabled() {
    // console.log("WebMidi is ready");
    if (WebMidi.inputs.length < 1) {
      console.log("WebMidi: No device detected");
    }
    else {
      const dummyInput = WebMidi.inputs[0];
      setMidiInput(dummyInput);
      addMidiListener(dummyInput);
    }
  }

  // change input device
  function onMidiInputChange() {
    midiInput.removeListener();
    var newMidiInput = WebMidi.getInputByName(document.getElementById("midiInputSelect").value);
    setMidiInput(newMidiInput);
    addMidiListener(newMidiInput);
  }
  
  function addMidiListener(input) {
    input.addListener("midimessage", e => {
      // attack
      if(e.message.type==="noteon") {
        state.instruments[instrumentRef.current].synth.triggerAttack(Tone.Frequency(e.data[1],"midi"), Tone.now());
        let noteCurTime = Tone.Transport.progress*loopTimeRef.current-latencyOffset;
        if (noteCurTime<0) noteCurTime=0;
        noteCur.set(e.data[1],[noteCurTime,e.timestamp]);
      }
      // release
      else if(e.message.type==="noteoff") {
        state.instruments[instrumentRef.current].synth.triggerRelease(Tone.Frequency(e.data[1],"midi"), Tone.now());
        const key = e.data[1];
        let duration = (e.timestamp-noteCur.get(key)[1])/1000;
        const note = {
          "time": noteCur.get(key)[0],
          "note": key,
          "duration": duration,
          "absTime": noteCur.get(key)[0]+loopCounterRef.current,
        };
        if(note.time + note.duration > loopTimeRef.current-0.005) {
          note["absTime"] = note["absTime"]-loopTimeRef.current;
        }
        noteCur.delete(key);
        if(startRecRef.current || (loopCounter.current===0 && note.time > metronomeLoopTime-0.01)) {
          console.log("ADD NOTE", note);
          dispatch(addNote(note, instrumentRef.current));
        };
      }
    });
  }

  function handleBpmInput(e) {
    dispatch(setBpm(e.target.value));
  }

  function handleBarsInput(e) {
    dispatch(setBars(e.target.value));
  }


  if(startVisible) {
    return(
      <div className="start">
        <div className="text">POLYLOOPER</div>
        <ul className="lista" id='menu'>
          <li className='lista indice' data-text="BPM">
            <div className='lista indice a'>BPM
              <div className="slidecontainer">
                <input type="range" min="10" max="200" value={state.bpm} className="input slider" id="myRange" onChange={handleBpmInput} />
                <output id="rangevalue">{state.bpm}</output>
              </div>
            </div>
          </li>

          <li className='lista indice' data-text="bars">
            <div className='lista indice a'>
              bars
              <input className="input" type="number" value={state.bars} min="1" id="name" name="name" required minLength="4" maxLength="8" size="10" onInput={handleBarsInput}/>
            </div>
          </li>

          <li className='lista indice' data-text="input">
            <div className='lista indice a'>
              input
              <div className="custom-select" style={{ width: "200px" }}>
                <select name="midiInput" id="midiInputSelect" onChange={onMidiInputChange}>
                  {WebMidi.inputs.map((device, index) => <option key={index} value={device.name}>{device.name}</option>)}
                </select>
              </div>
            </div>
          </li>
          
          <li className='lista indice' data-text="start">
            <div className='lista indice a' onClick={onStart} id="startButton">
              START
            </div>
          </li>
        </ul>
      </div>
    )
  }
  else {
    return (
      <div className="Start">
        <Recorder 
          loopTime = {loopTime}
          metronomeLoopTime = {metronomeLoopTime}
          startRec = {startRecRef.current}
          stopRec = {stopRecRef.current}
          recOn = {recOn}
          recOff = {recOff}
          currentInstrument = {instrumentRef.current}
          changeInstrument = {changeInstrument} />
      </div>
    );
  }
}