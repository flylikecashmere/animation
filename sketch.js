
checkFps = true;

// load initialization script
fpsMeter = loadFps(checkFps)

// change color on double click
var col_int = 0;
var blobBounce = true;

// canvas setup
const size_fl =  window.innerWidth // size in x-direction
const rat_fl = window.outerHeight/window.innerWidth; // factor for size in y-direction

const size = {x: size_fl, y: size_fl*rat_fl}

// constant time (in s) 
const tCons_arr = [0.025, 4, 8]
const interTracker_obj = new interTracker(tCons_arr)

// control y-movement
const ySinShr_fl = 0.5
const yNoiDev_fl = 0.2

app = startCanvas() 

// control colors
window.addEventListener('keydown', (event) => {
  if (event.key === "ArrowDown") {
    col_int = 1;
  } else if (event.key === "ArrowUp") {
    col_int = 0;
  }
});

hammer.on("panleft", function(ev) {
  if (col_int == 0) {
    col_int = 1;
  } else {
    col_int = 0;
  }  
});

// prepare large number of blobs and put into single object
let crcStr_int = 400;
let crcStr_arr = new Array(crcStr_int);
let rad_arr = new Array(crcStr_int);

// create dictionary for grouping colors
assCol_dic = groupNumbers(colorBlob_arr.length,crcStr_int)
revAssCol_dic = revDic(assCol_dic)

// design of blobs
let iFront_int = 40
let iTail_int = 40

for (let i = 0; i < crcStr_arr.length; i++) {
  // compute and save radius
  const rnd_fl = jStat.poisson.sample(4)
  let rad_fl = 1/(1.618 ** 10) * rnd_fl/4 * size_fl
  rad_arr[i] = rad_fl
  // select color scheme
  color_arr = colorBlob_arr[revAssCol_dic[i]]
  // create blob
  crcStr_arr[i] = createBlob(iFront_int, rad_fl, tCons_arr[1]*linInter(rnd_fl/10,1.618,0.618), iTail_int/iFront_int, color_arr)
}

allBlobs = new stageManager(crcStr_arr, [], assCol_dic)

var elaTs_fl = 0.0

app.ticker.add(() => {

  deltaTs_fl = PIXI.Ticker.shared.elapsedMS / 1000

  // move active blobs
  for (let i = 0; i < allBlobs.active.length; i++) {
    allBlobs.elements[allBlobs.active[i]].move(deltaTs_fl)
  }

  // update time
  inter_arr = interTracker_obj.updateTracker(deltaTs_fl)
  // change bounce setting
  if (inter_arr[1]) {
    if (blobBounce) {
      blobBounce = false
    } else {
      blobBounce = true
    }
  }
   
  elaTs_fl += deltaTs_fl

  // spawn new blob
  if (inter_arr[0]) {
   
    next_int = allBlobs.activateNext(col_int)
    
    if (typeof next_int !== "undefined") {
      // set reference frame
      ele = allBlobs.elements[next_int]
      ele.refT = elaTs_fl + 0.8 * size.x / ele.speed
      // set y-position
      yRel_fl = sinPlusRnd(interTracker_obj.passedInter(1),ySinShr_fl,yNoiDev_fl)
      ele.container.y = 2 * rad_arr[next_int] + ( size.y - 4 * rad_arr[next_int] )  * yRel_fl
    }
  }

  // get blobs eligible for an update
  var relAct_arr = allBlobs.active.filter(i => allBlobs.elements[i].refT < elaTs_fl)
  if (blobBounce) {
    // get blobs that touch border    
    var touch_arr = relAct_arr.filter((i) => checkBounds(allBlobs.elements[i].container,[["x","up"],["x","low"]],"touch"));
    // loop over blobs touching boundary
    for (let i = 0; i < touch_arr.length; i++) {
      ele = allBlobs.elements[touch_arr[i]]
      // reverse direction of blob
      ele.reverseDir()
      // get internal axis for mirror
      if (ele.container.x  + ele.container.width > size.x) { 
        var delta_fl = ele.container.children[0].x + ele.container.width/2 // right exit
      } else { 
        var delta_fl = ele.container.children[iFront_int*2 - 1].x + ele.container.width/2 // left exit
      }
      // mirror blob
      for (let j = 0; j < ele.container.children.length; j++) {
        mirror(ele.container.children[j],[delta_fl,0],[delta_fl,size.y])
      }
      // update reference time
      ele.refT = elaTs_fl + 0.8 * size.x / ele.speed
    }
  } else {
    // get blobs that exited frame
    var out_arr = relAct_arr.filter((i) => checkBounds(allBlobs.elements[i].container,[["x","up"]],"out"));
    // deactivate blobs and move to the right again
    allBlobs.deactivate(out_arr)
    for (let i = 0; i < out_arr.length; i++) {
      var ele = allBlobs.elements[out_arr[i]]
      ele.shift(- ele.container.x,0);
    }
  }

  if (checkFps) {
    fpsMeter.tick();
  }
  
});