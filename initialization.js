
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

// function to switch to fullscreen
function toggleFullscreen() {
    if (!document.fullscreenElement) {
        app.view.requestFullscreen();
    } else {
        document.exitFullscreen();
    }
}

function startCanvas() {    

    // create canvas
    const app = new PIXI.Application({
        background: '#000000',
        width: size.x,
        height: size.y
    });
    document.body.appendChild(app.view);
  
  // toogle fullscreen on click
  app.view.addEventListener('click', (event) => {
    if (event.button === 0) {
    toggleFullscreen();
    }
  });

  return app
}