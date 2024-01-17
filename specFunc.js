
// create a blob with tail from lines
function createBlob(iFront_int, r_fl, speed_fl, relTrail_fl,color_arr)  { //number of lines in front, radius, speed, relative length of tail, negative expected value for y-position

    // derive properties
    let iTail_int = Math.floor(iFront_int * relTrail_fl) // number of step in tail
  
    let alp_arr = distVal(1.618,1/iTail_int,iTail_int,1.0,"exp") // decreasing opacity of lines in tail

    let lin_arr = new Array(iFront_int+iTail_int); // prepare array of all lines
    let wid_fl = r_fl / iFront_int // width per line
  
    // create all lines
    for (let i = 0; i < lin_arr.length; i++) {
      // get color
      const col_obj = new PIXI.Color(interpolateHexPal(color_arr, Math.max(...[0,(i-iTail_int)/iFront_int]))).toNumber(); 

      xVal_fl = (i - lin_arr.length) * wid_fl
      // create lines for front and tail of blob
      if (i < iTail_int) { // create a line in the tail
        lin_arr[i] = new Line(xVal_fl, -r_fl, xVal_fl, r_fl, col_obj, wid_fl, alp = alp_arr[i]) // 
      } else { // create a line in the blob
        yCrc_fl = getCircleY((i-iTail_int)/(iFront_int),r_fl)
        lin_arr[i] = new Line(xVal_fl, -yCrc_fl, xVal_fl, yCrc_fl, col_obj, wid_fl)
      }
    }

    let blob = new grpEle(lin_arr, timeX = speed_fl, dir = [1,0], t = 0)
    return blob
}

// return mix of sinus function plus random noise distributed uniform minus normal
function sinPlusRnd(f,sinShr_fl,dev_fl) { // position-x sinus, weight between sinus and equal minus normal distributed randon value
  rnd_val = sinShr_fl * linInter(Math.sin(2 * Math.PI * f), 0, 1, -1, 1) + (1 - sinShr_fl) * linInter(Math.random() - normalDis(0.5,dev_fl), 0.0, 1.0, - 3 * dev_fl, 3 * dev_fl);
  return Math.min(1.0, Math.max(rnd_val, 0.0))
}

  