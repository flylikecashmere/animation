
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
    this.pos = [0.0, 0.0, 0.0]
    this.dir = [0.0, 0.0, 1.0]
    this.ang = 0.0;
    this.rad = 0.0;
    this.maxStep = 0;
    this.crc = [new PIXI.Graphics(), new PIXI.Graphics()]; // graphic objects
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
  
  growCircle(rad_fl, rel1_fl, rel2_fl, rel3_fl) {

    // move disk
    var curPos_vec = addVec(this.pos, scalarMulti(this.dir, - transferLogScale(rel1_fl, Math.pow(2.718, 2)) * this.maxStep))
    if (rel2_fl < 0.5) {
      var trans_fl = transferLogScale(rel2_fl / 2.718, Math.exp(2.718,4))
    } else{
      var trans_fl = transferExpScale((1 - rel2_fl) / 2.718, Math.exp(2.718,2))   
    }
   
    var color_str = interpolateHex(this.color[0], this.color[1], transferLogScale(rel2_fl, Math.pow(2.718,1.0)))

    // draw new outer circle 
    this.crc[0].clear();
    plotDisk(this.crc[0], curPos_vec, rad_fl, this.dir, color_str, trans_fl)
    plotDisk(this.crc[1], curPos_vec, rad_fl, this.dir, color_str, trans_fl)

  }

  startCircle(x_fl, y_fl) {


    const clcStrt_time = Date.now() / 1000;
    this.startDraw = true;
    for (let i = 0; i < this.crc.length; i++) {
      this.crc[i].clear();
    }

    this.maxStep = (disExt_vec[1] - disExt_vec[0]) / this.dir[2]
    
    // direction is from camera position to click position and maximum to minimum distance
    var projDir_arr = projToPlane([x_fl, y_fl, disExt_vec[1]])
    this.dir = normalize([camPos_vec[0] - projDir_arr[0], camPos_vec[1] - projDir_arr[1], disExt_vec[1] - disExt_vec[0]])

    // get start position, angle, and radius
    var projCam_arr = projToPlane([camPos_vec[0], camPos_vec[1], disExt_vec[1]])
    var projDir_arr = normalize([x_fl - projCam_arr[0], y_fl - projCam_arr[1], 0])
   

    this.ang = getAng(x_fl, y_fl)
    
    // get characteristics based on positiona ang angle
    this.rad = radLinInter(this.ang, radAng_arr)
    this.pos = addVec([camPos_vec[0], camPos_vec[1], disExt_vec[1]], scalarMulti(projDir_arr, this.rad / Math.PI))
    
    // adjust tone

    // set position and color
    for (let i = 0; i < this.crc.length; i++) {
      app.stage.addChild(this.crc[i]);
    }

    this.colorId = cnt_int % color_arr.length
    this.color = color_arr[this.colorId]
    var note_arr = chord_arr[cnt_int % chord_arr.length]
    this.note = note_arr[chordCnt_dic[cnt_int % chord_arr.length] % note_arr.length]
  
    // let circle grow
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
      } else  {
        this.growCircle(this.rad, this.clcElp / maxElp_fl, this.clcElp / maxElp_fl, -1)
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
            //this.synth.modulationIndex.value = 10.0 * this.getRelShare();
            this.growCircle(this.rad, itr_time / maxElp_fl, itr_time / this.clcElp, this.getRelShare())
            

            // play sound
            if (playSound_boo && itr_time / this.clcElp > 0.05 ) {
              var velo_fl = 1 - cnt_int / rep_int
             
              this.synth.triggerAttackRelease(this.note, this.clcElp, "+0.0", velo_fl);
              playSound_boo = false;
            }

            // update counter if repetition has passed
            if (this.clcElp < itr_time) {
              this.crc[1].clear();
              cnt_int += 1;
              loop_time = Date.now() / 1000;
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
