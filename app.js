const vizualiser = (function(){
	'use strict'
	let audio;
	let canvas;

	let context = new (window.AudioContext || window.webkitAudioContext)();

	const init = (audioSelector,canvasSelector,titleSelector)=>{
		audio = document.querySelector(audioSelector);
		canvas = document.querySelector(canvasSelector);
	}

	const loadAudio = (url)=>{
		canvas.width = window.innerWidth;
		canvas.height = window.innerHeight;

		audio.src = url;
		audio.pause();

		const src = context.createMediaElementSource(audio);
		const analyser = context.createAnalyser();

		src.connect(analyser);
		analyser.connect(context.destination);

		analyser.fftSize = 512;
		const bufferLength = analyser.frequencyBinCount;
		const dataArray = new Uint8Array(bufferLength);
		const rslide = document.getElementById('r');
		const gslide = document.getElementById('g');
		const bslide = document.getElementById('b');

		const width = canvas.width;
		const height = canvas.height;

		const barWidth = (width / bufferLength)*2.5;
		const ctx = canvas.getContext("2d");
		let barHeight;
		
		let x = 0;	

		function render() {
			requestAnimationFrame(render);
			x = 0;
			analyser.getByteFrequencyData(dataArray);
			ctx.fillStyle = "rgba(0,0,0,0.2)"; 
			ctx.fillRect(0, 0, width, height);
	  
			let r, g, b;
			let bars = 200;
			let copy =dataArray;

			let intensity = 0;
			for (var i = 0; i < dataArray.length; i++) {
			  intensity += dataArray[i];
			}
			intensity /= dataArray.length;
			intensity = (1-intensity/bufferLength);

			for (let i = 0; i < bars; i++) {
			  barHeight = ((dataArray[i]))*2.2;
				let avg =(dataArray[i]/bufferLength);
				r = Math.ceil(rslide.value*avg);
				g = Math.ceil(gslide.value*avg);
				b = Math.ceil(bslide.value*avg);
	  	  
			  ctx.fillStyle = `rgb(${r},${g},${b})`;
			  ctx.fillRect(x, (height - barHeight), barWidth, barHeight);
			  x += barWidth + 5;
			}
		}
	  
	  audio.play();
	  render();
	}

	return {
		init: init,
		loadAudio:loadAudio
	}
});

window.onload = ()=>{
	const file = document.getElementById('file-input');

	file.onchange = function(){
		const files = this.files;
		const app = vizualiser();
		const title = document.getElementById('title');

		title.innerText = files[0].name;
		app.init('#audio','#canvas',"#title");
		app.loadAudio(URL.createObjectURL(files[0]));
	}

}