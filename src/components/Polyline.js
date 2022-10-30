import React from "react";
import { Layer, Line,Circle } from "react-konva";
import useStore from "../store";

function getNodes(polyline, setPolyline){
    const N = polyline.length/2;
    let arr = []
    for (let i = 0; i < N; i++) {
        arr.push(
              <Circle key={"Node_"+i} x={polyline[2*i]} y={polyline[2*i+1]} radius={3} fill="red"  draggable
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
