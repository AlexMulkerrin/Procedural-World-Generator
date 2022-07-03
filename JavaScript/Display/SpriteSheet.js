
function SpriteSheet(inFactions) {
	this.factionColour = [];
	this.contrast = [];
	for (var i=0; i<inFactions.length; i++) {
		this.factionColour[i] = inFactions[i].colour;
	}
	this.factionColour.push(colour.agentWreck);
	this.factionColour.push(colour.error);

	this.output = document.createElement("canvas");
	this.ctx = this.output.getContext("2d");
	this.generateSpriteSheet();
}
SpriteSheet.prototype.generateSpriteSheet = function() {
	var iconSize = iconShape[0].length;
	this.output.width = iconSize * this.factionColour.length;
	this.output.height = iconSize * iconShape.length * (iconSymbol.length+1);

	for (var f=0; f<this.factionColour.length; f++) {
		var darkerColour = adjustColourValue(this.factionColour[f],0.5);

		for (var i=0; i<iconShape.length; i++) {

			for (var s=0; s<iconSymbol.length+1; s++) {
				if (i == iconShape.length-1 && s == 1) break;
				for (var j=0; j<iconShape[i].length; j++) {
					for (var k=0; k<iconShape[i][j].length; k++) {
						var x = k+f*iconSize;
						var y = j+i*iconSize*(iconSymbol.length+1)+s*iconSize;
						if (f == this.factionColour.length-1) {
							// last entry is highlight
							if (iconShape[i][j][k] == pixelTypeID.border) {
								this.ctx.fillStyle = colour.textWhite;
								this.ctx.fillRect(x,y,1,1);
							}
						} else {
							switch (iconShape[i][j][k]) {
								case pixelTypeID.transparent:
								break;
								case pixelTypeID.primary:
									this.ctx.fillStyle = this.factionColour[f];
									this.ctx.fillRect(x,y,1,1);
								break;
								case pixelTypeID.primaryDarker:
									this.ctx.fillStyle = darkerColour;
									this.ctx.fillRect(x,y,1,1);
								break;
								case pixelTypeID.border:
									this.ctx.fillStyle = colour.textBlack;
									if (f == this.factionColour.length-2) {
										// second last is wreckage
										this.ctx.fillStyle = darkerColour;
									}
									this.ctx.fillRect(x,y,1,1);
								break;
							}
						}
					}
				}
			}
		}
		for (var i=0; i<iconShape.length-1; i++) { // no symbol on city icon
			for (var s=0; s<iconSymbol.length; s++) {
				for (var j=0; j<iconSymbol[s].length; j++) {
					for (var k=0; k<iconSymbol[s][j].length; k++) {
						var x = 5+k+f*iconSize;
						var y = 5+j+i*iconSize*(iconSymbol.length+1)+s*iconSize;
						if (f == this.factionColour.length-1) {
							// last entry is highlight
							if (iconSymbol[s][j][k] == pixelTypeID.primary) {
								this.ctx.fillStyle = colour.textWhite;
								this.ctx.fillRect(x,y,1,1);
							}
						} else {
							switch (iconSymbol[s][j][k]) {
								case pixelTypeID.transparent:
								break;
								case pixelTypeID.primary:
									this.ctx.fillStyle = colour.textBlack;
									if (f == this.factionColour.length-2) {
										// second last is wreckage
										this.ctx.fillStyle = darkerColour;
									}
									this.ctx.fillRect(x,y,1,1);
								break;
							}
						}
					}
				}
			}
		}
	}
}
