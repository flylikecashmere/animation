
// #region //! randomization

// get random element of vector
function randEle(vector) {
    return vector[Math.floor(Math.random()*vector.length)]
}

// get random value from a standard normal distribution using Box-Muller transform
function standardNormalDis() {
    return Math.sqrt(-2 * Math.log(Math.random())) * Math.cos(2 * Math.PI * Math.random())
}

// get random value from normal distribution
function normalDis(mean,stdDev) {
    return mean + standardNormalDis() * stdDev
}

// https://en.wikipedia.org/wiki/Exponential_distribution
//jStat.exponential.sample(0.5) -> max 0.5, mean 1/0.5

// https://en.wikipedia.org/wiki/Poisson_distribution
//jStat.poisson.sample(0.5) -> mean 0.5

// #endregion

// #region //! interpolation and harmonic spacing

// transfer to logarithmic scale
function transferLogScale(val_fl, base_fl) {
    val_fl = Math.max(0, Math.min(1, val_fl));
    return Math.log(val_fl * (base_fl - 1) + 1) / Math.log(base_fl);
}

// transfer to exponential scale
function transferExpScale(val_fl, base_fl) {
    val_fl = Math.max(0, Math.min(1, val_fl));
    return (Math.pow(base_fl,val_fl) - Math.pow(base_fl,0.0)) / (Math.pow(base_fl,1.0) - Math.pow(base_fl,0.0));
}

// transfer to polynomial scale
function transferPolyScale(val_fl, base_fl, offset_fl) {
    return Math.abs(Math.pow(val_fl - offset_fl, base_fl)/Math.pow(1 - offset_fl, base_fl));
}

// linear interpolation
function linInter(x, y1, y2, x1 = 0, x2 = 1) {
    return y1 + ((x - x1) * (y2 - y1)) / (x2 - x1);
}

// distribute range 'inter' into 'step' steps with given 'ratio' corrected by 'scale'
function distVal(ratio, sca, step, inter, type) {
   
    let step_arr = new Array(step);
    let stepSum_fl = 0.0;
    
    // get different steps and their total sum
    for (let i = 0; i < step; i++) {
        if (type === "exp") {
            step_arr[i] = stepSum_fl + Math.pow(ratio,i*sca) - 1
        } else {
            step_arr[i] = stepSum_fl + Math.log(1+i*sca) / Math.log(ratio)
        }
        stepSum_fl = step_arr[i]
    }

    // scale interpolation range to step values
    let inter_arr = new Array(step);
    for (let i = 0; i < step; i++) {
        inter_arr[i] = inter * step_arr[i]/stepSum_fl
    }

    return inter_arr
}

// #endregion

// #region //! color handling

// creates array of n-elements starting with zero
function intArr(n) {
    let int_arr = new Array(n);;
    for (let i = 0; i < n; i++) {
        int_arr[i] = i;
    }
    return int_arr;
}

// convert hex string into array of rgb colors
function hexToRgb(hex_str) {
    // remove any leading # from the hex code
    hex_str = hex_str.replace(/^#/, '');

    // parse the hex code into three separate components
    var big_int = parseInt(hex_str, 16);
    var r_int = (big_int >> 16) & 255;
    var g_int = (big_int >> 8) & 255;
    var b_int = big_int & 255;

    return [r_int, g_int, b_int];
}

// interpolate color and convert to pixi object
function convertInterCol(color_arr,x) {
    const col_obj = new PIXI.Color(interpolateHexPal(color_arr, Math.max(...[0,x]))).toNumber(); 
    return col_obj
}

// linear interpolation between two hex colors
function interpolateHex(hex1_str, hex2_str , x) { // first color as hex, second color as hex, share of first color as float
    
    // convert to int
    int1_arr = hexToRgb(hex1_str)
    int2_arr = hexToRgb(hex2_str)

    // do linear interpolation of RGB components
    const rInterpolated = Math.round(int1_arr[0] + (int2_arr[0] - int1_arr[0]) * x);
    const gInterpolated = Math.round(int1_arr[1] + (int2_arr[1] - int1_arr[1]) * x);
    const bInterpolated = Math.round(int1_arr[2] + (int2_arr[2] - int1_arr[2]) * x);

    // convert back into hex and return
    return `#${(rInterpolated.toString(16)).padStart(2, '0')}${(gInterpolated.toString(16)).padStart(2, '0')}${(bInterpolated.toString(16)).padStart(2, '0')}`;
}

// linear interpolation over a range of colors
function interpolateHexPal(hex_arr,x) { // array of hex colors, relative value of value in range
    
    // get id of first color for iteration
    start_int = Math.floor(x * (hex_arr.length - 1))
    // do interpolation and return
    return interpolateHex(hex_arr[start_int],hex_arr[start_int + 1],x - start_int / (hex_arr.length - 1))
}

// #endregion

// normalize length of direction vector
function normalizeDir(dir_arr) {
    vecL_fl = dir_arr.reduce((sum_fl, itr_fl) => sum_fl + Math.pow(itr_fl, 2), 0);
    return dir_arr.map(function(x) { return x / vecL_fl; })
}

// get angle between 0 and 360
function getAng(x_fl, y_fl) {

    var projCam_vec = projectPoint([view_proj.pos[0], view_proj.pos[1], disExt_vec[1]], view_proj)
    var ang_fl = angleVec([projCam_vec[0] - x_fl, projCam_vec[1] - y_fl], [0, 1]) * 57.2958
    
    if (x_fl > view_proj.pos[0]) {
        return ang_fl
    } else {
        return 360 - ang_fl
    }
}

function checkDist(lastPos_dic, curPos_dic) {
    dist_fl = Math.pow(Math.pow(lastPos_dic.x - curPos_dic.x, 2) + Math.pow(lastPos_dic.y - curPos_dic.y, 2), 0.5)
    if (dist_fl > dia_fl / 2.718 / 2.718) {
      cnt_int = cnt_int + 1
    }
  }