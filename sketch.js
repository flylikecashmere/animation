
checkFps = false;

// load initialization script
fpsMeter = loadFps(checkFps)

// constant time (in s) 
const tCons_arr = [0.2, 1.0] 
// first: time of repetition is multiple
// second: grid for starting blob
// third: minimum time
const tracker_obj = new interTracker(tCons_arr)

// setup parameters - repetitions
const maxElp_fl = 10 // maximum time for repetition
const minElp_fl = 0.5 // minimum time for repetition
const maxRep_int = 32; // maximum number of repetition
const minRep_int = 8; // minimum number of repetition
const parCrc_int = 20 // number of circles that can be displayed at the same time

// setup parameters - blob
const scale_fl = 8.0

// canvas setup
const size_fl =  window.innerWidth // size in x-direction
const rat_fl = window.outerHeight/window.innerWidth; // factor for size in y-direction

const size = {x: size_fl, y: size_fl*rat_fl}

app = startCanvas() 

// prepare circles
let aniCircle_arr = new Array(parCrc_int);

for (let i = 0; i < aniCircle_arr.length; i++) {
  aniCircle_arr[i] = new aniCircle()
}

let act_int = 0;
let cnt_int = 0;

let chordCnt_dic = {};
for (let i = 0; i < chord_arr.length; i++) {
  chordCnt_dic[i] = 0;
}

// define reactions (time in milliseconds)
hammer.get('press').set({
  time: 250,
  threshold: 1000
});

hammer.on("press", function(event) {
  // count chord
  chordCnt_dic[cnt_int % chord_arr.length] = chordCnt_dic[cnt_int % chord_arr.length] + 1
  // check if distance large enought to count chord/color
  if (act_int > 0) {
    checkDist(aniCircle_arr[act_int - 1].pos, event.center)
  }
  // start new circle
  aniCircle_arr[act_int].startCircle(event.center.x, event.center.y)
});

hammer.on("tap", function(event) {
  // count chord
  chordCnt_dic[cnt_int % chord_arr.length] = chordCnt_dic[cnt_int % chord_arr.length] + 1
  // check if distance large enought to count chord/color
  if (act_int > 0) {
    checkDist(aniCircle_arr[act_int].pos, event.center)
  }
});

// function to be triggered on release
function handleRelease(event) {
  aniCircle_arr[act_int].repeatCircle(tracker_obj)
  // find latest circle with same color
  let last_int = -1;
  for (let i = 0; i < aniCircle_arr.length; i++) {
      if (aniCircle_arr[i].colorId === aniCircle_arr[act_int].colorId && i != act_int) {
        last_int = i;
      }
  }

  // connect to latest circle with same color id
  if (last_int > -1) {
    
    aniCircle_arr[last_int].next = act_int;

  }
  // update counter of next circle
  if (act_int + 1 < parCrc_int) {
    act_int = act_int + 1
  } else {
    act_int = 0
  }
}

hammer.on('pressup', handleRelease);
hammer.on('panend', handleRelease);

app.ticker.add(() => {
});



// wie audio connecten -> tone besser verstehen:
// a) über effekte (z.B. filter)

// verknüfung so richtig? was mit nicht mehr hörbaren kreisen -> müssten resettet werden

// sound rund machen -> connection in audio übersetzen -> connection raum gerade gut?
// weitere verknüpfung mit optik (gross = tiefer)
// timings, farben etc. rund machen
// -> wenn alle akkorde spielen sample abspielen

// zukunftsmusik
// mache scripts, die automatisch bestimmtes pattern erzeugen und teile die patterns
// teste alternativen: innerer blob, synchron aber wächst immer schneller
// blobs: schneller wachsen und warme farben im zentrum -> was für achsen überlegen
// sound: angenehmer sound, frequenzmodulation durch vorton, tief im zentrum -> nutze x/y für tonhöhe?
// freischalten: hintergrund loop?, "this is our connection" sample
