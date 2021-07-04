var ndarray = require("ndarray")
var ndarrayops = require("ndarray-ops")

export function generateIndices(hdf5, desiredPixelSize) {
    let tissue = hdf5.get('Tissue')
    let imageShape = tissue.shape
    let nLines = imageShape[1]
    let nPixelsR = imageShape[2];
    
    let dtheta = tissue.attrs['Width'] / nLines
    let theta0 = - tissue.attrs['Width'] /2 
    let dr = tissue.attrs['DepthEnd'] / (nPixelsR)

    let tilt = tissue.attrs['Tilt']

    let xmin = 0
    let xmax = tissue.attrs['DepthEnd']
    let ymax = tissue.attrs['DepthEnd'] * Math.sin(tissue.attrs['Width'] /2 )
    let ymin = - ymax


    let nPixelsX = Math.ceil((xmax - xmin)/desiredPixelSize)
    let nPixelsY = Math.ceil((ymax - ymin)/desiredPixelSize)
    let pixelSize = [(xmax - xmin)/nPixelsX, (ymax - ymin)/nPixelsY]
    let center = [0  - tissue.attrs['Origo'][0]/pixelSize[0], nPixelsY/2 - tissue.attrs['Origo'][1]/pixelSize[1]] 

    // Generate the coordinates
    let X = ndarray(new Float32Array(nPixelsX*nPixelsY), [nPixelsX,nPixelsY])
    let Y = ndarray(new Float32Array(nPixelsX*nPixelsY), [nPixelsX,nPixelsY])
    for (let i = 0; i < nPixelsX; i++) {
        for (let j = 0; j < nPixelsY; j++) {
            X.set(i,j,xmin + i * (xmax - xmin)/nPixelsX)
            Y.set(i,j,ymin + j * (ymax - ymin)/nPixelsY)
        }
    }

    //Create the blank matrix
    let R_idx = ndarray(new Int32Array(nPixelsX*nPixelsY), [nPixelsX,nPixelsY])
    let theta_idx  = ndarray(new Int32Array(nPixelsX*nPixelsY), [nPixelsX,nPixelsY])

    for (let i = 0; i < nPixelsX; i++) {
        for (let j = 0; j < nPixelsY; j++) {
            let x = X.get(i,j);
            let y = Y.get(i,j)
            R_idx.set(i,j, Math.round( Math.sqrt(x*x + y*y)/dr ))
            theta_idx.set(i,j, Math.round( (Math.atan(y/x) - theta0)/dtheta) )
        }
    }

    return {R_idx: R_idx, theta_idx : theta_idx, nPixelsX: nPixelsX, nPixelsY : nPixelsY}
}

export function reconstructEcholine(hdf5, indices, t) {
    let tissue = hdf5.get('Tissue');
    let imageShape = tissue.shape
    let nLines = imageShape[1]
    let nPixelsR = imageShape[2];


    let imagePolar = ndarray(tissue.value, imageShape);
    let imagePolart = imagePolar.pick(t, null, null);

    let im = ndarray(new Float32Array(indices.nPixelsX*indices.nPixelsY), [indices.nPixelsX,indices.nPixelsY])

    for (let i = 0; i < indices.nPixelsX; i++) {
        for (let j = 0; j < indices.nPixelsY; j++) {
            let id_r =  indices.R_idx.get(i,j)
            let id_theta = indices.theta_idx.get(i,j)
            if (id_r < 0 || id_r >= nPixelsR ) {
                im.set(i,j, 0);
            }
            else if (id_theta < 0 || id_theta >= nLines) {
                im.set(i,j, 0);
            }
            else {
                im.set(i,j,  imagePolart.get(id_theta, id_r));
            }

        }
    }
    return im;
}