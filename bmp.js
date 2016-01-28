// enum: vertical, horizontal
var Direction = {
	HORIZONTAL: 0,
	VERTICAL: 1
}

// loads bitmap and stores it
function BMP (buffer) {
	this.imageData = null;
	this.bitmap = {};

	this.storeBitmap(buffer);  
	this.storeImageData();
}

BMP.prototype = {
  	constructor: BMP,

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

      this.bitmap.infoheader.biWidth = height;
      this.bitmap.infoheader.biHeight = width;
      this.bitmap.stride = newStride;
      this.bitmap.pixels = rotated;

      this.storeImageData();
  	},

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
          calcY = rowWidth + stride * y;

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
  		this.storeImageData();
  	},

  	save:function (filename) {

  	},

  	render:function (canvas) {
  		if (this.imageData != null)
  		{
  			var ctx = canvas.getContext('2d');
  			ctx.putImageData(this.imageData, 
  				(canvas.width / 2) - (this.imageData.width / 2), 
  				(canvas.height / 2) - (this.imageData.height / 2) );
  		}
  	},

  	storeBitmap:function (buffer) {
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

        var start = this.bitmap.fileheader.bfOffBits;  
        this.bitmap.stride = Math.floor((this.bitmap.infoheader.biBitCount * this.bitmap.infoheader.biWidth + 31) / 32) * 4;
		this.bitmap.pixels = new Uint8Array(buffer, start);
  	},

  	// imageData is for canvas 
  	storeImageData: function () {
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

		  this.imageData.data = data;
  	},

    getWidth: function () {
      return this.bitmap.infoheader.biWidth;
    },

    getHeight: function () {
      return this.bitmap.infoheader.biHeight;
    }
};