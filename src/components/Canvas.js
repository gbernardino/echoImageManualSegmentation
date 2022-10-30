import React from 'react';
import { Stage } from 'react-konva';

import BaseImage from './BaseImage';
import Polyline from './Polyline'
import useStore from '../store';
import {closestNode,closestEdge } from './polylineMath'

function getRelativePointerPosition(node) {
  // the function will return pointer position relative to the passed node
  const transform = node.getAbsoluteTransform().copy();
  // to detect relative position we need to invert transform
  transform.invert();

  // get pointer (say mouse or touch) position
  const pos = node.getStage().getPointerPosition();

  // now we find relative point
  return transform.point(pos);
}

function zoomStage(stage, scaleBy, point = null) {
  const oldScale = stage.scaleX();
  let pos ={
    x: stage.width() / 2,
    y: stage.height() / 2,
  };
  if (point != null) {
     pos.x = point.x
     pos.y = point.y
  }
  else{

  }
  const mousePointTo = {
    x: pos.x / oldScale - stage.x() / oldScale,
    y: pos.y / oldScale - stage.y() / oldScale,
  };

  const newScale = Math.max(0.05, oldScale * scaleBy);

  const newPos = {
    x: -(mousePointTo.x - pos.x / newScale) * newScale,
    y: -(mousePointTo.y - pos.y / newScale) * newScale,
  };

  const newAttrs = limitAttributes(stage, { ...newPos, scale: newScale });

  stage.to({
    x: newAttrs.x,
    y: newAttrs.y,
    scaleX: newAttrs.scale,
    scaleY: newAttrs.scale,
    duration: 0.1,
  });
}

function limitAttributes(stage, newAttrs) {
  const box = stage.findOne('Image').getClientRect();
  const minX = -box.width + stage.width() / 2;
  const maxX = stage.width() / 2;

  const x = Math.max(minX, Math.min(newAttrs.x, maxX));

  const minY = -box.height + stage.height() / 2;
  const maxY = stage.height() / 2;

  const y = Math.max(minY, Math.min(newAttrs.y, maxY));

  const scale = Math.max(0.05, newAttrs.scale);

  return { x, y, scale };
}

export default () => {
  const stageRef = React.useRef();
  const { width, height } = useStore((s) => ({
    width: s.width,
    height: s.height,
  }));
  const setSize = useStore((s) => s.setSize);
  const scale = useStore((state) => state.scale);

  const polyline = useStore((s) => s.polyline);

  const setPolyline = useStore((s) => s.setPolyline);
  const mode = useStore((s) => s.modeInteraction);


  React.useEffect(() => {
    function checkSize() {
      const container = document.querySelector('.right-panel');
      setSize({
        width: container.offsetWidth,
        height,
      });
    }
    checkSize();
    window.addEventListener('resize', checkSize);
    return () => window.removeEventListener('resize', checkSize);
  }, []);

  return (
    <React.Fragment>
      <Stage
        ref={stageRef}
        width={width}
        height={height}
        scaleX={scale}
        scaleY={scale}
        className="canvas"
        draggable={true}
        onClick={(e) => {
          const point = getRelativePointerPosition(e.target.getStage()); 

          if (mode === "add") { 
            const newPolyline = polyline.concat([point.x, point.y])   
            setPolyline(newPolyline)       
          }
          else if (mode === "remove"){
              let i = closestNode(polyline, point.x, point.y)
              if (i >= 0) {
                polyline.splice(2*i, 2)
                setPolyline(polyline)       
              }
          }
          else if (mode === "split"){
            let i = closestEdge(polyline, point.x, point.y);
            if (i >= 0) {
              console.log(polyline)
              polyline.splice(2*i + 2, 0, point.x, point.y)
              console.log(polyline)

              setPolyline(polyline)       
            }
          }

        }}
      >
        <BaseImage />
        <Polyline />
      </Stage>
      <div className="zoom-container">
        <button
          onClick={() => {
            zoomStage(stageRef.current, 1.2);
          }}
        >
          +
        </button>
        <button
          onClick={() => {
            zoomStage(stageRef.current, 0.8);
          }}
        >
          -
        </button>
      </div>
    </React.Fragment>
  );
};


/*
        onWheel={ (e) => {
          if (e.evt.ctrlKey ) {

            e.evt.preventDefault();
            let scale = 1.2
            let factor = e.evt.deltaY > 0 ? 1/scale : scale
            zoomStage(stageRef.current, factor)
          }
        }}
*/