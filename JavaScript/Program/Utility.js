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
	var colourstring='#';
	for (var i=0; i<6; i++) {
	hexDigit=Math.floor(Math.random()*16);
	hexDigit= hexDigit.toString(16);
	colourstring+=hexDigit;
	}
	return colourstring;
}
function getColourValue(colour) {
	// todo
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
