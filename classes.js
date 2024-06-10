
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
    this.colorId = -1;
    this.color = ["#F00000", "#F00000"]
    this.next = -1;
    this.chord = "C4";

    // create synth
    var synthJSON = {
      "harmonicity": 2.0, // ratio of the two frequencies (modulator to carrier)
      "modulationIndex": 1.0,
      "oscillator": {
        "type": "sine" // type of the carrier oscillator
      },
      "modulation": {
        "type": "square" // type of the modulator oscillator
      },
      "envelope": {
        "attack": 0.2,
        "decay": maxElp_fl - 0.2,
        "sustain": 0.0,
        "release": 0.0
      },
      "modulationEnvelope": {
        "attack": 0.1,
        "decay": 0.2,
        "sustain": 1.0,
        "release": 0.0
      }
    };
    this.synth = new Tone.FMSynth(synthJSON).toDestination();
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
    
    var color_str = interpolateHex(this.color[0], this.color[1], transferLogScale(trans_fl, Math.pow(2.718,2.0)))
    // draw new outer circle 
    this.crc[0].clear();
    this.crc[0].beginFill(color_str, trans_fl); // Color for the outer ring
    this.crc[0].drawCircle(this.pos.x, this.pos.y, rad_fl);
    this.crc[0].endFill();
    
    this.crc[1].clear();
    if (rel3_fl > 0) { // asynchron movement towards main cycle in repetition
      var subRad_fl = Math.sin(rel3_fl * 2 * Math.PI)
      this.crc[1].beginFill(color_str,  1 / 2.718 * transferExpScale(1 / Math.pow(2.718, 8) * (1 - trans_fl) + (1 - 1 / Math.pow(2.718,8)) * (1 - 0.5 * (1 + subRad_fl)), Math.pow(2.718,4)) ) ; // Color for the outer ring
      this.crc[1].drawCircle(this.pos.x, this.pos.y, transferLogScale(rel2_fl, Math.pow(2.718,1)) * rad_fl * ((1 - 1 / 2.718) + 1 / 2.718 * subRad_fl));
      this.crc[1].endFill();
    } else { // simple increase on creation
      this.crc[1].beginFill(color_str, trans_fl); //
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



    // set position and color
    for (let i = 0; i < this.crc.length; i++) {
      this.crc[i].pivot.set(this.pos.x, this.pos.y);
      this.crc[i].position.set(this.pos.x, this.pos.y);
      app.stage.addChild(this.crc[i]);
    }

    this.colorId = cnt_int % color_arr.length
    this.color = color_arr[this.colorId]
    var note_arr = chord_arr[cnt_int % chord_arr.length]
    this.note = note_arr[chordCnt_dic[cnt_int % chord_arr.length] % note_arr.length]
  
    // let circle grow
    var rad_fl = 0.0;
    const ani1_obj = setInterval(() => {
      this.clcElp = (Date.now() / 1000 - clcStrt_time);

      // check if minimum time is met
      if (this.clcElp > minElp_fl && !this.repDraw){
        this.synth.triggerAttack(this.note)
        this.repDraw = true;
      }
    
      // stop the animation when time limit is reached or drawing stops but not before time minimum
      if (this.clcElp >= maxElp_fl || !this.startDraw) {
        // check if minimum time to repeat is met
        for (let i = 0; i < this.crc.length; i++) {
          this.crc[i].clear();
        }
        this.synth.triggerRelease()
        clearInterval(ani1_obj);
      } else {
        rad_fl = this.growCircle(rad_fl, this.clcElp / maxElp_fl, this.clcElp / maxElp_fl, -1, scale_fl)
      }
    }, 16); // animation intervall
  }

  getRelShare() {
    if (this.next == -1) {
      var share3_fl = (Date.now() / 1000 -  this.tot_time) / this.clcElp
    } else {
      var share3_fl = (Date.now() / 1000 -  aniCircle_arr[this.next].tot_time) / (aniCircle_arr[this.next].clcElp)
    }
      
    return share3_fl -  Math.floor(share3_fl)
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

    // adjust synth
    this.synth.envelope.decay = this.clcElp;
    
    if (this.repDraw) {
      // wait for start of animation
      const waitForStart_obj = setInterval(() => {
        
        pass_boo = track_obj.updateTracker(Date.now() / 1000,[1])[1]
        
        if (pass_boo) {
          clearInterval(waitForStart_obj); // Stop checking
          
          // do repeated animation
          var playSound_boo = true;
          var loop_time = Date.now() / 1000;
          this.tot_time = Date.now() / 1000;
          
          const ani2_obj = setInterval(() => {


            // grow circle
            itr_time = Date.now() / 1000 - loop_time
            scaRad_fl = (1 - transferExpScale(cnt_int / rep_int, Math.pow(2.718,2))) * scale_fl

            // change sound
            this.synth.modulationIndex.value = 10.0 * this.getRelShare();
            
            
            rad_fl = this.growCircle(rad_fl, itr_time / maxElp_fl, itr_time / this.clcElp, this.getRelShare(), scaRad_fl)

            // play sound
            if (playSound_boo && itr_time / this.clcElp > 0.05 ) {
              var velo_fl = 1 - cnt_int / rep_int
             
              this.synth.triggerAttackRelease(this.note, this.clcElp, "+0.0", velo_fl);
              playSound_boo = false;
            }

            // update counter if repetition has passed
            if (this.clcElp < itr_time) {
              cnt_int += 1;
              loop_time = Date.now() / 1000;
              rad_fl = 0.0;
              playSound_boo = true;
            }

            // finish animation when repetition number is reached
            if (cnt_int == rep_int) {
              for (let i = 0; i < this.crc.length; i++) {
                this.crc[i].clear();
              }
              clearInterval(ani2_obj);
            }
          }, 16); // animation intervall
        }      
      }, 16); // animation intervall
    }
  } 
}

function checkDist(lastPos_dic, curPos_dic) {
  dist_fl = Math.pow(Math.pow(lastPos_dic.x - curPos_dic.x, 2) + Math.pow(lastPos_dic.y - curPos_dic.y, 2), 0.5)
  dia_fl = Math.pow(Math.pow(size.x, 2) + Math.pow(size.y, 2), 0.5)
  if (dist_fl > dia_fl / 2.718 / 2.718) {
    cnt_int = cnt_int + 1
  }
}
