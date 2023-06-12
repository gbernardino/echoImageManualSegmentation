import {create} from "zustand";

const useStore = create(set => ({
  width: window.innerWidth,
  height: window.innerHeight,
  setSize: ({ width, height }) => set({ width, height }),

  imageWidth: 100,
  imageHeight: 100,

  imageURL : null,
  setImageURL : url => set({imageURL: url}),

  setImageSize: size =>
    set(() => ({ imageWidth: size.width, imageHeight: size.height })),
  scale: 1,
  setScale: scale => set({ scale }),

  brightness: 0,
  setBrightness: brightness => set({ brightness }),

  modeInteraction : "add",
  setInteraction : modeInteraction => set({modeInteraction}),

  polyline : [],
  setPolyline : polyline => set({polyline})
}));

export default useStore;
