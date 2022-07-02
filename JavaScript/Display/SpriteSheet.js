
function SpriteSheet(inFactions) {
	this.factionColour = [];
	this.contrast = [];
	for (var i=0; i<inFactions.length; i++) {
		this.factionColour[i] = inFactions[i].colour;
	}

	this.output = document.createElement("canvas");
	this.ctx = this.output.getContext("2d");
	this.generateSpriteSheet();
}
SpriteSheet.prototype.generateSpriteSheet = function() {
	var iconSize = iconShape[0].length;
	this.output.width = iconSize * this.factionColour.length;
	this.output.height = iconSize * iconShape.length;

	for (var f=0; f<this.factionColour.length; f++) {

		for (var i=0; i<iconShape.length; i++) {
			for (var j=0; j<iconShape[i].length; j++) {
				for (var k=0; k<iconShape[i][j].length; k++) {
					switch (iconShape[i][j][k]) {
						case pixelTypeID.transparent:
						break;
						case pixelTypeID.primary:
							this.ctx.fillStyle = this.factionColour[f];
							this.ctx.fillRect(k+f*iconSize,j+i*iconSize,1,1);
						break;
						case pixelTypeID.primaryDarker:
							this.ctx.fillStyle = colour.agentWreck; // todo
							this.ctx.fillRect(k+f*iconSize,j+i*iconSize,1,1);
						break;
						case pixelTypeID.border:
							this.ctx.fillStyle = colour.textBlack;
							this.ctx.fillRect(k+f*iconSize,j+i*iconSize,1,1);
						break;
					}
				}
			}
		}
		for (var i=0; i<iconShape.length; i++) {
			for (var j=0; j<iconSymbol[0].length; j++) {
				for (var k=0; k<iconSymbol[0][j].length; k++) {
					switch (iconSymbol[0][j][k]) {
						case pixelTypeID.transparent:
						break;
						case pixelTypeID.primary:
							this.ctx.fillStyle = colour.textBlack;
							this.ctx.fillRect(5+k+f*iconSize,5+j+i*iconSize,1,1);
						break;
					}
				}
			}
		}
	}
}
