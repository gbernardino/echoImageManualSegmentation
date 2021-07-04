import React, {useCallback} from "react";
import Canvas from "./Canvas";
import useStore from "../store";
import {useDropzone} from 'react-dropzone';
import{generateIndices, reconstructEcholine} from './reconstructionEchocardiography';

var savePixels = require("save-pixels")
const hdf5 = window.hdf5;

export default () => {
  const { setBrightness } = useStore();
  const { setInteraction } = useStore();
  const { setImageURL } = useStore();

  const onDrop = useCallback(acceptedFiles => {
    // Do something with the files
    let datafilename = acceptedFiles[0].filename;
    let reader = new FileReader();
    reader.onloadend = function(evt) { 
      let barr = evt.target.result;
      var f = new hdf5.File(barr, datafilename);
      // do something with f...
      console.log(f)
      let idx = generateIndices(f, 0.0001);
      let im = reconstructEcholine(f, idx, 0);
      console.log(im)
      let imCanvas = savePixels(im.pick(-1, -1, 0), "CANVAS");
      setImageURL(imCanvas.toDataURL());

    }
    reader.readAsArrayBuffer(acceptedFiles[0]);
  }, [])


  const {getRootProps, getInputProps, isDragActive} = useDropzone({onDrop})

  return (
    <React.Fragment>
      <div  {...getRootProps()} style={{
        boxShadow: `0 0 5px grey}`,
        border: `1px solid grey`,
        textAlign: "center"
      }}>
      <input {...getInputProps()}  />
      {
        isDragActive ?
          <p>Drop the h5 here ...</p> :
          <p >Drag 'n' drop some files here, or click to select files</p>
      }
      </div>
      <div className="App">
        <div className="left-panel">
          <div>
          Brigthess
          <input
            id="slider"
            type="range"
            min="-1"
            max="1"
            step="0.05"
            defaultValue="0"
            onChange={e => {
              setBrightness(parseFloat(e.target.value));
            }}
          />
          </div>
        
        <div style={{
            flex_flow: "column wrap"
          }}
          onChange={(event) => {
              console.log(event.target.value)
              setInteraction(event.target.value)
            }}>
          <div>
          <input type="radio" value="add" name="interaction" /> Add
          </div>
          <div>      
          <input type="radio" value="remove" name="interaction" /> Remove
          </div>  
          <div>    
          <input type="radio" value="split" name="interaction" /> Split
          </div>  
          <div>
            <button type="button"> Download segmentation </button>
          </div>


        </div >
        </div> 
        <div className="right-panel">
          <Canvas />
        </div>
      </div>
    </React.Fragment>
  );
};
