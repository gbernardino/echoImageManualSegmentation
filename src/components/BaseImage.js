import React from "react";
import { Image, Layer } from "react-konva";
import useImage from "use-image";


import useStore from "../store";

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

const IMAGE_NUMBER = 1 + Math.round(Math.random() * 1);
const IMAGE_URL = `image-${IMAGE_NUMBER}.jpg`;

export default () => {
  const imgURL = useStore(s => s.imageURL);
  const url = imgURL === null ? IMAGE_URL : imgURL
  const [image] = useImage(url, "Anonymous");

  const setImageSize = useStore(state => state.setImageSize);
  const setScale = useStore(state => state.setScale);
  const setSize = useStore(state => state.setSize);
  const width = useStore(state => state.width);
  const height = useStore(state => state.height);

  const { brightness } = useStore();
  const polyline = useStore((s) => s.polyline);
  const setPolyline = useStore((s) => s.setPolyline);
  const mode = useStore((s) => s.modeInteraction);


  React.useEffect(() => {
    if (!image) {
      return;
    }
    const scale = Math.min(width / image.width, height / image.height);
    setScale(scale);
    setImageSize({ width: image.width, height: image.height });

    const ratio = image.width / image.height;
    setSize({
      width: width,
      height: width / ratio
    });
  }, [image, width, height, setScale, setImageSize, setSize]);

  const layerRef = React.useRef(null);

  React.useEffect(() => {
    const canvas = layerRef.current.getCanvas()._canvas;
    canvas.style.filter = `brightness(${(brightness + 1) * 100}%)`;
  }, [brightness]);

  return (
    <Layer ref={layerRef}  >
      <Image image={image} />

    </Layer>
  );
};
