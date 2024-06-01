
class interTracker {
  constructor(tsInter_arr) {
    this.inter = tsInter_arr
    this.pass = new Array(tsInter_arr.length).fill(0);
    this.globalStart = Date.now() / 1000;
  }

  // update time-tracking
  updateTracker(pass_fl, check_arr) { // current time in seconds
    // update array of passed time
    let reSet_arr = new Array(this.inter.length).fill(false);
    // check if passed time exceeds interval
    for (let i = 0; i < check_arr.length; i++) {
      let newInt_int = Math.floor((pass_fl - this.globalStart) / this.inter[check_arr[i]])
      if (newInt_int > this.pass[check_arr[i]]) {
        this.pass[check_arr[i]] = newInt_int;
        reSet_arr[check_arr[i]] = true;
      }
    }
    return reSet_arr
  }

  getDecimal(in_fl) {
    return in_fl - Math.floor(in_fl);
  }

  // check relative share that has passed
  relativeInter(pass_fl, check_int) {
    return getDecimal((pass_fl - this.gloalbStart) / this.inter[check_int])
  }

}

class aniCircle {
  constructor() {
    this.pos = {x: 0, y: 0}
    this.crc = new PIXI.Graphics(); // graphic object
    this.startDraw = false; // is circle currently being drawn?
    this.repDraw = false; // should circle be repeated?
    this.clcElp = 0; // time per repetition of circle in s
    this.col = "#F00000"

    // create synth
    this.synth = new Tone.FMSynth().toDestination();
  }
  
  growCircle(rad_fl, rel1_fl, rel2_fl, sp_fl) {

    rad_fl += sp_fl * (1 - transferLogScale(rel1_fl, 2.718)); // increase radius

    var base_fl = Math.pow(2.718,5) // controls exponential increase and decrease
    var swt_fl = Math.pow(2.718,-2) // share of increase

    if (rel2_fl < swt_fl) {
      var trans_fl = (Math.pow(base_fl, rel2_fl) - 1) / (Math.pow(base_fl, swt_fl) - 1)
    } else {
      var trans_fl = (Math.pow(base_fl, 1 - rel2_fl) - 1) / (Math.pow(base_fl, 1 - swt_fl) - 1)
    }

    // draw new circle 
    this.crc.clear();

    this.crc.beginFill(0xFF0000, trans_fl); // Color for the outer ring
    this.crc.drawCircle(this.pos.x, this.pos.y, rad_fl);
    this.crc.endFill();
    

   /*
    for (let radRing = 0; radRing < rad_fl; radRing = radRing + 10.0) {
      // draw ring
      console.log(interpolateHex(color_arr[0], color_arr[1], radRing / rad_fl))
      this.crc.beginFill(0xFF0000, 1.0); // Color for the outer ring
      this.crc.drawCircle(this.pos.x, this.pos.y, radRing + 10.0);
      this.crc.endFill();
      
      // add hole
      //this.crc.beginHole();
      //this.crc.drawCircle(0, 0, radRing);
      //this.crc.endHole();

    }
    */
    //this.color = interpolateHex(color_arr[0],color_arr[1],1.0 - transferExpScale(rel2_fl,Math.pow(2.718,-3))) 
    //this.crc.beginFill(this.color, trans_fl);
    //this.crc.drawCircle(this.pos.x, this.pos.y, rad_fl);
    //this.crc.endFill();
     
    return rad_fl
  }

  startCircle(x_fl, y_fl) {
    const clcStrt_time = Date.now() / 1000;
    this.startDraw = true;
    this.crc.clear();
    this.pos = {x: x_fl, y: y_fl}

    // adjust tone
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
    this.synth.context.resume();

    // set position and color
    this.crc.pivot.set(this.pos.x, this.pos.y);
    this.crc.position.set(this.pos.x, this.pos.y);
    this.color = interpolateHex(color_arr[0],color_arr[1],1.0)
  
    // add to stage 
    app.stage.addChild(this.crc);
    this.synth.triggerAttackRelease("C2", "8n");
  
    // let circle grow
    var rad_fl = 0.0;
    const ani1_obj = setInterval(() => {
      this.clcElp = (Date.now() / 1000 - clcStrt_time);

      // check if minimum time is met
      if (this.clcElp > minElp_fl){
        this.repDraw = true;
      }
    
      // stop the animation when time limit is reached or drawing stops but not before time minimum
      if (this.clcElp >= maxElp_fl || !this.startDraw) {
        // check if minimum time to repeat is met
        this.crc.clear();
        clearInterval(ani1_obj);
      } else {
        rad_fl = this.growCircle(rad_fl, this.clcElp / maxElp_fl, this.clcElp / maxElp_fl, scale_fl)
      }
    }, 16); // animation intervall
  }

  repeatCircle(track_obj) {

    this.startDraw = false;

    // define characteristics of repetition
    const rep_int = Math.floor(minRep_int + transferExpScale((this.clcElp - minElp_fl) /  maxElp_fl, Math.pow(2.718,-4)) * maxRep_int)

    // create iteration variables
    var cnt_int = 0;
    var rad_fl = 0.0;
    var pass_boo = false;
    var itr_time;
    var scaRad_fl;
    
    if (this.repDraw) {
      // wait for start of animation
      const waitForStart_obj = setInterval(() => {
        
        pass_boo = track_obj.updateTracker(Date.now() / 1000,[1])[1]
        
        if (pass_boo) {
          
          clearInterval(waitForStart_obj); // Stop checking

          // do repeated animation
          var playSound_boo = true;
          var loop_time = Date.now() / 1000;
          const ani2_obj = setInterval(() => {
            // grow circle
            itr_time = Date.now() / 1000 - loop_time
            scaRad_fl = (1 - transferExpScale(cnt_int / rep_int, Math.pow(2.718,2))) * scale_fl
            rad_fl = this.growCircle(rad_fl, itr_time / maxElp_fl, itr_time / this.clcElp, scaRad_fl)

            // update counter if repetition has passed
            if (this.clcElp < itr_time) {
              cnt_int += 1;
              playSound_boo = true;
              loop_time = Date.now() / 1000;
              rad_fl = 0.0;
            }

            // finish animation when repetition number is reached
            if (cnt_int == rep_int) {
              this.crc.clear();
              clearInterval(ani2_obj);
            } else if (playSound_boo && itr_time / this.clcElp > 0.05) { // play sound
              playSound_boo = false;
              this.synth.triggerAttackRelease("C2", "8n");
            }
          }, 16); // animation intervall
        }      
      }, 16); // animation intervall
    }
  } 
}