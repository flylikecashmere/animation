
// #region //! animation clases

class beamAnimation {
 
  constructor(x_fl, y_fl) {

    // #region // ! set geometric properties

    console.log(y_fl)

    // set start position
    this.pos = imgPlaneToGlobal([x_fl, Math.min(yMax_fl * size.y, y_fl), disExt_vec[0]], disExt_vec[1], view_proj)

    // set direction
    this.dir = normalize([0.0, 0.0, 1.0])
  
    // get angle and relative distance from camera position
    this.ang = getAng(x_fl, y_fl)
    this.dis = magVec([x_fl - view_proj.pos[0], y_fl - view_proj.pos[1]]) / magVec([- view_proj.pos[0], - view_proj.pos[1]])

    this.rad = dia_fl * (rad_arr[0] + this.dis * rad_arr[1])

    // set speed and maximum steps
    this.speed = Math.pow(2.718, 2 * relSpeed_arr[0])
    this.maxStep = getMaxStepCircle(this.pos, this.dir, addVec(this.pos, scalarMulti(this.pos, thrs_arr[2] * dia_fl)))

    // #endregion

    // #region // ! furher declarations
    
    this.clcElp = 0; // time per repetition of circle in s
    this.next = -1; // id of connected circle
    this.doStart = true; // enables starting animation

    if (this.dis < thrs_arr[1]) { // inner circles
      this.track = 0
    } else { // outer circles
      this.track = 1
    }
    
    // #endregion

    // #region // ! create sound

    if (this.dis < thrs_arr[1]) { // inner circles
      
      this.note = chord_arr[aniCnt_int % chord_arr.length];

      this.synth = new Tone.PolySynth(Tone.DuoSynth, {
        voice0: {
          oscillator: { type: "sine" },  // Waveform for the first voice
          envelope: { attack: 0.4, decay: maxElp_fl, sustain: 0.0, release: 0.5 },
          volume: -6
        },
        voice1: {
            oscillator: { type: "square" }, // Waveform for the second voice
            envelope: { attack: 0.5, decay: maxElp_fl, sustain: 0.0, release: 0.2 },
            volume: -6
        },
        harmonicity: 1.5, // Frequency ratio between the two voices
        //vibratoAmount: 1.0,
        //vibratoRate: 1.0,
        volume: -6,       // Lower the overall volume
        })

      /*
      this.synth = new Tone.PolySynth(Tone.MonoSynth, {
        oscillator: { type: "square" }, // Waveform for the second voice
        envelope: { attack: 0.5, decay: maxElp_fl, sustain: 0.0, release: 1.2 },
        //vibratoAmount: 1.0,
        //vibratoRate: 1.0,
        volume: -6,       // Lower the overall volume
        envelope: { attack: 1.0, decay: maxElp_fl, sustain: 0.0, release: 0.05 },
        })
      */  

      this.filter = new Tone.Filter({
          type: 'lowpass',
          frequency: 500, 
          rolloff: -12, 
          Q: 1  
      });

      this.filterEnv = new Tone.Envelope({
        attack: 0.2,
        decay: 0.3,
        sustain: 1.0,
        release: 1.0,
      });

      this.filterEnv.connect(this.filter.Q);

      this.reverb = new Tone.Reverb({
        preDelay: 0.3,
        decay: 1.5,
        wet: 0.5
      });

      this.synth.connect(this.filter);
      this.filter.connect(this.reverb);
      this.reverb.connect(masterCompressor)
      //this.reverb.connect(masterCompressor);
      //this.synth.set({ volume: -10000 });

      /*
      this.synth = new Tone.PolySynth(Tone.Synth, {
        oscillator: {
          type: "triangle", // Square oscillator
        },
        envelope: { attack: 1.0, decay: maxElp_fl - 0.2, sustain: 0.0, release: 0.05 },
      });
      this.synth.toDestination()
      const reverb = new Tone.Reverb().toDestination();
      this.synth.connect(reverb);
      */
  
    } else { // outer circles
      this.note = note_arr[aniCnt_int % note_arr.length];

      this.synth = new Tone.MonoSynth({
        oscillator: {
          type: "square", // Square oscillator
        },
        filter: {
          type: "lowpass", // Lowpass filter
          frequency: 100, // Filter cutoff frequency
          rolloff: -12, // Roll-off slope (-12, -24, -48 dB/octave)
          Q: 1, // Resonance (quality factor)
        },
        envelope: {
          attack: 0.1, // Time for the note to reach full amplitude
          decay: 0.2, // Time for the note to drop to the sustain level
          sustain: 0.7, // Sustain level
          release: 0.5, // Time for the note to fade out after release
        },
        filterEnvelope: {
          attack: 0.1, // Filter envelope attack
          decay: 0.2, // Filter envelope decay
          sustain: 0.5, // Filter envelope sustain
          release: 0.3, // Filter envelope release
          baseFrequency: 300, // Starting frequency of the filter
          octaves: 2, // Range of the filter envelope
          exponent: 2, // Envelope curve (linear or exponential)
        },
      }).toDestination();
      this.synth.volume.value = -16;
      /*
      this.synth = new Tone.MonoSynth().toDestination();
      this.synth.set({
        envelope: {
            attack: 0.4,
            decay: maxElp_fl - 0.2,
            sustain: 0.0,
            release: 0.0
        }
      });
      */
      
    }

    // #endregion

    // #region // ! create circles

    // set characteristics inner and outer circles
    if (this.dis < thrs_arr[1]) { // inner circles
      this.colorId = 1
    } else { // outer circles
      this.rad = radRatio_fl * this.rad
      this.colorId = 0
    }
    
    // set color scheme
    this.color = color_arr[this.colorId]

    // add circles
    this.crc = [new PIXI.Graphics(), new PIXI.Graphics()]; 
    for (let i = 0; i < this.crc.length; i++) {
      app.stage.addChild(this.crc[i]);
    }
    
    // #endregion
  }

  // start the animation 
  startAnimationBeam() {
      let minTime_boo = false
      let clcStrt_time = Date.now() / 1000
      let speedSca_fl = Math.pow(2.718, 2 * relSpeed_arr[0])
      
      const ani_obj = setInterval(() => {
        this.clcElp = (Date.now() / 1000 - clcStrt_time);
  
        // check if minimum time is met and play sound
        if (this.clcElp > minElp_fl && !minTime_boo){
          this.filterEnv.triggerAttack()
          this.synth.triggerAttack(this.note)
          minTime_boo = true;
        }
      
        // stop the animation when time limit is reached or drawing stops but not before time minimum
        if (this.clcElp >= maxElp_fl || !this.doStart) {
          // check if minimum time to repeat is met
          for (let i = 0; i < this.crc.length; i++) {
            this.crc[i].clear();
          }
          this.filterEnv.triggerRelease()
          this.synth.triggerRelease()
          clearInterval(ani_obj);
        } else { // continues animation
          if (this.dis < thrs_arr[1]) {
            this.growCircle(this.rad, transferExpScale(this.clcElp / maxElp_fl, speedSca_fl), this.clcElp / maxElp_fl, -1)
          } else {
            this.growCircle(this.rad, transferLogScale(this.clcElp / maxElp_fl, speedSca_fl), this.clcElp / maxElp_fl, -1)
          }
        }
        
      }, frmRate_int); // animation intervall
  }

  // setup repetition
  addSequencer() {

    // adjust synth
    this.synth.set({
      envelope: {
          attack: 0.4,
          decay: this.clcElp,
          sustain: 0.0,
          release: 0.0
      }
    });

    // compute number of repetitions
    let rep_int = Math.floor(minRep_int + transferExpScale((this.clcElp - minElp_fl) /  maxElp_fl, Math.pow(2.718,-4)) * maxRep_int)

    // add events to sequencer (track_id, start_fl, length_fl, repTot_int, checkOcc_int, in_dic)
    let event_obj = new seqEvent(this.track, Date.now() / 1000, this.clcElp, rep_int, 1, {beam: this})
    seq_obj.addEvent(event_obj)

    console.log(seq_obj)
    console.log(seq_obj.eventQueue[0])
    console.log(seq_obj.eventQueue[1])
  }

  animateBeam(rel_fl) {

    // initialize
    let playSound_boo = true;
    let loop_time = Date.now() / 1000;

    const ani_obj = setInterval(() => {
      
      // grow circle
      let itr_time = Date.now() / 1000 - loop_time
      this.growCircle(this.rad, itr_time / this.clcElp, itr_time / maxElp_fl, 0.5) 
      
      // play sound
      if (playSound_boo && itr_time / this.clcElp > 0.05 ) {
        var velo_fl = 1 - rel_fl
        this.filterEnv.triggerAttackRelease("2")
        this.synth.triggerAttackRelease(this.note, this.clcElp, "+0.0", velo_fl);
        playSound_boo = false;
      }

      // end animatioion
      if (this.clcElp < itr_time * 0.95) {
        this.crc[0].clear();
        clearInterval(ani_obj);
      }
    }, frmRate_int); // animation interval  
    
  }

  growCircle(rad_fl, rel1_fl, rel2_fl, rel3_fl) {

    // move disk
    var curPos_vec = addVec(this.pos, scalarMulti(this.dir, - transferLogScale(rel1_fl, Math.pow(2.718, 2)) * this.maxStep))

    // control color and transparency
    var trans_fl = 0.1 // trans_arr[0] + trans_arr[1] * transferLogScale(rel2_fl, 2.718)
    var color_str = interpolateHex(this.color[0], this.color[1], transferLogScale(rel2_fl, Math.pow(2.718,1.0)))

    // draw new circle 
    if (curPos_vec[2] > disExt_vec[0]) {
      //this.crc[0].clear();
      //plotDisk(this.crc[0], curPos_vec, rad_fl * rel2_fl, this.dir, color_str, trans_fl)
      var scaRad_fl = rad_fl * transferLogScale(rel1_fl, 2.718)

      plotDisk(this.crc[0], curPos_vec, scaRad_fl, scaRad_fl, this.dir, color_str, trans_fl)
      plotShadow(this.crc[0], curPos_vec, scaRad_fl, this.dir, light1_vec, [0,1,0], floor_vec, color_str, 0.5 * trans_fl) 
    }

  }

  /*
  getRelShare() {
    if (this.next == -1) {
      var share3_fl = (Date.now() / 1000 -  this.tot_time) / this.clcElp
    } else {
      var share3_fl = (Date.now() / 1000 -  aniCircle_arr[this.next].tot_time) / (aniCircle_arr[this.next].clcElp)
    }
      
    return share3_fl -  Math.floor(share3_fl)
  }
  */

}

// parameters of projection
class projData {
  constructor(pos_vec, ang_vec) {
    this.pos = pos_vec;
    this.ang = ang_vec;
    this.rotMat = math.matrix([
      [Math.cos(ang_vec[1]) * Math.cos(ang_vec[2]), Math.cos(ang_vec[1]) * Math.sin(ang_vec[2]), - Math.sin(ang_vec[1])],
      [Math.sin(ang_vec[0]) * Math.sin(ang_vec[1]) * Math.cos(ang_vec[2]) - Math.cos(ang_vec[0]) * Math.sin(ang_vec[2]), Math.sin(ang_vec[0]) * Math.sin(ang_vec[1]) * Math.sin(ang_vec[2]) + Math.cos(ang_vec[0]) * Math.cos(ang_vec[2]), Math.sin(ang_vec[0]) * Math.cos(ang_vec[1])],
      [Math.cos(ang_vec[0]) * Math.sin(ang_vec[1]) * Math.cos(ang_vec[2]) + Math.sin(ang_vec[0]) * Math.sin(ang_vec[2]), Math.cos(ang_vec[0]) * Math.sin(ang_vec[1]) * Math.sin(ang_vec[2]) - Math.sin(ang_vec[0]) * Math.cos(ang_vec[2]), Math.cos(ang_vec[0]) * Math.cos(ang_vec[1])]])
  }
}

// #endregion

// #region //! sequencer classes

class sequencer {
  constructor(bpm_fl, tracks_arr) {
    this.tracks = tracks_arr
    this.bpm = bpm_fl
    this.start = Date.now() / 1000;
    this.events = [];
    this.eventQueue = [];
  }

  // add event to the sequencer
  addEvent(event_obj) {
    
    let event_id = this.events.length
    
    // add event to sequencer and get its track
    let relTrack_obj = this.tracks[event_obj.track]

    // compute starting point and length in "global" beats (= according to bpm) 
    let nStart_int = relTrack_obj.del + relTrack_obj.trigLen * Math.ceil((event_obj.start - this.start) * this.bpm / 60 / relTrack_obj.trigLen)
    let nLength_int = Math.max(relTrack_obj.minLen, Math.ceil(event_obj.length * this.bpm / 60))

    // correct starting point if beat is already occupied
    if (this.tracks[event_obj.track].occupied.includes(nStart_int)) {
      // check next steps in the defined range 
      let checkStep_arr = Array.from({ length: Math.floor(event_obj.checkOcc *  nLength_int) + 1 }, (_, i) => i * relTrack_obj.trigLen)
      var foundStart_boo = false;
      let newStart_int = 0;
      for (let i = 1; i < checkStep_arr.length; i++) {
        newStart_int = nStart_int + checkStep_arr[i]
        if (!this.tracks[event_obj.track].occupied.includes(newStart_int)) {
          nStart_int = newStart_int
          foundStart_boo = true
          break
        }
      }
    } else {
      foundStart_boo = true
    }

    if (foundStart_boo) {
      // write occupied beats
      let occBeats_arr = [...Array(event_obj.repTot)].map((_, i) => nStart_int + i * nLength_int)

      // create array with trigger points in seconds, event id, and repetition counter
      let trigger_arr = [...Array(event_obj.repTot)].map((_, i) => [(nStart_int + i * nLength_int) / this.bpm * 60, event_id, i]);
     
      this.addTriggersToQueue(trigger_arr)

      // update occupied beats
      this.tracks[event_obj.track].occupied.push(...occBeats_arr)
      this.tracks[event_obj.track].occupied.sort()

      // add event to sequencer
      this.events.push(event_obj);
    }
  }
  
  // add triggers to queue
  addTriggersToQueue(trigger_arr) {
    // add new events
    this.eventQueue.push(...trigger_arr)
    // update sorting of events
    this.eventQueue.sort((a, b) => a[0] - b[0]);
  }

  // check for new triggers and update queue
  checkTrigger(curTime_fl) {

    let pastTime_fl = curTime_fl - this.start
    var iMax_int = 0 // counter for triggered events
    for (let i = 0; i < this.eventQueue.length; i++) {

      // trigger event
      if (this.eventQueue[i][0] < pastTime_fl){
        // trigger beam
        let event_obj = this.events[this.eventQueue[i][1]]
        event_obj.attr.beam.animateBeam(this.eventQueue[i][2] / event_obj.repTot)

        iMax_int = i + 1
      } else {
        break
      }
    }

    // remove triggered events
    if (iMax_int > 0) {
      this.eventQueue = this.eventQueue.splice(iMax_int, this.eventQueue.length);
    }
  }
}

// track of the sequencer
class track {
  constructor (trigLen_int, minLen_int, delLen_int) {
    this.trigLen = trigLen_int; // distance between triggers relative to bpm sequencer
    this.minLen = minLen_int; // minimum length relative to bpm sequencer
    this.del = delLen_int; // delay relative to sequencer
    this.occupied = []; // occupied beats of track (in sequencer bpm)
  }
}

// event for the sequencer (one event can be triggered/repeated multiple times)
class seqEvent {
  constructor (track_id, start_fl, length_fl, repTot_int, checkOcc_int, in_dic) {
    this.track = track_id; // track of event
    this.start = start_fl;  // starting time
    this.length = length_fl; // length of one repetition
    this.checkOcc = checkOcc_int; // look forward in multi of length to find an unoccupied beat
    this.repTot = repTot_int; // total number of repetitions
    this.repCur = 0; // current repetition
    this.attr = in_dic;
  }
}

// #endregion