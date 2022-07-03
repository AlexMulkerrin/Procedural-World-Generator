const NONE = -1;

function randomInteger(limit) {
	return Math.floor(Math.random()*limit);
}
function randomChoice(options) {
	var pick = randomInteger(options.length);
	return options[pick];
}
function randomName() {
	var vowels = ['a','e','i','o','u'];
	var consonants= ['p','t','k','m','n'];
	var text="";
	var wordLength=randomInteger(5)+3;
	var letterType=randomInteger(2);
	for (var j=0; j<wordLength; j++) {
		if (letterType==0) {
			text +=randomChoice(consonants);
			letterType++;
		} else {
			text +=randomChoice(vowels);
			letterType=0;
		}
		if (j==0) text=text.toUpperCase();
	}
	return text;
}
function randomColour() {
	return colourHexString(randomInteger(256) ,randomInteger(256), randomInteger(256));
}

function adjustColourValue(colour, percent) {
	var components = [];
    components = colourComponents(colour);
    for (var i=0; i<components.length; i++) {
        components[i] = Math.floor(components[i]*percent);
        if (components[i]>255) components[i]=255;
    }
    return colourHexString(components[0],components[1],components[2]);
}
function colourHexString(red,green,blue) {
    var colourString="#";
    if (red<16) colourString += "0";
    colourString += red.toString(16);
    if (green<16) colourString += "0";
    colourString += green.toString(16);
    if (blue<16) colourString += "0";
    colourString += blue.toString(16);
    return colourString;
}
function colourComponents(colour) {
    var components=[], string;
    for (var i=0; i<3; i++) {
        // "#rrggbb"
        string = colour[1+i*2]+colour[2+i*2];
        components[i]=parseInt(string,16);
    }
    return components;
}

function create2DArray(width, height, initialValue) {
	result = [];
	for (var i=0; i<width; i++) {
		result[i] = [];
		for (var j=0; j<height; j++) {
				result[i][j] = initialValue;
			}
		}
	return result;
}

function printUnitsMeters(value) {
	if (Math.abs(value) >= 1000000) {
		var thousands = Math.floor(value/1000000);

		var remainder = Math.floor((value - thousands*1000000)/1000);
		if (remainder < 100) remainder = "0" + remainder;
		if (remainder < 10) remainder = "00" + remainder;
		if (remainder == 0 ) remainder = "000";

		return thousands+","+remainder+" km";
	} else if (value >= 1000) {
		return Math.floor(value/1000)+" km";
	} else {
		return Math.floor(value)+" m";
	}
}
function printFixedWidthNumber(value,width) {
	if (value<10) {
		return "0"+value;
	} else {
		return value;
	}
}
