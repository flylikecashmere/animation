

// convert point vector from global coordinates to camera coordinates
function convertCamCord(point_vec, obj_proj) {
    let cam_mat = math.multiply(obj_proj.rotMat, [point_vec[0] - obj_proj.pos[0], point_vec[1] - obj_proj.pos[1], point_vec[2] - obj_proj.pos[2]])
    return [cam_mat._data[0], cam_mat._data[1], cam_mat._data[2]]
}

// convert point vector from camera coordinates to image plane
function convertImgPlane(point_vec, obj_proj) {
    console.log(point_vec)
    return [obj_proj.pos[0] + point_vec[0] / point_vec[2] * disExt_vec[0], obj_proj.pos[1] + point_vec[1] / point_vec[2] * disExt_vec[0]]
}

// convert point from global coordinates to image plane
function projectPoint(point_vec, obj_proj) {
    return convertImgPlane(convertCamCord(point_vec, obj_proj), obj_proj)
}  

// convert 3-element matrix to common array
function mat2arr(in_mat) { 
    return [in_mat._data[0], in_mat._data[1], in_mat._data[2]]
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
function plotDisk(disk_obj, center_vec, rad1_fl, rad2_fl, norm1_vec, color_str, trans_fl) {

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
    let radPoint1_vec = projToPlane(addVec(center_vec, scalarMulti(norm2_vec, rad1_fl)), view_proj);
    let radPoint2_vec = projToPlane(addVec(center_vec, scalarMulti(norm3_vec, rad2_fl)), view_proj);
    let centerPro_vec = projToPlane(center_vec, view_proj) 

    // get radii of ellipse
    let radPro1_fl = Math.sqrt(Math.pow(centerPro_vec[0] - radPoint1_vec[0], 2) +  Math.pow(centerPro_vec[1] - radPoint1_vec[1], 2));
    let radPro2_fl = Math.sqrt(Math.pow(centerPro_vec[0] - radPoint2_vec[0], 2) +  Math.pow(centerPro_vec[1] - radPoint2_vec[1], 2));

    // plot actual ellipse
    disk_obj.beginFill(color_str, trans_fl);
    disk_obj.drawEllipse(centerPro_vec[0], centerPro_vec[1], radPro1_fl, radPro2_fl);
    disk_obj.endFill();

}

// get the dot product of two vectors
function dotProduct(a_vec, b_vec) {
    let prod_fl = 0;
    for (let i = 0; i < a_vec.length; i++) {
        prod_fl += a_vec[i] * b_vec[i];
    }
    return prod_fl
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

// get maximum steps until element has relative difference from mid point
function getMaxStepCircle(pos_vec, dir_vec, end_vec) {

    var i = 5
    var dist_fl = 1000
    var maxI_fl = (pos_vec[2] - disExt_vec[0]) / dir_vec[2]

    var relStart_vec = projToPlane(pos_vec, view_proj)
    var maxDist_fl = magVec([relStart_vec[0] - end_vec[0], relStart_vec[1] - end_vec[1]])
    var saveI_dic = {inside: [], outside: []}

    return maxI_fl
    /*
    var z = 1
    while (Math.abs(dist_fl - maxDist_fl) > 0.005 && z < 20 && i < maxI_fl) {

        spacePos_vec = addVec(pos_vec, scalarMulti(dir_vec, - i))
        relPos_vec = projToPlane(spacePos_vec, view_proj)

        dist_fl = magVec([relPos_vec[0] - end_vec[0], relPos_vec[1] - end_vec[1]])

        z = z + 1
        
        if (dist_fl > maxDist_fl) { // point is outside
        
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

        if (i > maxI_fl) {
            i = maxI_fl
        }
    }

    return i
    */
}

// get maximum steps until element leaves screen
function getMaxStepScreen(pos_vec, dir_vec) {


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

    // search method to get maximum number of steps
    var i = Math.min(maxStep_x, maxStep_y)
    var saveI_dic = {inside: [], outside: []}
    var vio_dic = {x: Infinity, y: Infinity, z: Infinity}
    var relPos_vec
    var z = 1

    // adjust steps until position is almost the edge of the visible area
    while (!(vio_dic.x < 0.001 * dia_fl || vio_dic.y < 0.001 * dia_fl || vio_dic.z < 0.001 * (disExt_vec[1] - disExt_vec[0]))) { 

        z = z + 1
        spacePos_vec = addVec(pos_vec, scalarMulti(dir_vec, - i))
        relPos_vec = projToPlane(spacePos_vec, view_proj)

        // compute violation of current point (as in how far its away from border, both directions!)
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

        if (spacePos_vec[2] < 0.5 * (disExt_vec[0] + disExt_vec[1])) {
            vio_dic.z = Math.abs(spacePos_vec[2] - disExt_vec[0])
        } else {
            vio_dic.z = Math.abs(spacePos_vec[2] - disExt_vec[1])
        }

        // adjust scaling i based on position of projected point
        if (relPos_vec[0] < 0 || relPos_vec[0] > size.x || relPos_vec[1] < 0 || relPos_vec[1] > size.y || spacePos_vec[2] < disExt_vec[0] || spacePos_vec[2] > disExt_vec[1]) { // point is outside

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
    }
   
    return i
}

// rotate a vector around axis
function rotateVec(in_vec, rad_fl, ax_str) {

    let rot_mat;

    switch (ax_str) {
        case 'x':
            rot_mat = [
                [1, 0, 0],
                [0, Math.cos(rad_fl), -Math.sin(rad_fl)],
                [0, Math.sin(rad_fl), Math.cos(rad_fl)]
            ];
            break;
        case 'y':
            rot_mat = [
                [Math.cos(rad_fl), 0, Math.sin(rad_fl)],
                [0, 1, 0],
                [-Math.sin(rad_fl), 0, Math.cos(rad_fl)]
            ];
            break;
        case 'z':
            rot_mat = [
                [Math.cos(rad_fl), -Math.sin(rad_fl), 0],
                [Math.sin(rad_fl), Math.cos(rad_fl), 0],
                [0, 0, 1]
            ];
            break;
    }

    return multiMatVec(rot_mat, in_vec);
}

// multipy 3-dim vector with matrix
function multiMatVec(in_mat, in_vec) {
    return [
        in_mat[0][0] * in_vec[0] + in_mat[0][1] * in_vec[1] + in_mat[0][2] * in_vec[2],
        in_mat[1][0] * in_vec[0] + in_mat[1][1] * in_vec[1] + in_mat[1][2] * in_vec[2],
        in_mat[2][0] * in_vec[0] + in_mat[2][1] * in_vec[1] + in_mat[2][2] * in_vec[2]
    ];
}

function subVec(in1_vec, in2_vec) {
    return addVec(in1_vec, scalarMulti(in2_vec, -1.0))
}

// plot the shadow of the disk
function plotShadow(disk_obj, center_vec, rad_fl, norm1_vec, light_vec, planeNormal_vec, plainePoint_vec, shadowColor_str, trans_fl) {

    // Get two vectors on the disk as you did before
    norm1_vec = normalize(norm1_vec);

    let nonCol_vec = [0.0, 0.0, 0.0];
    let eqZ_boo = true;
    let neqZ_boo = true;
    let i = 0;
    while (i < norm1_vec.length) {
        if (norm1_vec[i] !== 0 && eqZ_boo) {
            nonCol_vec[i] = -norm1_vec[i];
            eqZ_boo = false;
        } else if (norm1_vec[i] == 0 && neqZ_boo) {
            nonCol_vec[i] = 1.0;
            neqZ_boo = false;
        }
        i++;
    }

    let norm2_vec = normalize(crossProduct(norm1_vec, normalize(nonCol_vec)));
    let norm3_vec = normalize(crossProduct(norm1_vec, norm2_vec));

    // Project points on the disk to the shadow plane
    let diskEdge1_vec = addVec(center_vec, scalarMulti(norm2_vec, rad_fl));
    let diskEdge2_vec = addVec(center_vec, scalarMulti(norm3_vec, rad_fl));

    // get shadow points on the plane
    let shadowEdge1_vec = projectToShadowPlane(diskEdge1_vec, light_vec, planeNormal_vec, plainePoint_vec);
    let shadowEdge2_vec = projectToShadowPlane(diskEdge2_vec, light_vec, planeNormal_vec, plainePoint_vec);
    let shadowCenter_vec = projectToShadowPlane(center_vec, light_vec, planeNormal_vec, plainePoint_vec);

    if (!shadowEdge1_vec || !shadowEdge2_vec || !shadowCenter_vec) {
        console.log("No shadow projection possible, light is parallel to the plane.");
        return;
    }
    
    // now project the shadow points onto the camera plane
    let shadowPoint1_proj = projToPlane(shadowEdge1_vec, view_proj);
    let shadowPoint2_proj = projToPlane(shadowEdge2_vec, view_proj);
    let shadowCenter_proj = projToPlane(shadowCenter_vec, view_proj);

    // compute radius of shadow
    const rad2_fl = Math.sqrt(Math.pow(shadowPoint1_proj[1] - shadowCenter_proj[1],2) + (Math.pow(shadowPoint1_proj[0] - shadowCenter_proj[0],2) * (shadowPoint2_proj[1] - shadowPoint1_proj[1]) * (shadowPoint2_proj[1] + shadowPoint1_proj[1] - 2 * shadowCenter_proj[1])) / ((shadowPoint1_proj[0] - shadowPoint2_proj[0]) * (shadowPoint1_proj[0] + shadowPoint2_proj[0] - 2 * shadowCenter_proj[0])))
    const rad1_fl = rad2_fl * Math.sqrt(((shadowPoint1_proj[0] - shadowPoint2_proj[0]) * (shadowPoint1_proj[0] + shadowPoint2_proj[0] - 2 * shadowCenter_proj[0]))/ ((shadowPoint2_proj[1] - shadowPoint1_proj[1]) * (shadowPoint2_proj[1] + shadowPoint1_proj[1] - 2 * shadowCenter_proj[1])))

    // draw shadow
    disk_obj.beginFill(shadowColor_str, trans_fl);
    disk_obj.drawEllipse(shadowCenter_proj[0], shadowCenter_proj[1], rad1_fl, rad2_fl);
    disk_obj.endFill();
 
}

// function to compute the intersection of a ray with a plane (shadow projection)
function projectToShadowPlane(point_vec, light_vec, planeNormal_vec, plainePoint_vec) {
    
    // ray from the light through the point
    let ray_vec = subVec(point_vec, light_vec);

    // find the t value where the ray intersects the plane
    let numerator = dotProduct(planeNormal_vec, subVec(plainePoint_vec, light_vec));
    let denominator = dotProduct(planeNormal_vec, ray_vec);

    // avoid divide by zero (light parallel to the plane)
    if (Math.abs(denominator) < 1e-6) return null;

    let t = numerator / denominator;

    // calculate the intersection point (shadow on the plane)
    let shadow_vec = addVec(light_vec, scalarMulti(ray_vec, t));

    return shadow_vec;
}

