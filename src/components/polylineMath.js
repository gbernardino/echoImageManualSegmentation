export function closestNode(coordinates, x, y, d = 50) {
    let iMin = -1;
    let d2Min = d*d;
    for (let i = 0; i < coordinates.length/2; i++){
        let dx = (coordinates[2*i] - x);
        let dy = (coordinates[2*i + 1] - y);
        let d2 = dx*dx + dy*dy;
        if (d2 < d2Min){
            iMin = i;
            d2Min = d2;
        }
    }
    return iMin
}


function pDistance(x, y, x1, y1, x2, y2) {
    //https://stackoverflow.com/questions/849211/shortest-distance-between-a-point-and-a-line-segment
    var A = x - x1;
    var B = y - y1;
    var C = x2 - x1;
    var D = y2 - y1;
  
    var dot = A * C + B * D;
    var len_sq = C * C + D * D;
    var param = -1;
    if (len_sq !== 0) //in case of 0 length line
        param = dot / len_sq;
  
    var xx, yy;
  
    if (param < 0) {
      xx = x1;
      yy = y1;
    }
    else if (param > 1) {
      xx = x2;
      yy = y2;
    }
    else {
      xx = x1 + param * C;
      yy = y1 + param * D;
    }
  
    var dx = x - xx;
    var dy = y - yy;
    return Math.sqrt(dx * dx + dy * dy);
}

export function closestEdge(coordinates, x, y, d = 50) {
    let iMin = -1;
    let dMin = d;
    for (let i = 0; i < coordinates.length/2 -1 ; i++){
        // Compute edge - can precopmute it actually
        let d = pDistance(x, y, coordinates[2*i],  coordinates[2*i + 1],  coordinates[2*i + 2], coordinates[2*i + 3] )
        if (d < dMin){
            iMin = i;
            dMin = d;
        }
    }
    console.log(dMin)
    return iMin
}