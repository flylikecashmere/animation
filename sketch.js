
checkFps = false;

// load initialization script
fpsMeter = loadFps(checkFps)

// constant time (in s) 
const tCons_arr = [0.2, 1.0] 
// first: time of repetition is multiple
// second: grid for starting blob
const tracker_obj = new interTracker(tCons_arr)

// setup parameters - single disks
const maxElp_fl = 5.0 // maximum time for start hold
const minElp_fl = 0.5 // minimum time for start hold
const maxRep_int = 46; // maximum number of repetition
const minRep_int = 8; // minimum number of repetition
const parCrc_int = 20 // number of circles that can be displayed at the same time

const rad_arr = [0.04, 0.02 * 1.618] // minimum radius and distance dependant radius relative to diagonal 
const trans_arr  = [0.02, 0.02] // minimum transparency and distance dependant component

// setup parameters - inner and outer section
const thrs_arr = [0.15, 0.1 * Math.pow(1.618,2), 0.1 * Math.pow(1.618,3)] // relative radius for inner spawning, threshold for outer spawning, radius for outer spawing
const relSpeed_arr = [1.0, 2.0] // relative speed indicator for inner and outer section
const radRatio_fl = 1 / 1.618 // ratio of outer-to-inner radius


// canvas setup
const size_fl =  window.innerWidth // size in x-direction
const rat_fl = window.outerHeight/window.innerWidth; // factor for size in y-direction

const size = {x: size_fl, y: size_fl*rat_fl}
const dia_fl = Math.sqrt(size.x * size.x + size.y * size.y)

// camera position and angle
const camPos_vec = [size.x * 0.5, size.y * (1 - Math.pow(1.618,-6))]
const camAng_vec = [- Math.PI / 128, 0.0, 0.0]

// maximum and minimum distance of object from viewer
const disExt_vec = [300, 3000]
const frmRate_int = 32;

// sinus and cosinus of projection agle
const camSin_vec = [Math.sin(camAng_vec[0]), Math.sin(camAng_vec[1]), Math.sin(camAng_vec[2])]
const camCos_vec = [Math.cos(camAng_vec[0]), Math.cos(camAng_vec[1]), Math.cos(camAng_vec[2])]

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


const graphics = new PIXI.Graphics();
graphics.beginFill(0xFF0000);
graphics.drawCircle(camPos_vec[0], camPos_vec[1], 50);
graphics.endFill();
//app.stage.addChild(graphics);


// wohin anwendung abgestürzt?
// kontrollieren verschwinden: innere sehr dominant jetzt wo alles über horizont geht 
// -> hier wieder nur bis kreis bewegen + irgendwie auf betrachter zu
// code schatten! (projektion scheiben aus anderem winkel auf andere fläche -> 2d koordinaten dann wiederum 3d auf sichtebene)
// control speed better <-> starker unterschied erster und zweiter klick

// kreise sind untereinander verknüpft (immer innen mit aussen, weil ja unterschiedliches tempo)

// sound:
// attack und aufteilung verblassung
// verknüfung so richtig? was mit nicht mehr hörbaren kreisen -> müssten resettet werden
// sound rund machen -> connection in audio übersetzen -> connection raum gerade gut?
// weitere verknüpfung mit optik (gross = tiefer)
// modelliere evtl. pfad, schlangenlinien und in lfo übersezten
// freischalten: hintergrund loop?, "this is our connection" sample
// räumliche effekte

// pattern: timing kontrollieren (mindestabstand chords untereinander, obertöne offbeat)

// bonus: leichte variation der farben je nach ton, add randomnes, verblassen