// #region initialize fps tracker

function loadFps(checkFps) {
    if (checkFps) {
        const fpsMeter = new FPSMeter({
        heat: 1,
        graph: 0,
        zIndex: 100,
        position: 'absolute',
        bottom: '10px',
        right: '10px',
        theme: 'transparent',
        toggleOn: null});
        return fpsMeter
    }
}

// #endregion

// #region initialize hammer (= tracks swipes)

// screate hammer instances
var hammer = new Hammer(document);
var hammerManager = new Hammer.Manager(document);

// let the pan gesture support all directions
hammer.get('pan').set({ direction: Hammer.DIRECTION_ALL });

// define double-tap
var doubleTap = new Hammer.Tap({
    event: 'dbltap',
    taps: 2
});
  
// add the recognizer to the manager
hammerManager.add(doubleTap);

// #endregion

// #region load audio

var loop_mp3 = new Howl({src: ["media/loop.mp3"], loop: true, volume: 1.0})
var pad1_mp3 = new Howl({src: ["media/pad1.mp3"], loop: false, volume: 0.5})
var pad2_mp3 = new Howl({src: ["media/pad2.mp3"], loop: false, volume: 0.5})

// #endregion


// #region controll playing of sound
var startSound_boo = false;

// event listeners to start sound
window.addEventListener('dblclick', (event) => {startSound()});  
hammerManager.on("dbltap", function(ev) {startSound();});

var start_tm = 0;

// start sound on first user interaction
function startSound(event) {
    if (!startSound_boo) {
        loop_mp3.play();
        startSound_boo = true;
        start_tm = new Date().getTime();
        console.log("hallo")
    }
}

// play sound on taps in left or right half
window.addEventListener("click", function(event) {
    var cur_tm = new Date().getTime();
    console.log(cur_tm - start_tm)
    if (startSound_boo && cur_tm - start_tm > 10) {
        if (event.clientX  < size.x / 2) {
            pad1_mp3.play()
        } else {
            pad2_mp3.play()
        }
    }
});

hammer.on("tap", function(event) {
    var cur_tm = new Date().getTime();
    if (startSound_boo && cur_tm - start_tm > 10) {
        if (event.center.x  < size.x / 2) {
            pad1_mp3.play()
        } else {
            pad2_mp3.play()
        }
    }
});



// #endregion

// #region initialize canvas with fullscreen and resizing

function startCanvas() {    

    // create canvas
    const app = new PIXI.Application({
        background: '#000000',
        width: size.x,
        height: size.y
    });
    document.body.appendChild(app.view);
  
    // toogle fullscreen
    window.addEventListener('dblclick', (event) => {toggleFullscreen()});  
    hammerManager.on("dbltap", function(ev) {toggleFullscreen();});

    return app
}

// switch to fullscreen
function toggleFullscreen() {
    if (document.documentElement.requestFullscreen) { // mozilla
        document.documentElement.requestFullscreen();
    } else if (document.documentElement.webkitRequestFullscreen) { // safari
        document.documentElement.webkitRequestFullscreen();
    } else if (elem.msRequestFullscreen) { // ie11
        document.documentElement.msRequestFullscreen();
    }
}

// resize when frame size changes
window.addEventListener('resize', resize);

function resize() {
    // re-size renderer
	app.renderer.resize(window.innerWidth, window.innerHeight);
    // update size object
    size = {x: window.innerWidth, y: window.innerHeight}
}

// #endregion

// #region show message for fullscreen

// define user agent as global variable
var userAgent = navigator.userAgent.toLowerCase();

// get message element
var message = document.getElementById('message');


// show device specific message
if (/iPhone|iPod/i.test(userAgent)) { // iPhone (no full screen support)
    if (window.matchMedia("(orientation: portrait)").matches) {
        message.textContent = "Hold horizontally";
    } else {
        message.textContent = "";
    }
} else if (/Android/i.test(userAgent) || /Windows Phone/i.test(userAgent) || (navigator.userAgent.match(/Mac/) && navigator.maxTouchPoints && navigator.maxTouchPoints > 2)) { // other mobile devices
    if (window.matchMedia("(orientation: portrait)").matches) {
        message.textContent = "Double-tap for fullscreen and hold horizontally";
    } else { // desktop computer
        message.textContent = "Double-tap for fullscreen";
    }
} else {
    message.textContent = "Double-click for fullscreen";
}


// #endregion




