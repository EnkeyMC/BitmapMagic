// enum: vertical, horizontal
var Direction = {
	HORIZONTAL: 0,
	VERTICAL: 1
}

// loads this.bitmap and stores it
function BMP (buffer) {
	this.imageData = null;
	this.bitmap = {};

	this.storeBitmap(buffer);  
	this.storeImageData();
}

BMP.prototype = {
  	constructor: BMP,

  	// ccw = true, false
  	rotate:function (ccw) {
  		
  	},

  	flip:function (direction) {
  		
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
		  		var index2 = x * this.bitmap.infoheader.biBitCount + stride * y;

		  		if (this.bitmap.infoheader.biBitCount == 1){
			  		
		  		}else if (this.bitmap.infoheader.biBitCount == 8){
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
  	}
};