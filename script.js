var bmpInput = document.getElementById("bmp-source");
bmpInput.addEventListener("change", handleBMPInput, false);

var bmp = null;
var canvas = document.getElementById("bitmap-render");
setInterval(update, 200);

function handleBMPInput (e) {
	var file = e.target.files[0];
	var reader = new FileReader();  
 	reader.addEventListener("load", processImage, false); 
 	reader.readAsArrayBuffer(file);
} 

function processImage (e) {
	var buffer = e.target.result; // get result from FileReader
	bmp = new BMP(buffer); // see bmp.js for class implementation

	update();
}

function update () {
	var context = canvas.getContext('2d');
	// clear canvas
	context.clearRect(0, 0, canvas.width, canvas.height);

	if (bmp != null){
		// some styling for canvas
		canvas.style.maxWidth = canvas.width + "px";
		canvas.width = bmp.getWidth();
		canvas.height = bmp.getHeight();
		// render bitmap
		bmp.render(canvas);
        
        var fileheader = bmp.getFileHeader();
        var infoheader = bmp.getInfoHeader();
        
        // write header values
        document.getElementById("bfType").innerHTML = fileheader.bfType;
        document.getElementById("bfSize").innerHTML = fileheader.bfSize;
        document.getElementById("bfReserved1").innerHTML = fileheader.bfReserved1;
        document.getElementById("bfReserved2").innerHTML = fileheader.bfReserved2;
        document.getElementById("bfOffBits").innerHTML = fileheader.bfOffBits;
        
        document.getElementById("biSize").innerHTML = infoheader.biSize;
        document.getElementById("biWidth").innerHTML = infoheader.biWidth;
        document.getElementById("biHeight").innerHTML = infoheader.biHeight;
        document.getElementById("biPlanes").innerHTML = infoheader.biPlanes;
        document.getElementById("biBitCount").innerHTML = infoheader.biBitCount;
        document.getElementById("biCompression").innerHTML = infoheader.biCompression;
        document.getElementById("biSizeImage").innerHTML = infoheader.biSizeImage;
        document.getElementById("biXPelsPerMeter").innerHTML = infoheader.biXPelsPerMeter;
        document.getElementById("biYPelsPerMeter").innerHTML = infoheader.biYPelsPerMeter;
        document.getElementById("biClrUsed").innerHTML = infoheader.biClrUsed;
        document.getElementById("biClrImportant").innerHTML = infoheader.biClrImportant;


	}    
}

// vertical = true, false
function flip (vertical) {
	if (bmp != null)
		if(vertical)
			bmp.flip(Direction.VERTICAL);
		else
			bmp.flip(Direction.HORIZONTAL);
}

// ccw (counter clockwise) = true, false
function rotate (ccw) {
	if (bmp != null)
		bmp.rotate(ccw);
}

// saves bitmap
function save (){
    if (bmp != null)
        bmp.save("output.bmp");
}
