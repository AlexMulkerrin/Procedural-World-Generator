
function SpriteSheet(inFactions) {
	console.log(inFactions)
	this.factionColour = [];
	this.contrast = [];
	for (var i=0; i<inFactions.length; i++) {
		this.factionColour[i] = inFactions[i].colour;
	}
	console.log(this.factionColour)

	this.output = document.createElement("canvas");
	this.ctx = this.output.getContext("2d");
	this.generateSpriteSheet();
}
SpriteSheet.prototype.generateSpriteSheet = function() {
	var iconSize = iconShape[0].length;
	this.output.width = iconSize * this.factionColour.length;
	this.output.height = iconSize;

	for (var f=0; f<this.factionColour.length; f++) {

		for (var i=0; i<iconShape.length; i++) {
			for (var j=0; j<iconShape[i].length; j++) {
				for (var k=0; k<iconShape[i][j].length; k++) {
					switch (iconShape[i][j][k]) {
						case pixelTypeID.transparent:
						break;
						case pixelTypeID.primary:
							this.ctx.fillStyle = this.factionColour[f];
							this.ctx.fillRect(j+f*iconSize,k,1,1);
						break;
						case pixelTypeID.border:
							this.ctx.fillStyle = colour.textBlack;
							this.ctx.fillRect(j+f*iconSize,k,1,1);
						break;
					}
				}
			}
		}
		for (var i=0; i<iconSymbol.length; i++) {
			for (var j=0; j<iconSymbol[i].length; j++) {
				for (var k=0; k<iconSymbol[i][j].length; k++) {
					switch (iconSymbol[i][j][k]) {
						case pixelTypeID.transparent:
						break;
						case pixelTypeID.primary:
							this.ctx.fillStyle = colour.textBlack;
							this.ctx.fillRect(5+j+f*iconSize,5+k,1,1);
						break;
					}
				}
			}
		}
	}
}
