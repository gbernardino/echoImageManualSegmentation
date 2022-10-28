import React from "react";
import { Layer, Line,Circle } from "react-konva";

import useStore from "../store";

class PolylineMath {
    constructor(maxNPoints = 100) {
        //this.maxNPoints = maxNPoints
        this.nPoints = 0;
        this.coordinates = [];// new Float32Array(2 * this.maxNPoints);
    }

    addPoint(x, y) {
        /*this.coordinates[2*this.nPoints] = x
        this.coordinates[2*this.nPoints + 1] = y
        */
       console.log('Adding', x, y)
       this.coordinates.push(x)
       this.coordinates.push(y)
       this.nPoints += 1
    }

    insertPoint(x, y, i) {
        //
        /*
        for  (let j = 2*this.nPoints - 1; j >= 2*i; j--){
            this.coordinates[j +2] = this.coordinates[j];
        }
        this.coordinates[2*i] = x
        this.coordinates[2*i + 1] = y
        */
        this.splice(2*i, 0, x, y)
        this.nPoints += 1
    }

    deletePoint(i) {
        /*
        for  (let j = 2 *i + 2; j < 2* this.nPoints; ++j){
            this.coordinates[j - 2] = this.coordinates[j];
        }*/
        this.coordinates.splice(2*i, 2)
        this.nPoints -= 1
    }

    removeAllPoints(){
        while (this.nPoints > 0) {
            this.deletePoint(0);
        }
    }
    movePoint(x, y, i) {
        this.coordinates[2*i] = x
        this.coordinates[2*i + 1] = y
    }

    //If the polyline is too long, would need to do something else
    closestNode(x, y) {
        let iMin = 0;
        let d2Min = 1000000;
        for (let i = 0; i < this.nPoints; i++){
            let dx = (this.coordinates[2*i] - x);
            let dy = (this.coordinates[2*i + 1] - y);
            let d2 = dx*dx + dy*dy;
            if (d2 < d2Min){
                iMin = i;
                d2Min = d2;
            }
        }
        return iMin
    }
    closestEdge(x, y) {
        let iMin = 0;
        let d2Min = 1000000;
        for (let i = 0; i < this.nPoints - 1; i++){
            // Compute edge - can precopmute it actually
            let ex = this.coordinates[2*i + 2] - this.coordinates[2*i]
            let ey = this.coordinates[2*i + 2 + 1] - this.coordinates[2*i + 1]
            let de = Math.sqrt(ex *ex + ey*ey)

            let dx = (this.coordinates[2*i] - x);
            let dy = (this.coordinates[2*i + 1] - y);
            let dx_times_e = Math.abs((dx* ey - dy * ex )/de)
            if (dx_times_e < d2Min){
                iMin = i;
                d2Min = dx_times_e;
            }
        }
        return iMin
    }
}

function getNodes(polyline, setPolyline){
    const N = polyline.length/2;
    let arr = []
    for (let i = 0; i < N; i++) {
        arr.push(
              <Circle name={"Node_"+i} x={polyline[2*i]} y={polyline[2*i+1]} radius={2} fill="red"  draggable
              onDragEnd={
                e=>{
                    polyline[2*i] = e.target.x();
                    polyline[2*i + 1] = e.target.y();
                    setPolyline(polyline)
                }
            }
            onDragMove={
                    e=>{
                        polyline[2*i] = e.target.x();
                        polyline[2*i + 1] = e.target.y();
                    }
              }/>
        )
    }
    return (
        arr
    )
}

export default () => {
  const polyline = useStore(s => s.polyline);
  const scale = useStore(s => s.scale);

  const setPolyline = useStore(s => s.setPolyline);

  const layerRef = React.useRef(null);


  return (
    <Layer ref={layerRef}>
        <Line  name="polyline" points={polyline} strokeWidth={1} stroke="purple" />
        {
            getNodes(polyline, setPolyline)
        }
    </Layer>
  );
};
