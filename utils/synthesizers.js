import * as Tone from 'tone';

export const keys = new Tone.PolySynth(Tone.Synth, {
    volume: -8,
    oscillator: {
        partials: [1, 2, 1],
    },
}).toDestination();

export const kick = new Tone.MembraneSynth({
    envelope: {
        sustain: 0,
        attack: 0.02,
        decay: 0.8
    },
    octaves: 10,
    pitchDecay: 0.01,
}).toDestination();

export const bass = new Tone.MonoSynth({
    volume: -10,
    envelope: {
        attack: 0.1,
        decay: 0.3,
        release: 2,
    },
    filterEnvelope: {
        attack: 0.001,
        decay: 0.01,
        sustain: 0.5,
        baseFrequency: 200,
        octaves: 2.6
    }
}).toDestination();

export const lead = new Tone.FMSynth().toDestination();

export const metronome = {
    pitchDecay: 0.05,
    octaves: 3,
    oscillator: {type: 'sine'},
    envelope: {
        attack: 0.015,
        decay: 0.01,
        sustain: 0.001,
        release: 0.1,
        attackCurve: 'linear'
    }
}