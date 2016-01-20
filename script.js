var bmpInput = document.getElementById("bmp-source");
bmpInput.addEventListener("change", handleBMPInput, false);

var bmp;
var canvas = document.getElementById("bitmap-render");

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
	setInterval(update, 500);
}

function update () {
	var context = canvas.getContext('2d');
	context.clearRect(0, 0, canvas.width, canvas.height);
	bmp.render(canvas);
}
