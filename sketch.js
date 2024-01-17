
checkFps = true;

// load initialization script
fpsMeter = loadFps(checkFps)

// canvas setup
const size_fl =  window.innerWidth // size in x-direction
const rat_fl = window.outerHeight/window.innerWidth; // factor for size in y-direction
const frmRat_int = 60; // frames per second

const size = {x: size_fl, y: size_fl*rat_fl}

// constant time (in ms) and space constants
const tCons_arr = [0.25, 4, 16]

const interTracker_obj = new interTracker(tCons_arr)

// chance of bouncing
const chBounce_fl = 0.0

// control y-movement
const ySinShr_fl = 0.2
const yNoiDev_fl = 0.1

app = startCanvas() 

// prepare large number of blobs and put into single object
let crcStr_int = 200;
let crcStr_arr = new Array(crcStr_int);
let rad_arr = new Array(crcStr_int);

// desing of blobs
let iFront_int = 40

for (let i = 0; i < crcStr_arr.length; i++) {
  // compute and save radius
  const rnd_fl = jStat.poisson.sample(4)
  let rad_fl = 0.02 * rnd_fl/4 * size_fl
  rad_arr[i] = rad_fl
  // select color scheme
  color_arr = colorBlob_arr[i < crcStr_arr.length/2 ? 0 : 1]
  // create blob
  crcStr_arr[i] = createBlob(iFront_int, rad_fl, tCons_arr[1]*linInter(rnd_fl/8,0.7,1.3), 1.0, color_arr)
}

allBlobs = new stageManager(crcStr_arr, [])

var elaTs_fl = 0.0

app.ticker.add(() => {

  deltaTs_fl = PIXI.Ticker.shared.elapsedMS / 1000

  // move active blobs
  for (let i = 0; i < allBlobs.active.length; i++) {
    allBlobs.elements[allBlobs.active[i]].move(deltaTs_fl)
  }

  // update time
  inter_arr = interTracker_obj.updateTracker(deltaTs_fl)
  elaTs_fl += deltaTs_fl

  // spawn new blob
  if (inter_arr[0]) {
   
    next_int = allBlobs.activateNext()
    
    if (typeof next_int !== "undefined") {
        // set reference frame
      ele = allBlobs.elements[next_int]
      ele.refT = ele.refT + 0.8 * size.x / ele.speed
      // set y-position
      yRel_fl = sinPlusRnd(interTracker_obj.passedInter(0),ySinShr_fl,yNoiDev_fl)
      ele.container.y = 2 * rad_arr[next_int] + ( size.y - 4 * rad_arr[next_int] )  * yRel_fl
    }
  }

  // get blobs eligible for an update
  var relAct_arr = allBlobs.active.filter(i => allBlobs.elements[i].refT < elaTs_fl)
  if (false) {
    // get blobs that touch border
    var touch_arr = relAct_arr.filter((i) => checkBounds(allBlobs.container.getChildAt(i),[["x","up"],["x","low"]],"touch"));
    // loop over blobs touching boundary
    for (let i = 0; i < touch_arr.length; i++) {
      ele = allBlobs.elements[touch_arr[i]]
      // reverse direction of blob
      ele.reverseDir()
      // mirror blob
      mirX_fl = ele.x
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


// offen aktuell
// - fix mirror and bounce 
// - kontrolliere proportionen standardmäßig
// - mache github etc und setzte auch auf mac auf
// - staffelung der liniendicke
// - mache waagerechten linien mit kontrastfarben, linien bewegen sich "im walzertempo" -> triolisch zu einem vorhandenen rhytmus 
// - grundlage für oben und musik ("left alone" von epic dolphy)


// für komposition
// - wie eigenschaften auf input anpassen -> interface? midi? noise machine midi controller
// - sync mit musik? (sounds samples) -> gehe weiter zu 3d?

// nice bugs/ideen: 
// - variaton der liniendicke / anzahl
// - nur andeutungen von linien (passiert von y-werte für linien in spec. function 2x gleich)
// - diskret für y-position, radius/speed etc.
// - fast alle starten gleichzeitig
// - schweif fällt langsam nach unten (ggf. so regen und cloud artig) -> war aufgreten wenn shift auf ele nicht auf all in Zeile 66 (y-pos setzten)
// - random für y war in loop bei kreis erzeung -> diffuser sich bewegender nebel
// - unterschiedliche bewegungstempos für schweif -> "kondensstreifen"
// - lange zyklen über die sich parameter ändern (z.B. auch farbe)
// - mischung aus out und touch -> chance, dass elemente bildschirm auch verlassen

