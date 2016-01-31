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

	var context = canvas.getContext('2d');
	bmp.render(canvas);
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
