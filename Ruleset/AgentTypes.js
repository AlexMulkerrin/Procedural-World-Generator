// {"name":"Battleship", "attack":18, "defence":12, "move":4, "cost":160, "locomotion":"sea", "special":"none", "vision":2, "required advance":"steel"},
const locomotionID = {static:0, walker:1, wheeled:2, tracked:3, boat:4, ship:5, submersible:6, copter:7, plane:8, rocket:9, hover:10, amphibious:11, climber:12, railed:13 };

const agentTypeID = {
	settler:0, worker:1, scout:2, warrior:3, spearman:4, archer:5, swordsman:6, horseman:7, chariot:8, catapult:9, galley:10,
	explorer:11, pikeman:12, musketman:13, longbowman:14, cavalry:15, knight:16, cannon:17, caravel:18, galleon:19, privateer:20, frigate:21,
	rifleman:22, paratrooper:23, infantry:24, marines:25, tank:26, artillery:27, fighter:28, bomber:29, helicopter:30, transport:31, carrier:32, ironclad:33, submarine:34, destroyer:35, battleship:11,
	mechInfantry:37, modernArmour:38, radarArtillery:39, cruiseMissile:40, tacticalNuke:41, icbm:42, jetFighter:43, stealthFighter:44, stealthBomber:45, nuclearSub:46, aegisCruiser:47,
	mech:48, titan:49, hovercraft:50, harvester:51, acu:52
};

const agentTypes = [
	// ancient era
	{name:"settler", locomotion:locomotionID.walker, maxHealth:10, size:100, speed:20000, cost:30},
	{name:"worker", locomotion:locomotionID.walker, maxHealth:10, size:100, speed:20000, cost:10},
	{name:"scout", locomotion:locomotionID.walker,  maxHealth:10, size:100, speed:40000, cost:10},
	{name:"warrior", locomotion:locomotionID.walker, maxHealth:100, size:100, speed:20000, cost:10, damage:10, range:100, cooldown:5},
	{name:"spearman", locomotion:locomotionID.walker, maxHealth:200, size:100, speed:20000, cost:20, damage:10, range:100, cooldown:5},
	{name:"archer", locomotion:locomotionID.walker, maxHealth:100, size:100, speed:20000, cost:20, damage:20, range:200, cooldown:5},
	{name:"swordsman", locomotion:locomotionID.walker, maxHealth:200, size:100, speed:20000, cost:30, damage:30, range:100, cooldown:5},
	{name:"horseman", locomotion:locomotionID.walker, maxHealth:100, size:100, speed:40000, cost:30, damage:20, range:100, cooldown:5},
	{name:"chariot", locomotion:locomotionID.wheeled, maxHealth:100, size:100, speed:40000, cost:20,
	damage:10, range:100, cooldown:5},
	{name:"catapult", locomotion:locomotionID.wheeled, maxHealth:10, size:100, speed:10000, cost:20,
	damage:40, range:300, cooldown:20},
	{name:"galley", locomotion:locomotionID.boat,
	maxHealth:100, size:100, speed:60000, cost:30,
	damage:10, range:200, cooldown:5},

	{name:"battleship", locomotion:locomotionID.ship, maxHealth:100, size:100, speed:20000, damage:30, range:40000, cooldown:10, radar:100000}
];
