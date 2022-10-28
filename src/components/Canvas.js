import React from 'react';
import Konva from 'konva';
import { Stage, Line, Layer } from 'react-konva';

import BaseImage from './BaseImage';
import Polyline from './Polyline'
import useStore from '../store';


function zoomStage(stage, scaleBy) {
  const oldScale = stage.scaleX();

  const pos = {
    x: stage.width() / 2,
    y: stage.height() / 2,
  };

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
        
        onWheel={(e) => {
          e.evt.preventDefault();
          const stage = stageRef.current;

          const dx = -e.evt.deltaX;
          const dy = -e.evt.deltaY;
          const pos = limitAttributes(stage, {
            x: stage.x() + dx,
            y: stage.y() + dy,
            scale: stage.scaleX(),
          });
          stageRef.current.position(pos);
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
