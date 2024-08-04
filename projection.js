
// project 3d object to camera plane
function projToPlane(point_vec) {
    
    // relative points
    var x_fl = point_vec[0] - camPos_vec[0]
    var y_fl = point_vec[1] - camPos_vec[1]
    var z_fl = point_vec[2]

    // projection parameters  
    var par1_fl = (camCos_vec[1] * z_fl + camSin_vec[1] * (camSin_vec[2] * y_fl + camCos_vec[2] * x_fl)) 
    var par2_fl = (camCos_vec[2] * y_fl + camSin_vec[2] * x_fl)
    var dX_fl = camCos_vec[1] * (camSin_vec[2] * y_fl + camCos_vec[2] * x_fl) - camSin_vec[1] * z_fl
    var dY_fl = camSin_vec[0] * par1_fl + camCos_vec[0] * par2_fl
    var dZ_fl = camCos_vec[0] * par1_fl + camSin_vec[0] * par2_fl

    return [size.x * dX_fl / dZ_fl * size.y / size.x + camPos_vec[0], size.y * dY_fl / dZ_fl + camPos_vec[1]]
}

// get the cross product of two vectors with 3 elements (!)
function crossProduct(a_vec, b_vec) {
    let out_vec = [0, 0, 0]
   
    out_vec[0] = a_vec[1] * b_vec[2] - a_vec[2] * b_vec[1]
    out_vec[1] = a_vec[2] * b_vec[0] - a_vec[0] * b_vec[2]
    out_vec[2] = a_vec[0] * b_vec[1] - a_vec[1] * b_vec[0]
    
    return out_vec
}

// normalize a vector with 3 elements (!)
function normalize(v_vec) {
    let lng_fl = Math.sqrt(v_vec[0] ** 2 + v_vec[1] ** 2 + v_vec[2] ** 2);
    return [v_vec[0] / lng_fl, v_vec[1] / lng_fl, v_vec[2] / lng_fl];
}

// scala multiplication for a vector with 3 elements (!)
function scalarMulti(in_vec, sca_fl) {
    let out_vec = [0, 0, 0];
    for (let i = 0; i < in_vec.length; i++) {
        out_vec[i] = in_vec[i] * sca_fl;
    }
    return out_vec
}

// add two vectors with 3 elements (!)
function addVec(in1_vec, in2_vec) {
    let out_vec = [0, 0, 0];
    for (let i = 0; i < in1_vec.length; i++) {
        out_vec[i] = in1_vec[i] + in2_vec[i];
    }
    return out_vec
}

// draw polygon defined by the input points
function plotPlane(points_arr) {

    var gra_obj = new PIXI.Graphics();

    gra_obj.lineStyle(2, 0xFF00FF, 1);
    gra_obj.beginFill(0xFF00BB, 0.2);

    var pointsFlat_arr = points_arr.flat();
    gra_obj.drawPolygon(pointsFlat_arr);
    gra_obj.endFill();
    
    return gra_obj
}

// plot a 3d plane projected to the camera plane
function plotDisk(disk_obj, center_vec, rad_fl, norm1_vec, color_str, trans_fl) {

    // get non colinear vector
    norm1_vec = normalize(norm1_vec)

    let nonCol_vec = [0.0, 0.0, 0.0]
    let eqZ_boo = true;
    let neqZ_boo = true;

    let i = 0;
    while (i < norm1_vec.length) {
        if (norm1_vec[i] !== 0 && eqZ_boo) {
            nonCol_vec[i] = - norm1_vec[i]  
            eqZ_boo = false
        } else if (norm1_vec[i] == 0 && neqZ_boo) {
            nonCol_vec[i] = 1.0 
            neqZ_boo = false;
        }
        i++;
    }

    // get second and third normal vector
    let norm2_vec = normalize(crossProduct(norm1_vec, normalize(nonCol_vec)))
    let norm3_vec = normalize(crossProduct(norm1_vec, norm2_vec))

    // construct points on disk line and project to plane
    let radPoint1_vec = projToPlane(addVec(center_vec, scalarMulti(norm2_vec, rad_fl)));
    let radPoint2_vec = projToPlane(addVec(center_vec, scalarMulti(norm3_vec, rad_fl)));
    let centerPro_vec = projToPlane(center_vec) 

    // get radii of ellipse
    let rad1_fl = Math.sqrt(Math.pow(centerPro_vec[0] - radPoint1_vec[0], 2) +  Math.pow(centerPro_vec[1] - radPoint1_vec[1], 2));
    let rad2_fl = Math.sqrt(Math.pow(centerPro_vec[0] - radPoint2_vec[0], 2) +  Math.pow(centerPro_vec[1] - radPoint2_vec[1], 2));

    // plot acutal ellipse
    disk_obj.beginFill(color_str, trans_fl);
    disk_obj.drawEllipse(centerPro_vec[0], centerPro_vec[1], rad1_fl, rad2_fl);
    disk_obj.endFill();

}

// gives the 3d point for the 2d point and depth put into the function
function planeToProj(point_vec, depth_fl) {
    
    var z_fl = depth_fl - camPos_vec[2]

}

// get the dot product of two vectors with 2 elements (!)
function dotProduct(a_vec, b_vec) {
    return a_vec[0] * b_vec[0] + a_vec[1] * b_vec[1]
}

// get the length of a vector with 2 elements (!)
function magVec(a_vec) {
    return Math.sqrt(a_vec[0] * a_vec[0] + a_vec[1] * a_vec[1])
}

// get the angle between two vectors with 2 elements (!)
function angleVec(a_vec, b_vec) {
    var cos_fl = dotProduct(a_vec, b_vec) / (magVec(a_vec) * magVec(b_vec));
    var clamCos_fl = Math.max(-1, Math.min(1, cos_fl)); // deals with small differences
    return Math.acos(clamCos_fl);
}

// get maximum steps until element leaves screen
function getMaxStep(pos_vec, dir_vec) {


    // estimate starting value for distance
    if (dir_vec[0] < 0) {
        var maxStep_x = pos_vec[0] / Math.abs(dir_vec[0])
    } else {
        var maxStep_x = (size.x - pos_vec[0]) / Math.abs(dir_vec[0])
    }

    // maximum step in y direction
    if (dir_vec[1] < 0) {
        var maxStep_y = pos_vec[1] / Math.abs(dir_vec[1])
    } else {
        var maxStep_y = (size.y - pos_vec[1]) / Math.abs(dir_vec[1])
    }

    // search meth to get maximum number of steps
    var i = Math.min(maxStep_x, maxStep_y)
    var saveI_dic = {inside: [], outside: []}
    var relPos_vec
    var vio_dic = {x: dia_fl, y: dia_fl}
    var z = 1

    while ((vio_dic.x > 0.001 * dia_fl && vio_dic.y > 0.001 * dia_fl) || z < 100) { 
        relPos_vec = projToPlane(addVec(pos_vec, scalarMulti(dir_vec, - i)))

        var vio_dic = {x: Infinity, y: Infinity}
        // compute violatio of current point    
        if (relPos_vec[0] < 0.5 * size.x) {
            vio_dic.x = Math.abs(relPos_vec[0])
        } else {
            vio_dic.x = Math.abs(relPos_vec[0] - size.x)
        }

        if (relPos_vec[1] < 0.5 * size.y) {
            vio_dic.y = Math.abs(relPos_vec[1])
        } else {
            vio_dic.y = Math.abs(relPos_vec[1] - size.y)
        }

        // adjust scaling i based on position of projected point
        if (relPos_vec[0] < 0 || relPos_vec[0] > size.x || relPos_vec[1] < 0 || relPos_vec[1] > size.y) { // point is outside

            saveI_dic.outside.push(i)

            if (saveI_dic.inside.some(x => x >= i / 2)) {
                i = (i + Math.max(...saveI_dic.inside)) / 2
            } else {
                i = i / 2
            }

        } else { // point is inside

            saveI_dic.inside.push(i)

            if (saveI_dic.outside.some(x => x <= i * 2)) {
                i = (i + Math.min(...saveI_dic.outside)) / 2
            } else {
                i = i * 2
            }
        }
        z = z + 1
    }
   
    return i
}
