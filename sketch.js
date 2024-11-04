
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
const trans_arr  = [0.2, 0.02] // minimum transparency and distance dependant component

// setup parameters - inner and outer section
const thrs_arr = [0.2, 0.2 * Math.pow(1.618,1)] // start radius for inner spawning, threshold for outer spawning, start radius for outer spawing
const relSpeed_arr = [1.0, 2.0] // relative speed indicator for inner and outer section
const radRatio_fl = 1 / 1.618 // ratio of outer-to-inner radius


// canvas setup
const size_fl =  window.innerWidth // size in x-direction
const rat_fl = window.outerHeight/window.innerWidth; // factor for size in y-direction

const size = {x: size_fl, y: size_fl*rat_fl}
const dia_fl = Math.sqrt(size.x * size.x + size.y * size.y)

console.log(size)
// focal length and ploting threshold 
const disExt_vec = [500, 2000]

// camera position and angle in global coordinates
const view_proj = new projData([0.5 * size.x, 0.9 * size.y,  0], [Math.PI / 64, 0.0, 0.0])

// light position and reflection plane
const light1_vec = [0.5 * size.x,  - size.y, 500]
const floor_vec = [0, size.y, 0]

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

 

// 1) steuer ende korrekt
// 2) clean-up: welche funktionen noch relevant? wo besser math, als meine funktionen?
// 3) mache arrangement rund (grösse, tempo variabel? etc.), muss noch nicht final, auch noch keine einschränkung gleichzeitigkeit, sinus bewegung in x und y richtung?
// 3a) überlege verknüpfung der kreise für späteren sound effekt
// 3b) steuere framerate variabel


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
graphics = new PIXI.Graphics()

let camTest_vec = convertCamCord([0.25 * size.x, 0.25 * size.y,  disExt_vec[0]], view_proj)

for (let l of [-20, -10, -2, -1, 1, 2, 10, 20]) {
  let test_vec = projectPoint(viewLine(camTest_vec, l, view_proj), view_proj);
  graphics.beginFill("red");
  //console.log(test_vec)
  graphics.drawCircle(test_vec[0], test_vec[1], 10);
  graphics.endFill();
}

app.stage.addChild(graphics);

//

let x_arr = [0, size.x];
let y_arr = [0, size.y];

for (let x of x_arr) {
  for (let y of y_arr) {

    //console.log("next corner")
    //console.log([x,y])
    //console.log(math.add(view_proj.pos, math.multiply(math.multiply(math.transpose(view_proj.rotMat), 1.0))))

    // get start and end point in 3d space
    let p1Raw_vec = math.add(view_proj.pos, math.multiply(math.multiply(math.transpose(view_proj.rotMat), 1.0), convertCamCord([x, y, disExt_vec[0]], view_proj)))
    let p2Raw_vec = math.add(view_proj.pos, math.multiply(math.multiply(math.transpose(view_proj.rotMat), 1.0), convertCamCord([x, y, disExt_vec[1]], view_proj)))

    //console.log(p1Raw_vec)
    //console.log(p2Raw_vec)

    // project start and end point
    let p1_vec = projectPoint(mat2arr(p1Raw_vec), view_proj)
    let p2_vec = projectPoint(mat2arr(p2Raw_vec), view_proj)
    
    //console.log(p1_vec)
    //console.log(p2_vec)
    
    // draw line
    let line1 = new PIXI.Graphics();
    line1.lineStyle(2.0, 0xffffff).moveTo(p1_vec[0], p1_vec[1]).lineTo(p2_vec[0], p2_vec[1]);
    app.stage.addChild(line1);

  }
}

*/


app.ticker.add(() => {
});

