export class Units{
    constructor(){
        this.sor = [];
        this.addSOR(0,0,1,1,'Pixels');
    }

    addSOR(x0,y0,xScale,yScale, name){
        this.sor.push(
            {x0: x0, y0: y0, xScale: xScale, yScale: yScale, name: name}
        )
    }
    getOptionsList(){
        /* Gets the list of options for a dropdown component */
        let r = [];
        for (let i =0; i< this.sor.length; i += 1){
            r.push({value : String(i), label : this.sor[i].name});
        }
        return r;
    }

};

export  function applySOR(points, u ){
    let points_trnf =  [...points]
    for (let i =0; i < points.length; i +=2 ){
        points_trnf[i] = (points[i+1] - u.x0) * u.xScale 
        points_trnf[i + 1] = (points[i+1] - u.y0) * u.yScale 
    }
    return points_trnf
}


export function RegionDataTypeToString(i){
    /* For dicom parsing, detect what type of region is*/
    switch(i){
      case 1:
        return "Tissue"
      case 2:
        return "Color Flow"
      case 3:
        return "PW Spectral Doppler"
      case 4:
        return "CW Spectral Doppler"
      case 5:
        return "Doppler Mean Trace"
      case 6:
        return "Doppler Mode Trace"
      case 7:
        return "Doppler Max Trace"
      case 8:
        return "Volume Trace"
      case 10:
        return "ECG Trace"
      case 11:
        return "Pulse Trace"
      case 12:
        return "Phonocardiogram Trace"
      case 13:
        return "Gray bar"
      case 14:
        return "Color bar"
      case 15:
        return "Integrated Backscatter"
      case 16:
        return "Area Trace"
      case 16:
        return "d(area)/dt"
      case 18:
        return "Other Physiological (Amplitude vs. Time) input"
      default:
        return "Unknown"
    }
  }
  