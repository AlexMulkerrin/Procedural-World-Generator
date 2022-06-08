const zoomScales = [
/* in meters 1m to 100,000 km */
1,2,5, 10,20,50, 100,200,500, 1000,2000,5000, 10000,20000,50000, 100000,200000,500000, 1000000,2000000,5000000, 10000000,20000000,50000000, 100000000];

function Control(inSimulation) {
	this.c = document.getElementById("canvas");
	this.targetSimulation = inSimulation;

	var planet = this.targetSimulation.planet;
	this.zoomLevel = zoomScales.length-1;
	this.cameraX = -1*Math.floor((zoomScales[this.zoomLevel]-planet.circumference)/2);
	this.cameraY = -1*Math.floor((zoomScales[this.zoomLevel]*this.c.height/this.c.width-planet.poleSpan)/2);

	this.mouse = new Mouse();

	var t = this;
	this.c.onmousemove = function(e){t.handleMouseMove(e)};

	this.c.onmousewheel = function (e) {t.handleMouseWheel(e.wheelDelta); return false; };
    // special case for Mozilla...
    this.c.onwheel = function (e) {t.handleMouseWheel(e); return false; };
}

Control.prototype.handleMouseMove = function(event) {
	this.mouse.x = event.layerX;
	this.mouse.y = event.layerY;

	this.updateMouse();
}
Control.prototype.updateMouse = function() {
	var p = this.targetSimulation.planet;
	var m = this.mouse;
	m.mapX = (m.x * zoomScales[this.zoomLevel] / this.c.width) + this.cameraX;
	m.mapY = (m.y * zoomScales[this.zoomLevel] / this.c.width) + this.cameraY;

	m.isOverMap = true;
	if (m.mapX<0 || m.mapX>p.circumference || m.mapY>p.poleSpan || m.mapY<0) {
		m.isOverMap = false;
	}
}
Control.prototype.handleMouseWheel = function(event) {
	var change = -event.deltaY || event.wheelDelta;
	if (change < 0) {
		this.zoomLevel++;
		if (this.zoomLevel >= zoomScales.length) {
			this.zoomLevel = zoomScales.length-1;
		} else {
			var offsetX = this.mouse.mapX - this.cameraX;
			this.cameraX += offsetX - zoomScales[this.zoomLevel] / zoomScales[this.zoomLevel-1] * offsetX ;

			var offsetY = this.mouse.mapY - this.cameraY;
			this.cameraY += offsetY - zoomScales[this.zoomLevel] / zoomScales[this.zoomLevel-1] * offsetY ;
		}
	} else if (change > 0) {
		this.zoomLevel--;
		if (this.zoomLevel < 0) {
			this.zoomLevel = 0;
		} else {
			var offsetX = this.mouse.mapX - this.cameraX;
			this.cameraX += offsetX - zoomScales[this.zoomLevel] / zoomScales[this.zoomLevel+1] * offsetX ;

			var offsetY = this.mouse.mapY - this.cameraY;
			this.cameraY += offsetY - zoomScales[this.zoomLevel] / zoomScales[this.zoomLevel+1] * offsetY ;

		}
	}
	//this.updateMouse();
}

Control.prototype.update = function() {
	//this.cameraX -= 10000;
}
