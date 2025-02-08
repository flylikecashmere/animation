
checkFps = false;

// load initialization script
fpsMeter = loadFps(checkFps)

// setup parameters - single disks
const maxElp_fl = 5.0 // maximum time for start hold
const minElp_fl = 0.5 // minimum time for start hold
const maxRep_int = 46; // maximum number of repetition
const minRep_int = 8; // minimum number of repetition
const parCrc_int = 20 // number of circles that can be displayed at the same time

const rad_arr = [0.04, 0.02 * 1.618] // minimum radius and distance dependant radius relative to diagonal 
const trans_arr  = [0.2, 0.02] // minimum transparency and distance dependant component

// setup parameters - inner and outer section
const thrs_arr = [0.2, 0.2 * Math.pow(1.618,1)] // start radius for inner spawning, threshold for outer spawning, start radius for outer spawing
const relSpeed_arr = [1.0, 2.0] // relative speed indicator for inner and outer section //TODO usage not clear 
const radRatio_fl = 1 / 1.618 // ratio of outer-to-inner radius

// setup parameters - circle position
const yMax_fl = 0.85

// canvas setup
const size_fl =  window.innerWidth // size in x-direction
const rat_fl = window.outerHeight/window.innerWidth; // factor for size in y-direction

const size = {x: size_fl, y: size_fl*rat_fl}
const dia_fl = Math.sqrt(size.x * size.x + size.y * size.y)

// focal length and ploting threshold 
const disExt_vec = [500, 2000]

// camera position and angle in global coordinates
const view_proj = new projData([0.5 * size.x, 0.9 * size.y,  0], [Math.PI / 64, 0.0, 0.0])

// light position and reflection plane
const light1_vec = [0.5 * size.x,  - size.y, 500]
const floor_vec = [0, size.y, 0]

const frmRate_int = 200;

// sequencer setup
trackBase_obj = new track(8, 4, 0)
trackHigh1_obj = new track(1.0, 0.25, 0.03125)
trackHigh2_obj = new track(1.0, 0.25, 0.0)
const seq_obj = new sequencer(120, [trackBase_obj, trackHigh1_obj, trackHigh2_obj])

// dynaic types for iteration
let beam_arr = []
let aniCnt_int = 0; // enable 

app = startCanvas() 


// master compressor
const masterCompressor = new Tone.Compressor({
  threshold: -24,
  ratio: 20,
  attack: 0.0,
  release: 0.0,
  knee: 30 
}).toDestination();


hammer.on("press", function(event) {

  // create new beam object
  beam_obj = new beamAnimation(event.center.x, event.center.y)
  beam_obj.startAnimationBeam()
  beam_arr.push(beam_obj)

  // increase counter
  aniCnt_int = aniCnt_int + 1

});

hammer.on("tap", function(event) {
  // increase counter
  aniCnt_int = aniCnt_int + 1
});

function handleRelease(event) {

  // get latest beam and stop growing
  let beam_obj = beam_arr[beam_arr.length - 1];
  beam_obj.doStart = false

  // add animation to sequencer
  beam_obj.addSequencer()
}

hammer.on('pressup', handleRelease);
hammer.on('panend', handleRelease);
 

beam_obj = new beamAnimation(size.x * 0.5, size.y * 0.8)
beam_obj.clcElp = 5;
event_obj = new seqEvent(0, seq_obj.start + 1, beam_obj.clcElp, 3, 1, {beam: beam_obj})
// seq_obj.addEvent(event_obj)


// 


// debug: warum töne oben nicht schneller, was verhindert mehr unten 
app.ticker.add(() => {
  seq_obj.checkTrigger(Date.now() / 1000)
});

// 0) deal with clicks:
// hat mit setIntervall zu tun vermute ich -> stelle schedule auf tonejs um
// -> grafiken auch?
// check out https://medium.com/@ericroth/an-introduction-to-tone-js-f895e6ebd08
// 1) explore midi connection -> setup approach for timing, C:\Program Files\OpenSSL-Win64
// 2) mache arrangement rund (grösse, tempo variabel? etc.), muss noch nicht final, auch noch keine einschränkung gleichzeitigkeit, sinus bewegung in x und y richtung?
// 2a) überlege verknüpfung der kreise für späteren sound effekt
// 2b) steuere framerate variabel

// implement delay as beam start growing from multiple points at once (had this once as a bug) 

// sound:
// attack und aufteilung verblassung
// verknüfung so richtig? was mit nicht mehr hörbaren kreisen -> müssten resettet werden
// sound rund machen -> connection in audio übersetzen -> connection raum gerade gut?
// weitere verknüpfung mit optik (gross = tiefer)
// modelliere evtl. pfad, schlangenlinien und in lfo übersezten
// freischalten: hintergrund loop?, "this is our connection" sample
// räumliche effekte