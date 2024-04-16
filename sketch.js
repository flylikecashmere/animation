
checkFps = false;

// load initialization script
fpsMeter = loadFps(checkFps)

// setup parameters
const maxElp_fl = 4000 // in milliseconds
const minElp_fl = 250
const parCrc_int = 20 // number of circles that can be displayed at the same time

// canvas setup
const size_fl =  window.innerWidth // size in x-direction
const rat_fl = window.outerHeight/window.innerWidth; // factor for size in y-direction

const size = {x: size_fl, y: size_fl*rat_fl}

// constant time (in s) 
const tCons_arr = [0.025, 2, 8]

app = startCanvas() 


let aniCircle_arr = new Array(parCrc_int);

for (let i = 0; i < aniCircle_arr.length; i++) {
  aniCircle_arr[i] = new aniCircle()
}

let act_int = 0;

window.addEventListener('mousedown', (event) => {

  aniCircle_arr[act_int].startCircle(event.clientX, event.clientY)
  //aniCircle_arr[act_int].synth.triggerAttackRelease("C2", "8n")
});

hammer.on("panstart", function(event) {
  aniCircle_arr[act_int].startCircle(event.gesture.center.pageX, event.gesture.center.pageY)
  //app.renderer.backgroundColor = 0xCCCCCC;
  //synth.context.resume();
  //aniCircle_arr[act_int].synth.triggerAttackRelease("C2", "8n")
});

/*
hammer.on("tap", function(event) {
  //aniCircle_arr[act_int].startCircle(event.clientX, event.clientY)
  app.renderer.backgroundColor = 0xCCCCCC;
});
*/

window.addEventListener('mouseup', (event) => {

  aniCircle_arr[act_int].repeatCircle()
  
  // update counter of next circle
  if (act_int + 1 < parCrc_int) {
    act_int = act_int + 1
  } else {
    act_int = 0
  }
  
});

hammer.on("panend", function(event) {

  aniCircle_arr[act_int].repeatCircle()
  
  // update counter of next circle
  if (act_int + 1 < parCrc_int) {
    act_int = act_int + 1
  } else {
    act_int = 0
  }
  //app.renderer.backgroundColor = 0xFF0000;
  
});

// fixes: iOS support (position kreis,, sound), code aufräumen (was aus alten funktionen übernehmen?/archivieren)
// was für dauer überlegen (mindestwiederholungen + zeitabhängigen teil?)
// code verbessern: mehr wrappen, frage chatgpt
// actual design (modulation des vortons, andere eigenschaften je nach position (bass in der mitte, reverb etc))
// weiter: sachen sukzessive freischalten -> am ende "this is our connection" sample