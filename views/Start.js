import './Start.css';
import React, { useState } from 'react';
import { WebMidi } from "webmidi";
import * as Tone from 'tone';
import Recorder from './Recorder';
import { useStateValue } from '../state';
import { addNote, setMetronomes } from '../action';
import { polyrhythms } from '../utils/functions';

export default function Start() {

  const [state, dispatch] = useStateValue();
  const [audioReady, setAudioReady] = useState(false);
  const [midiInput, setMidiInput] = useState(undefined);
  const [startVisible, setStartVisible]= useState(true);

  const latencyOffset = 0.01;
  const noteCur = new Map();
  const loopTime = (60/state.bpm)*state.bars*state.bpb;
  const metronomeLoopTime = loopTime/state.bars;

  // currentInstument
  const instrumentRef = React.useRef(state.currentInstrument);
  const changeInstrument = index => {
    instrumentRef.current = index;
    dispatch(changeInstrument(index));
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
  
  function onStart() {
    if(!audioReady) startAudio();
  }

  async function startAudio() {
    try {
      await Tone.start();
    } catch(e) {
      console.log("Tone could not be started - " + e);
    }
    console.log("Tone is ready");
    try {
      await WebMidi.enable();
    } catch(e) {
      console.log("WebMidi could not be started - " + e);
    }
    onMidiEnabled();
    setStartVisible(false);
    setAudioReady(true);
    initializeMetronomes();
  };

  function initializeMetronomes() {
    const metronomes = polyrhythms(metronomeLoopTime);
    metronomes.forEach((value, key) => {
      value.synth.volume.value = state.minVolume;
      value.part.start(0);
    });
    dispatch(setMetronomes(metronomes));
  }

  function onMidiEnabled() {
    console.log("WebMidi is ready");
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
        console.log("note on, instrument: " + instrumentRef.current);
        state.instruments[instrumentRef.current].synth.triggerAttack(Tone.Frequency(e.data[1],"midi"), Tone.now());
        let noteCurTime = Tone.Transport.progress*loopTime-latencyOffset;
        if (noteCurTime<0) noteCurTime=0;
        noteCur.set(e.data[1],[noteCurTime,e.timestamp]);
      }
      // release
      else if(e.message.type==="noteoff") {
        console.log("note off, instrument: " + instrumentRef.current);
        state.instruments[instrumentRef.current].synth.triggerRelease(Tone.Frequency(e.data[1],"midi"), Tone.now());
        const key = e.data[1];
        let duration = (e.timestamp-noteCur.get(key)[1])/1000;
        const note = {
          "time": noteCur.get(key)[0],
          "note": Tone.Frequency(key,"midi"),
          "duration": duration
        };
        noteCur.delete(key);
        console.log(startRecRef.current);
        if(startRecRef.current) dispatch(addNote(note, instrumentRef.current));
      }
    });
  }

  if(startVisible) {
    return(
      <div className="start">
          <div className="text">POLYLOOPER</div>  
                <ul className="lista" id='menu'>
                    <li className='lista indice' data-text="BPM"><div className='lista indice a'>BPM 
                        <div className="slidecontainer">
                            <input type="range" min="10" max="200" value="1" className="input slider" id="myRange" />
                            <output id="rangevalue">0</output>
                        </div></div>
                    </li>
                    <li className='lista indice' data-text="instrument"><div className='lista indice a'>instrument 
                        <div className="custom-select" style={{width:"200px"}}>
                            <select>
                                <option value="0">Select</option>
                                <option value="1">Instrument 1</option>
                                <option value="2">Instrument 2</option>
                                <option value="3">Instrument 3</option>
                                <option value="4">Instrument 4</option>
                            </select>
                        </div>
                    </div></li>
      
                    <li className='lista indice' data-text="bars"><div className='lista indice a'>bars 
                        <input className="input" type="number" min="1" id="name" name="name" required minlength="4" maxlength="8" size="10"/>     
                    </div></li>
      
                    <li className='lista indice' data-text="input"><div className='lista indice a'>input
                        <div className="custom-select" style={{width:"200px"}}>
                            <select>
                                <option value="0">Select</option>
                                <option value="1">MIDI</option>
                                <option value="2">Microphone</option>
                            </select>
                        </div>  
                    </div></li>
      
                    <li className='lista indice' data-text="polyrhythm"><div className='lista indice a'>polyrhythm
                    </div></li>
                    <li className='lista indice' data-text="start"><div className='lista indice a' onClick={onStart} id="startButton">START
                    </div></li>
                </ul>
 
            <div className="menu">
                <h1>Polyrhythm</h1>
                     <div className="popup">4:3</div>
                     <div className="popup">4:5</div>
                     <div className="popup">4:7</div>
                     <div className="popup"></div>
                <h1>Resolution</h1>
                     <div className="popup">x1</div>
                     <div className="popup">x2</div>
                     <div className="popup">x3</div>
                     <div className="popup">x4</div>
             </div>
      </div>
    )
  }
  else {
    return (
      <div className="Start">
        {
          //<select name="midiInput" id="midiInputSelect" onChange={onMidiInputChange}>
          //{WebMidi.inputs.map((device, index) => <option key={index} value={device.name}>{device.name}</option>)}
        //</select>
        //<button onClick={() => setStartVisible(true)}>Back</button>
  }
        <Recorder 
          loopTime = {loopTime}
          startRec = {startRecRef.current}
          stopRec = {stopRecRef.current}
          recOn = {recOn}
          recOff = {recOff}
          changeInstrument = {changeInstrument}
        />
      </div>
    );
  }
}