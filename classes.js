


class aniCircle {
  constructor() {
    this.pos = {x: 0, y: 0}
    this.crc = new PIXI.Graphics(); // graphic object
    this.isDraw = false; // is circle currently being drawn?
    this.clcElp = 0; // time per repetition of circle
    this.col = "#F00000"

    // create synth
    this.synth = new Tone.FMSynth().toDestination();
  }

  startCircle(x_fl, y_fl) {
    const clcStrt_time = Date.now();
    this.isDraw = true;
    this.crc.clear();
    this.pos = {x: x_fl, y: y_fl}

    // adjust tone
    /*
    var synthJSON = {
      "harmonicity":10 * this.pos.x / size.x,
      "modulationIndex": 10 * this.pos.y / size.y,
      "oscillator" : {
          "type": "sine"
      },
      "envelope": {
          "attack": 0.001,
          "decay": 2,
          "sustain": 0.1,
          "release": 2
      },
      "modulation" : {
          "type" : "square"
      },
      "modulationEnvelope" : {
          "attack": 0.002,
          "decay": 0.2,
          "sustain": 0,
          "release": 0.2
      }
    }
    this.synth.set(synthJSON);
    */

    // set position and color
    this.crc.pivot.set(this.pos.x, this.pos.y);  
    this.crc.position.set(this.pos.x, this.pos.y);
    this.color = randEle(color_arr)
  
    // create new circle and add to stage 
    this.crc.beginFill(this.color, 1);
    this.crc.drawCircle(this.pos.x, this.pos.y, 40);
    this.crc.endFill();
    app.stage.addChild(this.crc);
  
    //this.synth.triggerAttackRelease("C2", "8n");
  
    // let circle grow
    var sca_fl = 1.0;
    const ani_obj = setInterval(() => {
    
      this.clcElp = Date.now() - clcStrt_time;
     
      // stop the animation when time limit is reached or drawing stops but not before time minimum
      if ((this.clcElp >= maxElp_fl || !this.isDraw) && (minElp_fl < this.clcElp)) {
        clearInterval(ani_obj);
      }
  
      sca_fl += 0.05;
      this.crc.scale.set(sca_fl);
      this.crc.alpha = 1/ ((sca_fl - 1) * 5);
    }, 16); // animation intervall
  }

  repeatCircle() {
    this.isDraw = false // abort growing of circle
    app.stage.removeChild(this.crc);

    // set position
    this.crc.pivot.set(this.pos.x, this.pos.y);  
    this.crc.position.set(this.pos.x, this.pos.y);
  
    // create new circle and add to stage
    this.crc.beginFill(this.color, 1);
    this.crc.drawCircle(this.pos.x, this.pos.y, 40);
    this.crc.endFill();
    app.stage.addChild(this.crc);

    // get starting time of re-drawing
    const reStrt_time = Date.now()
    
    // compute reptitions and create counter
    const rep_int = Math.floor(maxElp_fl * 3 / this.clcElp)
    var cnt_int = 0;
    var sca_fl = 1.0;
    const ani_obj = setInterval(() => {
  
      const reElp_time = Date.now() - reStrt_time;
  
      sca_fl += 0.025 + 0.025 * (1 - cnt_int / rep_int);
      this.crc.scale.set(sca_fl);
      this.crc.alpha = 1 / ((sca_fl - 1) * 5);
  
      // count repetitions
      if (cnt_int * this.clcElp < reElp_time) {
        sca_fl = 1.0;
        cnt_int += 1;
        // play sound at start of new repetition
        /* 
        const plyStrt_time = Tone.now()
        this.synth.triggerAttack("C2", plyStrt_time, 0.5 + 0.5 * (1 - cnt_int / rep_int))
        this.synth.triggerRelease(plyStrt_time + this.clcElp)
        */
      }
  
      // finish animation when repetition number is reached
      if (cnt_int == rep_int) {
        clearInterval(ani_obj);
        this.crc.clear()
      }
      
    }, 16); // animation intervall
  }
}