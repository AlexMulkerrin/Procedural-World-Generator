const mouseClickID = {leftClick:1, middleClick:2, rightClick:3};

function Mouse() {
	this.x = -100;
	this.y = -100;

	this.mapX = NONE;
	this.mapY = NONE;
	this.lastMapX = NONE;
	this.lastMapY = NONE;

	this.tileX = NONE;
	this.tileY = NONE;

	this.isOverMap = false;
	this.isDragSelecting = false;

	this.isOverMinimap = false;

	this.whichClick = NONE;
	this.isDown = false;

	this.hoveredButton = NONE;
	this.hoveredAgentList = [];
	this.hoveredCity = NONE;
}
