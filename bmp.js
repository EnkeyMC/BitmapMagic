/*

  Author: Martin Omacht
  Description: Class for loading, saving, transforming and rendering BMP files

 */


// enum: vertical, horizontal
var Direction = {
	HORIZONTAL: 0,
	VERTICAL: 1
};

// Constructor that loads bitmap from buffer and stores it
function BMP(buffer) {
	this.imageData = null;
	this.bitmap = {};

	this.storeBitmap(buffer);
	this.storeImageData();
}

BMP.prototype = {
  	constructor: BMP,

    // Rotates bitmap by 90 degrees
  	// ccw (counter clockwise) = true, false
  	rotate:function (ccw) {
      var byteCount = Math.ceil(this.bitmap.infoheader.biBitCount / 8);
      var width = this.bitmap.infoheader.biWidth;
      var height = this.bitmap.infoheader.biHeight;
      var stride = this.bitmap.stride;
      var newStride = Math.floor((this.bitmap.infoheader.biBitCount * height + 31) / 32) * 4;
      var rotated = new Uint8Array(width * newStride * byteCount);
      var indexSrc;
      var indexDst;

  		if (!ccw){
        for (var y = 0; y < height; ++y) {
          for (var x = 0; x < width; x++) {
            indexSrc = y * stride + x * byteCount;
            indexDst = (width - x - 1) * newStride + y * byteCount;
            for (var b = 0; b < byteCount; b++)
              rotated[indexDst + b] = this.bitmap.pixels[indexSrc + b];
          }
        }
      }else{
        for (var y = 0; y < height; ++y) {
          for (var x = 0; x < width; x++) {
            indexSrc = y * stride + x * byteCount;
            indexDst = x * newStride + (height - y - 1) * byteCount;
            for (var b = 0; b < byteCount; b++)
              rotated[indexDst + b] = this.bitmap.pixels[indexSrc + b];
          }
        }
      }

      // swap dimensions
      this.bitmap.infoheader.biWidth = height;
      this.bitmap.infoheader.biHeight = width;
      // store new calculated stride
      this.bitmap.stride = newStride;
      // store rotated pixels
      this.bitmap.pixels = rotated;

      // generate new ImageData for canvas rendering
      this.storeImageData();
  	},

    // Flips bitmap verticaly or horizontaly
    // see: enum Direction (line 10)
  	flip:function (direction) {
      var height = this.bitmap.infoheader.biHeight;
      var byteCount = Math.ceil(this.bitmap.infoheader.biBitCount / 8);
      var rowWidth = this.bitmap.infoheader.biWidth * byteCount;
      var calcY;
      var inverse;
      var stride = this.bitmap.stride;

  		if (direction === Direction.VERTICAL ){

  			for (var y = 0; y < height / 2; y++) {
  				calcY = rowWidth + stride * y;
  				inverse = rowWidth + stride * (height - y - 2);

  				for (var x = 0; x < rowWidth; x++){
  					var tmp = this.bitmap.pixels[calcY + x];
  					this.bitmap.pixels[calcY + x] = this.bitmap.pixels[inverse + x];
  					this.bitmap.pixels[inverse + x] = tmp;
	  			}
  			}
  		}else{
        for (var y = 0; y < height; y++) {
          calcY = stride + stride * y;

          for (var x = 0; x / byteCount < (rowWidth / byteCount) / 2; x += byteCount){
            inverse = rowWidth - x - byteCount;
            for (var b = 0; b < byteCount; b++){
              var tmp = this.bitmap.pixels[calcY + x + b];
              this.bitmap.pixels[calcY + x + b] = this.bitmap.pixels[calcY + inverse + b];
              this.bitmap.pixels[calcY + inverse + b] = tmp;
            }
          }
        }
  		}

      // generate new ImageData for canvas rendering
  		this.storeImageData();
  	},


    // saves bitmap to file
    // currently working only for 24bit bitmaps
  	save:function (filename) {
      // allocate buffer for header information
      var headerBuffer = new ArrayBuffer(54);
      // create dataview for buffer
      datav = new DataView(headerBuffer);
      
      // write file header
	    datav.setUint16(0, this.bitmap.fileheader.bfType, true);
	    datav.setUint32(2, this.bitmap.fileheader.bfSize, true);
	    datav.setUint16(6, this.bitmap.fileheader.bfReserved1, true);
	    datav.setUint16(8, this.bitmap.fileheader.bfReserved2, true);
      datav.setUint32(10, this.bitmap.fileheader.bfOffBits, true);

      // write info header
	    datav.setUint32(14, this.bitmap.infoheader.biSize, true);
	    datav.setUint32(18, this.bitmap.infoheader.biWidth, true);
	    datav.setUint32(22, this.bitmap.infoheader.biHeight, true);
	    datav.setUint16(26, this.bitmap.infoheader.biPlanes, true);
	    datav.setUint16(28, this.bitmap.infoheader.biBitCount, true);
	    datav.setUint32(30, this.bitmap.infoheader.biCompression, true);
	    datav.setUint32(34, this.bitmap.infoheader.biSizeImage, true);
	    datav.setUint32(38, this.bitmap.infoheader.biXPelsPerMeter, true);
	    datav.setUint32(42, this.bitmap.infoheader.biYPelsPerMeter, true);
	    datav.setUint32(46, this.bitmap.infoheader.biClrUsed, true);
	    datav.setUint32(50, this.bitmap.infoheader.biClrImportant, true);
      
      // create blob from buffer and pixel array
      var blop = new Blob([datav.buffer, this.bitmap.pixels], {type: "application/octet-stream"});
      // save the file using FileSaver.min.js (github: https://github.com/eligrey/FileSaver.js/)
      saveAs(blop, filename);
  	},

    // render bitmap to given canvas
  	render:function (canvas) {
  		if (this.imageData != null)
  		{
  			var ctx = canvas.getContext('2d');
  			ctx.putImageData(this.imageData, 
  				(canvas.width / 2) - (this.imageData.width / 2), 
  				(canvas.height / 2) - (this.imageData.height / 2) );
  		}
  	},

    // reads bitmap data from buffer
  	storeBitmap:function (buffer) {
      // create DataView for buffer
  		var datav = new DataView(buffer); 

  		// file header
		  this.bitmap.fileheader = {}; 
		  this.bitmap.fileheader.bfType = 
		  	      datav.getUint16(0, true);
		  this.bitmap.fileheader.bfSize =
              datav.getUint32(2, true);
		  this.bitmap.fileheader.bfReserved1 =
              datav.getUint16(6, true);
		  this.bitmap.fileheader.bfReserved2 =
              datav.getUint16(8, true);
		  this.bitmap.fileheader.bfOffBits =
              datav.getUint32(10, true);

      // info header
      this.bitmap.infoheader = {};
		  this.bitmap.infoheader.biSize =
              datav.getUint32(14, true);
		  this.bitmap.infoheader.biWidth =
              datav.getUint32(18, true);
		  this.bitmap.infoheader.biHeight =
              datav.getUint32(22, true);
		  this.bitmap.infoheader.biPlanes =
              datav.getUint16(26, true);
		  this.bitmap.infoheader.biBitCount =
              datav.getUint16(28, true);
		  this.bitmap.infoheader.biCompression =
              datav.getUint32(30, true);
		  this.bitmap.infoheader.biSizeImage =
              datav.getUint32(34, true);
		  this.bitmap.infoheader.biXPelsPerMeter =
              datav.getUint32(38, true);
		  this.bitmap.infoheader.biYPelsPerMeter =
              datav.getUint32(42, true);
		  this.bitmap.infoheader.biClrUsed =
              datav.getUint32(46, true);
		  this.bitmap.infoheader.biClrImportant =
              datav.getUint32(50, true);

      // calculate stride (because pixels are aligned to DWORD for faster reading)
      this.bitmap.stride = Math.floor((this.bitmap.infoheader.biBitCount * this.bitmap.infoheader.biWidth + 31) / 32) * 4;
      // read pixels to byte array
		  this.bitmap.pixels = new Uint8Array(buffer, this.bitmap.fileheader.bfOffBits);
  	},

  	// generate and store ImageData for canvas rendering
  	storeImageData: function () {
      // create temporary canvas to generate ImageData
  		var canvas = document.createElement("canvas");
  		var ctx = canvas.getContext("2d");
  		var Width = this.bitmap.infoheader.biWidth;
  		var Height = this.bitmap.infoheader.biHeight;
  		this.imageData = ctx.createImageData(Width, Height);
  		var data = this.imageData.data;
  		var bmpdata = this.bitmap.pixels;
  		var stride = this.bitmap.stride;

  		for (var y = 0; y < Height; ++y) {
  		 	for (var x = 0; x < Width; ++x) {
		  		var index1 = (x+Width*(Height-y))*4;
		  		var index2 = x * Math.ceil(this.bitmap.infoheader.biBitCount / 8) + stride * y;

          // store pixels based on bit depth
		  		if (this.bitmap.infoheader.biBitCount == 8 || this.bitmap.infoheader.biBitCount == 1){
		  			data[index1] = bmpdata[index2];
			  		data[index1 + 1] = bmpdata[index2];
			  		data[index1 + 2] = bmpdata[index2];
			  		data[index1 + 3] = 255;
		  		}else if (this.bitmap.infoheader.biBitCount == 24){
		  			data[index1] = bmpdata[index2 + 2];
			  		data[index1 + 1] = bmpdata[index2 + 1];
			  		data[index1 + 2] = bmpdata[index2];
			  		data[index1 + 3] = 255;
		  		}else {
		  			alert("Error: unknown bit depth");
		  			return;
		  		}
  		 	}
		  }

      // store pixels
		  this.imageData.data = data;
  	},

    getWidth: function () {
      return this.bitmap.infoheader.biWidth;
    },

    getHeight: function () {
      return this.bitmap.infoheader.biHeight;
    },
    
    getFileHeader: function (){
        return this.bitmap.fileheader;
    },
    
    getInfoHeader: function () {
        return this.bitmap.infoheader;
    }
};