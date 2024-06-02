
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
    this.crc = [new PIXI.Graphics(), new PIXI.Graphics()]; // graphic object
    this.startDraw = false; // is circle currently being drawn?
    this.repDraw = false; // should circle be repeated?
    this.clcElp = 0; // time per repetition of circle in s
    this.color = ["#F00000", "#F00000"]

    // create synth
    this.synth = new Tone.FMSynth().toDestination();
  }
  
  growCircle(rad_fl, rel1_fl, rel2_fl, rel3_fl, sp_fl) {

    rad_fl += sp_fl * (1 - transferLogScale(rel1_fl, 2.718)); // increase radius

    var base_fl = Math.pow(2.718,5) // controls exponential increase and decrease
    var swt_fl = Math.pow(2.718,-2) // share of increase

    if (rel2_fl < swt_fl) {
      var trans_fl = (Math.pow(base_fl, rel2_fl) - 1) / (Math.pow(base_fl, swt_fl) - 1)
    } else {
      var trans_fl = (Math.pow(base_fl, 1 - rel2_fl) - 1) / (Math.pow(base_fl, 1 - swt_fl) - 1)
    }

    // draw new circle 
    this.crc[0].clear();
    this.crc[0].beginFill(this.color[0], trans_fl); // Color for the outer ring
    this.crc[0].drawCircle(this.pos.x, this.pos.y, rad_fl);
    this.crc[0].endFill();
    
    this.crc[1].clear();
    if (rel3_fl > 0) {
      var subRad_fl = Math.sin(rel3_fl * 2 * Math.PI)
      this.crc[1].beginFill(this.color[1],  1/2.718 * transferExpScale(1 / Math.pow(2.718,8) * (1 - trans_fl) + (1 - 1 / Math.pow(2.718,8)) * (1 - 0.5 * (1 + subRad_fl)), Math.pow(2.718,8)) ) ; // Color for the outer ring
      this.crc[1].drawCircle(this.pos.x, this.pos.y, transferLogScale(rel2_fl, Math.pow(2.718,1)) * rad_fl * ((1 - 1 / 2.718) + 1 / 2.718 * subRad_fl));
      this.crc[1].endFill();
    } else {
      this.crc[1].beginFill(this.color[1], trans_fl); // Color for the outer ring
      this.crc[1].drawCircle(this.pos.x, this.pos.y, rad_fl / 2.718);
      this.crc[1].endFill();
    }


    return rad_fl
  }

  startCircle(x_fl, y_fl) {
    const clcStrt_time = Date.now() / 1000;
    this.startDraw = true;
    for (let i = 0; i < this.crc.length; i++) {
      this.crc[i].clear();
    }
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
    for (let i = 0; i < this.crc.length; i++) {
      this.crc[i].pivot.set(this.pos.x, this.pos.y);
      this.crc[i].position.set(this.pos.x, this.pos.y);
      app.stage.addChild(this.crc[i]);
    }

    this.color = randEle(color_arr)
  
    // add to stage 
   
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
        for (let i = 0; i < this.crc.length; i++) {
          this.crc[i].clear();
        }
        clearInterval(ani1_obj);
      } else {
        rad_fl = this.growCircle(rad_fl, this.clcElp / maxElp_fl, this.clcElp / maxElp_fl, -1, scale_fl)
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
    var share3_fl;
    
    if (this.repDraw) {
      // wait for start of animation
      const waitForStart_obj = setInterval(() => {
        
        pass_boo = track_obj.updateTracker(Date.now() / 1000,[1])[1]
        
        if (pass_boo) {
          
          clearInterval(waitForStart_obj); // Stop checking

          // do repeated animation
          var playSound_boo = true;
          var loop_time = Date.now() / 1000;
          var tot_time = Date.now() / 1000;
          const ani2_obj = setInterval(() => {
            // grow circle
            itr_time = Date.now() / 1000 - loop_time
            scaRad_fl = (1 - transferExpScale(cnt_int / rep_int, Math.pow(2.718,2))) * scale_fl
            share3_fl = (Date.now() / 1000 -  tot_time) / (this.clcElp)
            rad_fl = this.growCircle(rad_fl, itr_time / maxElp_fl, itr_time / this.clcElp, share3_fl -  Math.floor(share3_fl), scaRad_fl)

            // update counter if repetition has passed
            if (this.clcElp < itr_time) {
              cnt_int += 1;
              playSound_boo = true;
              loop_time = Date.now() / 1000;
              rad_fl = 0.0;
            }

            // finish animation when repetition number is reached
            if (cnt_int == rep_int) {
             
              for (let i = 0; i < this.crc.length; i++) {
                this.crc[i].clear();
              }

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