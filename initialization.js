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

// create hammer instances
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
    window.addEventListener('dblclick', (event) => {toggleFullscreen();Tone.start();});  
    hammerManager.on("dbltap", function(ev) {toggleFullscreen();Tone.start();});

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
	app.renderer.resize(window.innerWidth, window.innerHeight);
    const size = {x: window.innerWidth, y: window.innerHeight}
}

// #endregion

// #region prevent default behaviour of touch events

window.addEventListener('touchstart', function(event) {
    e.preventDefault();
});

window.addEventListener('touchmove', function(evente) {
    e.preventDefault();
});

window.addEventListener('touchend', function(event) {
    e.preventDefault();
});

// #endregion