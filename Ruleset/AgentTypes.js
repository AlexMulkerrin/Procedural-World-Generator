// {"name":"Battleship", "attack":18, "defence":12, "move":4, "cost":160, "locomotion":"sea", "special":"none", "vision":2, "required advance":"steel"},
const locomotionID = { ship:0 };

const agentTypeID = {battleship:0};

const agentTypes = [
	{name:"battleship", locomotion:locomotionID.ship, maxHealth:100, size:100, speed:20000, damage:30, range:40000, cooldown:10, radar:100000}
];
