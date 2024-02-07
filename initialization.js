// load fps tracker
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

// create a simple instance
var hammer = new Hammer(document);

// let the pan gesture support all directions
hammer.get('pan').set({ direction: Hammer.DIRECTION_ALL });

// define double-tap
var doubleTap = new Hammer.Tap({
    event: 'dbltap',
    taps: 2
  });
  
// add the recognizer to the manager
hammer.add(doubleTap);

// define user agent as global variable
var userAgent = navigator.userAgent.toLowerCase();

function startCanvas() {    

    // create canvas
    const app = new PIXI.Application({
        background: '#000000',
        width: size.x,
        height: size.y
    });
    document.body.appendChild(app.view);
  
    // toogle fullscreen on any action
    window.addEventListener('dblclick', (event) => {toggleFullscreen()});
    hammer.on("panleft", function(ev) {toggleFullscreen();});

    return app
}

// switch to fullscreen
function toggleFullscreen() {
    if (isSafari()) {
        if (mobileDevice()) { // iPhone or iPad
            app.view.requestFullscreen();
        } else { // iMac
            document.documentElement.webkitRequestFullscreen();
        }  
    }
}

// resize when frame size changes
window.addEventListener('resize', resize);

function resize() {
	app.renderer.resize(window.innerWidth, window.innerHeight);
}

// brower detection
function isSafari() {
    var isSafari = /constructor/i.test(window.HTMLElement) || (function (p) { return p.toString() === "[object SafariRemoteNotification]"; })(!window['safari'] || (typeof safari !== 'undefined' && safari.pushNotification));
    return isSafari
}


// device detection
function mobileDevice() {
    if(userAgent.includes("mobi") || userAgent.includes("tablet")){
       return true;
    }
    if(userAgent.includes("android")) {
       if(window.height > window.width && window.width < 800) {
          return true;
       }
       if(window.width > window.height && window.height < 800) {
          return true;
       }
    }
    return false;
 }