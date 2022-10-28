import React, {useCallback} from "react";
import Canvas from "./Canvas";
import useStore from "../store";
import {useDropzone} from 'react-dropzone';
import{generateIndices, reconstructEcholine} from './reconstructionEchocardiography';


import * as cornerstone from "cornerstone-core";
import * as cornerstoneMath from "cornerstone-math";
import * as cornerstoneTools from "cornerstone-tools";
import Hammer from "hammerjs";
import * as cornerstoneWADOImageLoader from "cornerstone-wado-image-loader";
// import * as cornerstoneWebImageLoader from "cornerstone-web-image-loader";
import * as dicomParser from "dicom-parser";
import Polyline from "./Polyline";



var savePixels = require("save-pixels")
const hdf5 = window.hdf5;

var dcmjs = require('dcmjs');


cornerstoneTools.external.cornerstone = cornerstone;
cornerstoneTools.external.cornerstoneMath = cornerstoneMath;
cornerstoneTools.external.Hammer = Hammer;
cornerstoneWADOImageLoader.external.dicomParser = dicomParser;
cornerstoneWADOImageLoader.external.cornerstone = cornerstone;
// cornerstoneWebImageLoader.external.cornerstone = cornerstone;

export default () => {
  const { setBrightness } = useStore();
  const { setInteraction } = useStore();
  const { setImageURL } = useStore();
  const setPolyline = useStore((s) => s.setPolyline);

  // TODO: save dicom, and pixel to physical functions
  // TODO: select echo region
  // TODO: add frame selector

  cornerstoneWADOImageLoader.configure({ useWebWorkers: false });


  const onDrop = useCallback(acceptedFiles => {
    // Do something with the files
    let datafilename = acceptedFiles[0].filename;
    let type = acceptedFiles[0].type;
    console.log(acceptedFiles[0])
    let reader = new FileReader();
    reader.onloadend = function(evt) { 
      let barr = evt.target.result;

      if (type ==  'application/h5'){
        var f = new hdf5.File(barr, datafilename);
        // do something with f...
        console.log(f)
        let idx = generateIndices(f, 0.0001);
        let im = reconstructEcholine(f, idx, 0);
        console.log(im)
        let imCanvas = savePixels(im.pick(-1, -1, 0), "CANVAS");
        setImageURL(imCanvas.toDataURL());
      }
      else if (type ==  'application/dicom'){
          console.log(barr)
          let DicomDict = dcmjs.data.DicomMessage.readFile(barr);
          const dataset = dcmjs.data.DicomMetaDictionary.naturalizeDataset(DicomDict.dict);
          console.log(dataset)
          var imageId = cornerstoneWADOImageLoader.wadouri.fileManager.add( acceptedFiles[0]);           // If want to access a specific frame, add ?frame=t where t is the index: Ex           imageId = imageId + '?frame=100'

          console.log(imageId) 
          cornerstone.loadAndCacheImage(imageId).then(image => setImageURL(image.getCanvas().toDataURL()));
        
      }
    }
    reader.readAsArrayBuffer(acceptedFiles[0]);
  }, []);


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
            <button onClick={(e) =>
                { 
                  setPolyline([]);       
                }}
                type="button"> 
                Delete segmentation
           </button>
          </div>
  
          <div>
            <button  type="button"> Download segmentation </button>
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
