export default function reducer(state, action) {
    switch(action.type){
        case 'ADD NOTE':
            let newInstruments = {};
            Object.assign(newInstruments, state.instruments);
            console.log(newInstruments[action.instrument]);
            newInstruments[action.instrument].notes.push(action.note);
            console.log("NEW INSTRUMENTS ", newInstruments);
            if(state.currentLoop.length!=0 && state.currentLoop[state.currentLoop.length-1].time>action.note.time)
                return {...state,loop:state.loop+1, loops: [...state.loops, state.currentLoop.filter(e=>state.currentLoop.indexOf(e) >= state.counter)],counter:state.currentLoop.length,currentLoop:[...state.currentLoop,action.note], instruments: newInstruments}
            
            else if(state.currentLoop.length===0) 
                return {...state, currentLoop: [...state.currentLoop, action.note], loop:1, loops:[], counter:0, instruments: newInstruments}
            
            else return {...state, currentLoop: [...state.currentLoop, action.note], instruments: newInstruments}
        case 'ADD LOOP':
            const loop = state.currentLoop;
            return {...state, loops: [...state.loops, loop], currentLoop:[]}
        case 'SET METRONOMES':
            return {...state, metronomes: action.metronomes}
        case 'SET BPM':
            return {...state, bpm: action.bpm}
        case 'SET BARS':
            return {...state, bars: action.bars}
        case 'CHANGE INSTRUMENT':
            return {...state, currentInstrument: action.instrument}
    }
}