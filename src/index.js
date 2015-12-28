import "babel-core";
import MMLEmitter from "mml-emitter";

let audioContext = new AudioContext();

function play(mml) {
  let config = { context: audioContext };
  let mmlEmitter = new MMLEmitter(mml, config);

  mmlEmitter.on("note", (e) => {
    console.log("NOTE: " + JSON.stringify(e));
    playNote(e);
  });
  mmlEmitter.on("end:all", (e) => {
    console.log("END : " + JSON.stringify(e));
    mmlEmitter.stop();
  });

  mmlEmitter.start();
}

let btn = document.getElementById('play');

btn.addEventListener('click', ()=> {
  let editor = document.getElementById('editor');
  let song = editor.value;
  play(song);
});
   
let mtof = noteNumber => 440 * Math.pow(2, (noteNumber - 69) / 12);

function playNote(e) {
  let t0 = e.playbackTime;
  let t1 = t0 + e.duration * (e.quantize / 100);
  let t2 = t1 + 0.5;
  let osc1 = audioContext.createOscillator();
  let osc2 = audioContext.createOscillator();
  let amp = audioContext.createGain();
  let volume = 0.25 * (e.velocity / 128);
  osc1.frequency.value = mtof(e.noteNumber);
  osc1.detune.setValueAtTime(+12, t0);
  osc1.detune.linearRampToValueAtTime(+1, t1);
  osc1.start(t0);
  osc1.stop(t2);
  osc1.connect(amp);
  osc2.frequency.value = mtof(e.noteNumber);
  osc2.detune.setValueAtTime(-12, t0);
  osc2.detune.linearRampToValueAtTime(-1, t1);
  osc2.start(t0);
  osc2.stop(t2);
  osc2.connect(amp);
  amp.gain.setValueAtTime(volume, t0);
  amp.gain.setValueAtTime(volume, t1);
  amp.gain.exponentialRampToValueAtTime(1e-3, t2);
  amp.connect(audioContext.destination);
}

