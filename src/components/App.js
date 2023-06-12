import React, {useCallback, useState} from "react";
import Canvas from "./Canvas";
import useStore from "../store";
import {useDropzone} from 'react-dropzone';
import{generateIndices, reconstructEcholine} from './reconstructionEchocardiography';
import Dropdown from 'react-dropdown';

import * as cornerstone from "cornerstone-core";
import * as cornerstoneMath from "cornerstone-math";
import * as cornerstoneTools from "cornerstone-tools";
import Hammer from "hammerjs";
import * as cornerstoneWADOImageLoader from "cornerstone-wado-image-loader";
// import * as cornerstoneWebImageLoader from "cornerstone-web-image-loader";
import * as dicomParser from "dicom-parser";
import {Units, applySOR, RegionDataTypeToString} from  "./unit";
import 'react-dropdown/style.css';

var savePixels = require("save-pixels")
const hdf5 = window.hdf5;


var dcmjs = require('dcmjs');

cornerstoneTools.external.cornerstone = cornerstone;
cornerstoneTools.external.cornerstoneMath = cornerstoneMath;
cornerstoneTools.external.Hammer = Hammer;
cornerstoneWADOImageLoader.external.dicomParser = dicomParser;
cornerstoneWADOImageLoader.external.cornerstone = cornerstone;
// cornerstoneWebImageLoader.external.cornerstone = cornerstone;

function getCSV(polyline, u){
  let csvContent = "data:text/csv;charset=utf-8,";  
  let p = applySOR(polyline, u);
  csvContent += "x0, y0," + u.name + "\n";
  for (let i =0; i < p.length; i += 2){
    csvContent += String(p[i]) + "," + String(p[i+ 1]) + ", \n";
  }
  var encodedUri = encodeURI(csvContent);
  var link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", "my_data.csv");
  document.body.appendChild(link); // Required for FF
  
  link.click(); // This will download the data file named "my_data.csv".} 
}

export default () => {
  console.log('meow!')

  const { setBrightness } = useStore();
  const { setInteraction } = useStore();
  const { setImageURL } = useStore();
  const { polyline } = useStore();

  const setPolyline = useStore((s) => s.setPolyline);


  // TODO: save dicom, and pixel to physical functions
  // TODO: select echo region
  // TODO: add frame selector

  cornerstoneWADOImageLoader.configure({ useWebWorkers: false });

  const[units , setUnits] = useState(new Units());
  const[selectedUnitIdx, setSelectedUnitIdx] = useState(0);

  const onDrop = useCallback(acceptedFiles => {
    // Do something with the files
    let datafilename = acceptedFiles[0].filename;
    let type = acceptedFiles[0].type;
    let reader = new FileReader();
    reader.onloadend = function(evt) { 
      var dcm = false;
      var array = new Uint8Array(evt.target.result);
      var s = "";
      var start = 128, end = 132;
      for (var i = start; i < end; ++i) {
          s += String.fromCharCode(array[i]);
      }

      if (s == "DICM") {
        dcm = true;
      }
 
      let barr = evt.target.result;
      let u = new Units();
      

      if (type === 'application/h5'){
        var f = new hdf5.File(barr, datafilename);
        // do something with f...

        let idx = generateIndices(f, 0.0001);
        let im = reconstructEcholine(f, idx, 0);

        let imCanvas = savePixels(im.pick(-1, -1, 0), "CANVAS");
        setImageURL(imCanvas.toDataURL());
        // TODO  : add units

      }
      else if (type === 'application/dicom' | dcm){
          var imageId = cornerstoneWADOImageLoader.wadouri.fileManager.add( acceptedFiles[0]);           // If want to access a specific frame, add ?frame=t where t is the index: Ex           imageId = imageId + '?frame=100'
          cornerstone.loadAndCacheImage(imageId).then(image => setImageURL(image.getCanvas().toDataURL()));

          //TODO: Read the echo regions
          let DicomDict = dcmjs.data.DicomMessage.readFile(barr);
          const dataset = dcmjs.data.DicomMetaDictionary.naturalizeDataset(DicomDict.dict);
          for (let i =0; i < dataset.SequenceOfUltrasoundRegions.length; i++){
              u.addSOR(dataset.SequenceOfUltrasoundRegions[i].ReferencePixelX0, dataset.SequenceOfUltrasoundRegions[i].ReferencePixelX1, 
                dataset.SequenceOfUltrasoundRegions[i].PhysicalDeltaX, dataset.SequenceOfUltrasoundRegions[i].PhysicalDeltaY, RegionDataTypeToString( dataset.SequenceOfUltrasoundRegions[i].RegionDataType))
          }

      }
      else {
        console.log('error')
      }

      setUnits(u)
    }
    reader.readAsArrayBuffer(acceptedFiles[0]);
  }, []);


  const {getRootProps, getInputProps, isDragActive} = useDropzone({onDrop})

  const options = [
    'one', 'two', 'three'
  ];
  return (
    <React.Fragment>
      <div className="App">
        <div className="left-panel">
            <div  {...getRootProps()} style={{
              boxShadow: `0 0 5px grey}`,
              border: `1px solid grey`,
              textAlign: "center",
              top: 0,
              z_index: 999
            }}>
            <input {...getInputProps()}  />
                {
                  isDragActive ?
                    <p>Drop the h5 here ...</p> :
                    <p >Drag 'n' drop some files here, or click to select files</p>
                }
            </div>

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
          }}
          onChange={(event) => {
              setInteraction(event.target.value)
            }}>
          <div>
          <p> Node Interaction:</p>

          <input type="radio" value="add" name="interaction" /> Add
          <input type="radio" value="remove" name="interaction" /> Remove
          <input type="radio" value="split" name="interaction" /> Split
          </div>
          <br/>

          <Dropdown placeholder="Select export unit" options={units.getOptionsList()} onChange={(e) => setSelectedUnitIdx(e.value)}  ></Dropdown>
                    <div>
            <button onClick={(e) =>
                { 
                  setPolyline([]);       
                }}
                type="button" className ="button"> 
                Delete segmentation
           </button>
          </div>
  
          <div>
            <button  type="button" className ="button" onClick={(e)=> {
              console.log(selectedUnitIdx)
              getCSV(polyline, units.sor[selectedUnitIdx])

            }}> Download segmentation </button>
          </div>


        </div >
        </div> 

        <div className="right-panel">
          < Canvas/>
        </div>
      </div>
    </React.Fragment>
  );
};
