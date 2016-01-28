var bmpInput = document.getElementById("bmp-source");
bmpInput.addEventListener("change", handleBMPInput, false);

var bmp = null;
var canvas = document.getElementById("bitmap-render");
setInterval(update, 200);

function handleBMPInput (e) {
	var file = e.target.files[0];
	var reader = new FileReader();  
 	reader.addEventListener("load",
                       processImage, false); 
 	reader.readAsArrayBuffer(file);
} 

function processImage (e) {
	var buffer = e.target.result;
	bmp = new BMP(buffer);

	var context = canvas.getContext('2d');
	bmp.render(canvas);
}

function update () {
	var context = canvas.getContext('2d');
	context.clearRect(0, 0, canvas.width, canvas.height);
	if (bmp != null){	
		canvas.style.maxWidth = canvas.width + "px";
		canvas.width = bmp.getWidth();
		canvas.height = bmp.getHeight();
		bmp.render(canvas);
	}
}

function flip (vertical) {
	if (bmp != null)
		if(vertical)
			bmp.flip(Direction.VERTICAL);
		else
			bmp.flip(Direction.HORIZONTAL);
}

function rotate (ccw) {
	if (bmp != null)
		bmp.rotate(ccw);
}
