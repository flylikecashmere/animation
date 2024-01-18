// get random element of vector
function randEle(vector) {
    return vector[Math.floor(Math.random()*vector.length)]
}

// distribute range 'inter' into 'step' steps with given 'ratio' corrected by 'scale'
function distVal(ratio,sca,step,inter,type) {
   
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

// get y coordinate of circle from rel position of x and radius
function getCircleY(relX, rad) {
    return Math.sqrt(Math.pow(rad, 2) - Math.pow(relX*rad, 2));
}
  
// linear interpolation
function linInter(x, y1, y2, x1 = 0, x2 = 1) {
    return y1 + ((x - x1) * (y2 - y1)) / (x2 - x1);
}

// checks if the specified time intervall in frames is over 
function checkTimeInt(frm_int,frmInter_int) {
    return frm_int % frmInter_int === 0
}

// substract values in two arrays from each other
function subArr(arr1, arr2) {
    return arr1.map((value, index) => value - arr2[index]);
}

// normalize length of direction vector
function normalizeDir(dir_arr) {
    vecL_fl = Math.sqrt(Math.pow(dir_arr[0],2) + Math.pow(dir_arr[1],2))
    return dir_arr.map(function(x) { return x / vecL_fl; })
}

// convert time in seconds to cover x-distance to pixels per milli second
function computeSpeed(timeX) {
    return size.x / timeX
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


// creates array of n-elements starting with zero
function intArr(n) {
    let int_arr = new Array(n);;
    for (let i = 0; i < n; i++) {
        int_arr[i] = i;
    }
    return int_arr;
}

// difference of two arrays
function diffArr(arr1, arr2) { // array with all elements, array with elements to be removed
    return arr1.filter(item => !arr2.includes(item));
}

// check if elements touch limit
function touchLimit(bounds_dic,check) { // array of graphic elements, string array with type of check and dimension
    if (check[1] === "up") {
      var check_boo = bounds_dic[check[0]][0] + bounds_dic[check[0]][1] > size[check[0]]
    } else if (check[1] === "low") {
      var check_boo = bounds_dic[check[0]][0] < 0
    }
    return check_boo
}

// check if elements are out of limit
function outLimit(bounds_dic,check) { // array of graphic elements, string array with type of check and dimension
    if (check[1] === "up") {
        var check_boo = bounds_dic[check[0]][0] > size[check[0]] 
    } else if (check[1] === "low") {
        var check_boo = bounds_dic[check[0]][0] + bounds_dic[check[0]][1] < 0
    }
    return check_boo
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

// check if object is in screen
function checkBounds(obj,dim,type) { // object to check, dimensions and directions to check, touch or completely out

    const bounds_obj = obj.getBounds();
    const bounds_dic = {x: [bounds_obj.x, bounds_obj.width], y: [bounds_obj.y, bounds_obj.height]}
    var out_boo = type === "touch" ? false : true

    // check if specified dimensions are out of the screen
    for (let j = 0; j < dim.length; j++) {
        
        if (type === "touch") { // check if object is touches screen limits (only has to be true for one check)

            if (touchLimit(bounds_dic,dim[j])) { 
                out_boo = true
                break
            }

        } else if (type === "out") { // check if object is completely outside of screen limits (must be true for all checks)
            if (out_boo && outLimit(bounds_dic,dim[j]))  { 
                out_boo = true
            } else {
                out_boo = false
            }

        }
    }

    return out_boo
}

function pDicToArr(cordDic) {
    return [cordDic.x, cordDic.y]
}

function pArrToDic(pArr) {
    return { x: pArr[0], y: pArr[1] }
}

// changes position of container to point mirrored on line
function mirror(container,p1_arr,p2_arr) { // container, first point of line, second point of line

    // get center of of container
    const cent_arr = [container.x, container.y];
  
    if (p1_arr[0] === p2_arr[0]) { // vertical line
      var projX_fl = p2_arr[0] + (p2_arr[0] - cent_arr[0])
      var projY_fl = cent_arr[1]
    } else if (p1_arr[1] === p2_arr[1]) { // horizontal line
      var projX_fl = cent_arr[0]
      var projY_fl = p2_arr[1] + (p2_arr[1] - cent_arr[1])
    } else {
      // equation for line crossing the two points
      const slMirAx_fl = (p2_arr[1] - p1_arr[1]) / (p2_arr[0] - p1_arr[0]);
      const yMirAx_fl = p2_arr[1] - p2_arr[0] * slMirAx_fl;
      // compute orthogonal point on mirror axis
      const yOrth_fl =  cent_arr[1] - cent_arr[0] * (-1 / slMirAx_fl);
      const intSectX_fl = (yOrth_fl - yMirAx_fl) /  (slMirAx_fl + 1/slMirAx_fl)
      // compute projected point
      var projX_fl = intSectX_fl + (intSectX_fl - cent_arr[0])
      var projY_fl = yOrth_fl + projX_fl * (-1 / slMirAx_fl)
    }
  
    // adjust container position
    container.position = {x: projX_fl, y: projY_fl}
  
  }