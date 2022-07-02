var program;
function loadProgram() {
	program = new Program();
}
function Program() {
	this.simulation = new Simulation();
	this.soundSystem = new SoundSystem();
	this.simulation.targetSoundSystem = this.soundSystem;
	this.display = new Display(this.simulation);
	this.control = new Control(this.simulation);
	this.display.targetControl = this.control;

	this.update();
}
Program.prototype.update = function() {
	this.simulation.update();
	this.control.update();
	this.display.update();
	this.soundSystem.update();

	var t = this;
	window.requestAnimationFrame( function(){t.update();});
}
