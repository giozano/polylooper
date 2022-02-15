import * as Tone from 'tone';
import { useState } from 'react';
import { useStateValue } from '../state';
import Track from './Track';
import './recorder.css';
import './whell.css';


export default function Recorder(props) {
    
    const [state, dispatch] = useStateValue();
    const [animation, setAnimation] = useState("")
    //per la visibilità dei bottoni record and play
    const [onRecording, setOnRecording] = useState(false)
    const [onPlay, setOnPlay] = useState(false)

    let tracks = [];

    // Animazione del cursore
    let transportBar = requestAnimationFrame (
        function cursorMove () {
          // 
          let cursorPosition = Tone.Transport.progress*100+"%";
          let angularPosition = (Tone.Transport.progress%(1/state.bars))*state.bars*360+"deg";
          let cursorTracks=document.getElementsByClassName("cursor-line");
          for (let i=0;i<cursorTracks.length;i++){
            cursorTracks[i].setAttribute("x1",cursorPosition);
            cursorTracks[i].setAttribute("x2",cursorPosition);
          }
  
          document.getElementById("circle-looped").style.transform="rotate("+angularPosition+")";
          requestAnimationFrame (cursorMove);
        }
    );

    function record() {
        setOnRecording(true)//per il bottone record
        setOnPlay(true);//per il bottone play

        if (Tone.Transport.state==="stopped") {
            console.log("COUNT IN");

            // Count in
            let startCount = props.loopTime-(60/state.bpm)*state.bpb-0.001;
            Tone.Transport.position = startCount;

            Tone.Transport.scheduleOnce((time) => {
                props.recOn(true);
                props.recOff(false);
            }, props.loopTime-0.01);

            Tone.Transport.start();
        }
        else if (Tone.Transport.state==="started") {
            if (props.startRec) {
                console.log("STRUMENTI ", state.instruments);
                for(var key in state.instruments) {
                    var instrument = state.instruments[key];
                    
                    const track = new Tone.Part(function(time,value) {
                      instrument.synth.triggerAttackRelease(value.note, value.duration, time);
                    }, instrument.notes).start(0);

                    track.loop = true;
                    track.loopEnd = props.loopTime;

                    tracks.push(track);
                }

                props.recOn(false);
                props.recOff(true);
            }
            else {
                props.recOn(true);
                props.recOff(false);
                console.log("RECORD");
            }
        }
    }

    function stop() {
        console.log("STOP");
        props.recOn(false);
        props.recOff(true);
        setOnPlay(false);
        setOnRecording(false);

        Tone.Transport.stop();

        console.log("STRUMENTI ", state.instruments);
        for(var key in state.instruments) {
            const track = new Tone.Part(function(time,value) {
                state.instruments[key].synth.triggerAttackRelease(Tone.Frequency(value.note,"midi"), value.duration, time);
            }, state.instruments[key].notes).start(0);

            track.loop = true;
            track.loopEnd = props.loopTime;

            tracks.push(track);
        }
    }

    function play() {
        setOnPlay(true);
        if (Tone.Transport.state==="stopped") {
            Tone.Transport.start();
            console.log("PLAY");
        }
    }

    function visibilityRec(){
        if(onRecording) return(<button onClick={stop} className="instrument">Record</button>)
        else return(<button onClick={record} className="instrument">Record</button>)
    }

    function visibilityPlay(){
        if(onPlay) return(<button onClick={stop} className="instrument">Stop</button>)
        else return(<button onClick={play} className="instrument">Play</button>)
    }

    function toggleMetronome(subdivision) {
      console.log(state.metronomes);
      state.metronomes.get(subdivision).synth.volume.value = state.metronomes.get(subdivision).synth.volume.value < 0 ? 0 : state.minVolume;
    }

    return (
      <div className="body">
        <div className='ul'>
          <div className='li'>
            <div className="instrument" onClick={() => props.changeInstrument('kick')}>KICK</div>
          </div>
          <div className='li'>
            <div className="instrument" onClick={() => props.changeInstrument('keys')}>KEYS</div>
          </div>
          <div className='li'>
            <div className="instrument" onClick={() => props.changeInstrument('lead')}>LEAD</div>
          </div>
          <div className='li'>
            <div className="instrument" onClick={() => props.changeInstrument('bass')}>BASS</div>
          </div>
          <div className='li'>
            <div className="uneditable">BPM: {state.bpm}</div>
          </div>
          <div className='li'>
            <div className="uneditable">Metric: {state.bpb + "/4"}</div>
          </div>
          <div className="instrument">Save</div>
        </div>
        <div id="track">
          <div style={{ width: "100vw", height: "150px" }}>
            <Track play={animation} />
          </div>
        </div>
        <div className='ul sud'>
            <div style={{ flex: "3" }}>
              <div>
                <button className="instrument" onClick={() => {
                        toggleMetronome(3);
                        const visibile = document.getElementById('g3').style.visibility;
                        console.log(visibile)
                        switch (visibile) {
                          case 'visible':
                            document.getElementById('g3').style.visibility = 'hidden';
                            break;
                          case 'hidden':
                            document.getElementById('g3').style.visibility = 'visible';
                            break;
                          default:
                            document.getElementById('g3').style.visibility = 'hidden';
                        }
                  }
                }>
                  3
                </button>
                <button className="instrument" onClick={() => {
                        toggleMetronome(4);
                        const visibile = document.getElementById('g4').style.visibility;
                        switch (visibile) {
                          case 'visible':
                            document.getElementById('g4').style.visibility = 'hidden';
                            break;
                          case 'hidden':
                            document.getElementById('g4').style.visibility = 'visible';
                            break;
                          default:
                            document.getElementById('g4').style.visibility = 'hidden';
                        }
                    }
                }>
                  4
                </button>
                <button className="instrument" onClick={() => {
                        toggleMetronome(5);
                        const visibile = document.getElementById('g5').style.visibility;
                        switch (visibile) {
                          case 'visible':
                            document.getElementById('g5').style.visibility = 'hidden';
                            break;
                          case 'hidden':
                            document.getElementById('g5').style.visibility = 'visible';
                            break;
                          default:
                            document.getElementById('g5').style.visibility = 'hidden';
                        }
                    }
                }>
                  5
                </button>
                <button className="instrument" onClick={() => {
                        toggleMetronome(7);
                        const visibile = document.getElementById('g7').style.visibility;
                        switch (visibile) {
                          case 'visible':
                            document.getElementById('g7').style.visibility = 'hidden';
                            break;
                          case 'hidden':
                            document.getElementById('g7').style.visibility = 'visible';
                            break;
                          default:
                            document.getElementById('g7').style.visibility = 'hidden';
                        }
                    }
                }>
                  7
                </button>
              </div>
            </div>
            <div style={{ flex: "1" }}>
              <div class="circle">
                <svg viewBox="0 0 120 120">
                  <circle cx="60" cy="60" r="50" fill="none" stroke="black" />
                  <circle cx="60" cy="10" r="3" id="circle-looped" />

                  <g id="g3" class="poly3">
                    <circle cx="60" cy="10" r="3" class="poly3-1" />
                    <circle cx="60" cy="10" r="3" class="poly3-2" />
                    <circle cx="60" cy="10" r="3" class="poly3-3" />
                  </g>

                  <g id="g4" class="poly4">
                    <circle cx="60" cy="10" r="3" class="poly4-1" />
                    <circle cx="60" cy="10" r="3" class="poly4-2" />
                    <circle cx="60" cy="10" r="3" class="poly4-3" />
                    <circle cx="60" cy="10" r="3" class="poly4-4" />
                  </g>

                  <g id="g5" class="poly5">
                    <circle cx="60" cy="10" r="3" class="poly5-1" />
                    <circle cx="60" cy="10" r="3" class="poly5-2" />
                    <circle cx="60" cy="10" r="3" class="poly5-3" />
                    <circle cx="60" cy="10" r="3" class="poly5-4" />
                    <circle cx="60" cy="10" r="3" class="poly5-5" />
                  </g>
                  <g id="g7" class="poly7">
                    <circle cx="60" cy="10" r="3" class="poly7-1" />
                    <circle cx="60" cy="10" r="3" class="poly7-2" />
                    <circle cx="60" cy="10" r="3" class="poly7-3" />
                    <circle cx="60" cy="10" r="3" class="poly7-4" />
                    <circle cx="60" cy="10" r="3" class="poly7-5" />
                    <circle cx="60" cy="10" r="3" class="poly7-6" />
                    <circle cx="60" cy="10" r="3" class="poly7-7" />
                  </g>
                </svg>
              </div>
            </div>
            <div id="control-buttons">
              {visibilityRec()}
              {visibilityPlay()}
            </div>
          
          
        </div>
      </div>
    );
}