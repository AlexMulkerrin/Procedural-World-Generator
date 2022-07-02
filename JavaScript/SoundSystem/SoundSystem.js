const noteNameID = {
A0:0,AS0:1,B0:2,
C1:3,CS1:4,D1:5,DS1:6,E1:7,F1:8,FS1:9,G1:10,GS1:11,A1:12,AS1:13,B1:14,
C2:15,CS2:16,D2:17,DS2:18,E2:19,F2:20,FS2:21,G2:22,GS2:23,A2:24,AS2:25,B2:26,
C3:27,CS3:28,D3:29,DS3:30,E3:31,F3:32,FS3:33,G3:34,GS3:35,A3:36,AS3:37,B3:38,
C4:39,CS4:40,D4:41,DS4:42,E4:43,F4:44,FS4:45,G4:46,GS4:47,A4:48,AS4:49,B4:50,
C5:51,CS5:52,D5:53,DS5:54,E5:55,F5:56,FS5:57,G5:58,GS5:59,A5:60,AS5:61,B5:62,
C6:63,CS6:64,D6:65,DS6:66,E6:67,F6:68,FS6:69,G6:70,GS6:71,A6:72,AS6:73,B6:74,
C7:75,CS7:76,D7:77,DS7:78,E7:79,F7:80,FS7:81,G7:82,GS7:83,A7:84,AS7:85,B7:86,
C8:87
}

function SoundSystem() {
	this.ctx = new AudioContext();
	this.tone = [];
	this.isMuted = false;
}
SoundSystem.prototype.update = function() {
	if (this.isMuted == false) {
		this.updateTones();
	}
}
SoundSystem.prototype.updateTones = function() {
	for (var i=0; i<this.tone.length; i++) {
		if (this.tone[i].isPlaying) {
			this.tone[i].timeSpent += 0.2;
			if (this.tone[i].timeSpent > this.tone[i].duration) {
				this.tone[i].fade();
			}
		}
	}
	var newTone = [];
	for (var i=0; i<this.tone.length; i++) {
		if (this.tone[i].isPlaying) {
			newTone.push(this.tone[i]);
		}
	}
	this.tone = newTone;
}
SoundSystem.prototype.createTone = function(noteID, duration) {
	this.tone.push(new Tone( this.ctx, noteID, duration));
}
function Tone(audioContext, noteID, duration) {
	this.duration = duration || 0;
	this.timeSpent = 0;

	this.oscillator = audioContext.createOscillator();
	this.oscillator.type = "triangle";
	this.oscillator.frequency.value = getNoteFrequency(noteID);
	this.oscillator.start();

	this.gainNode = audioContext.createGain();
	this.gainNode.gain.value = 0.2;
	this.oscillator.connect(this.gainNode);
	this.gainNode.connect(audioContext.destination);
	this.isPlaying = true;
}
Tone.prototype.fade = function() {
	this.gainNode.gain.value /= 1.2;
	if (this.gainNode.gain.value < 0.0001) {
		this.isPlaying = false;
		this.gainNode.disconnect();
	}
}

function getNoteFrequency(noteID) {
	return Math.pow(2, ((noteID - 49)/12)) * 440;
}
