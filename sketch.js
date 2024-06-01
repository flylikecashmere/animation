
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
const maxElp_fl = 6 // maximum time for repetition
const minElp_fl = 0.5 // minimum time for repetition
const maxRep_int = 16; // maximum number of repetition
const minRep_int = 4; // minimum number of repetition
const parCrc_int = 20 // number of circles that can be displayed at the same time

// setup parameters - blob
const scale_fl = 4.0

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

// define reactions (time in milliseconds)
hammer.get('press').set({
  time: 250,
  threshold: 1000
});

hammer.on("press", function(event) {
  aniCircle_arr[act_int].startCircle(event.center.x, event.center.y)  
});


// function to be triggered on release
function handleRelease(event) {
  aniCircle_arr[act_int].repeatCircle(tracker_obj)
  
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


// farben: dunkler werden beim wachsen (dunkler teil erst kleiner, aber wächst dann schneller als gesamtkreis)
// -> verstehe shader, bigger rework! -> neue draw circle funktion
// definiere farbgruppen (innerhalb der gruppe zufallsauswahl)

// blobs: schneller wachsen und warme farben im zentrum -> was für achsen überlegen
// sound: angenehmer sound, frequenzmodulation durch vorton, tief im zentrum -> nutze x/y für tonhöhe?
// sound effekte -> nutze x/y für ausmass?
// freischalten: hintergrund loop?, "this is our connection" sample


// code aufräumen (was aus alten funktionen übernehmen?/archivieren)
// code verbessern: mehr wrappen, frage chatgpt
