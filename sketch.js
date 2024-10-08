
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
const thrs_arr = [0.15, 0.15 * Math.pow(1.618,1), 0.15 * Math.pow(1.618,3)] // start radius for inner spawning, threshold for outer spawning, start radius for outer spawing
const relSpeed_arr = [1.0, 2.0] // relative speed indicator for inner and outer section
const radRatio_fl = 1 / 1.618 // ratio of outer-to-inner radius


// canvas setup
const size_fl =  window.innerWidth // size in x-direction
const rat_fl = window.outerHeight/window.innerWidth; // factor for size in y-direction

const size = {x: size_fl, y: size_fl*rat_fl}
const dia_fl = Math.sqrt(size.x * size.x + size.y * size.y)


// camera position and angle
const light1_vec = [768, 400, 300]
const floor_vec = [0, size.y * 0.9, 0]
const view_proj = new projData([size.x * 0.5, size.y * (1 - Math.pow(1.618,-6))], [- Math.PI / 128 * 0, 0.0, 0.0])

// maximum and minimum distance of object from viewer
const disExt_vec = [300, 3000]
const frmRate_int = 32;


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





// 1) schatten (define a projection as an object, use as input for projPlane -> schachtel mit anderer funktion)
// get correct x position -> get correct radius
// Problem: points are right, but radius computation is not -> problem is norm vectors -> i need to get new points from new norm vectors in second step of projection
// 2) anpassung winkel innen / aussen etc.
// 3) steuere framerate variabel
// 4) überlege verknüpfung der kreise für späteren sound effekt
// 5) mache arrangement rund (grösse, tempo etc.), muss noch nicht final, auch noch keine einschränkung gleichzeitigkeit


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





/*
// plot lines and lightsource as a point for orientation

let test_vec = projToPlane(light1_vec, view_proj);
graphics.beginFill("red");
graphics.drawCircle(test_vec[0], test_vec[1], 5);
graphics.endFill();


let x_arr = [0, size.x];
let y_arr = [0, size.y];

for (let x of x_arr) {
  for (let y of y_arr) {

    // project start and end point
    let p1_vec = projToPlane([x, y, disExt_vec[0]], view_proj)
    let p2_vec = projToPlane([x, y, disExt_vec[1]], view_proj)
    
    // draw line
    let line1 = new PIXI.Graphics();
    app.stage.addChild(line1);
    line1.lineStyle(2.0, 0xffffff).moveTo(p1_vec[0], p1_vec[1]).lineTo(p2_vec[0], p2_vec[1]);
  }
}
*/