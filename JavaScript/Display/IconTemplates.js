/*
Pixel templates for agent icons.
0 - transparent
1 - primary colour
3 - border colour
*/
const pixelTypeID = {transparent:0, primary:1, primaryDarker:2, border:3};
const shapeID = {static:0, walker:1, mounted:2, wheeled:3, ship:4, city:5};
const symbolID = {melee:0, ranged:1, indirect:2, worker:3, sensor:4, transport:5, none:6}

const iconShape = [[
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,3,3,3,3,3,3,3,3,3,3,3,0,0],
	[0,0,3,1,1,1,1,1,1,1,1,1,3,0,0],
	[0,0,3,1,1,1,1,1,1,1,1,1,3,0,0],
	[0,0,3,1,1,1,1,1,1,1,1,1,3,0,0],
	[0,0,3,1,1,1,1,1,1,1,1,1,3,0,0],
	[0,0,3,1,1,1,1,1,1,1,1,1,3,0,0],
	[0,0,3,1,1,1,1,1,1,1,1,1,3,0,0],
	[0,0,3,1,1,1,1,1,1,1,1,1,3,0,0],
	[0,0,3,1,1,1,1,1,1,1,1,1,3,0,0],
	[0,0,3,1,1,1,1,1,1,1,1,1,3,0,0],
	[0,0,3,3,3,3,3,3,3,3,3,3,3,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]
],[
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,3,3,3,3,3,3,3,3,3,3,3,0,0],
	[0,0,3,1,1,1,1,1,1,1,1,1,3,0,0],
	[0,0,3,1,1,1,1,1,1,1,1,1,3,0,0],
	[0,0,0,3,1,1,1,1,1,1,1,3,0,0,0],
	[0,0,0,3,1,1,1,1,1,1,1,3,0,0,0],
	[0,0,0,3,1,1,1,1,1,1,1,3,0,0,0],
	[0,0,0,3,1,1,1,1,1,1,1,3,0,0,0],
	[0,0,0,0,3,1,1,1,1,1,3,0,0,0,0],
	[0,0,0,0,3,1,1,1,1,1,3,0,0,0,0],
	[0,0,0,0,3,1,1,1,1,1,3,0,0,0,0],
	[0,0,0,0,3,3,3,3,3,3,3,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]
],[
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,3,3,3,3,3,3,3,0,0,0,0],
	[0,0,0,3,1,1,1,1,1,1,1,3,0,0,0],
	[0,0,3,1,1,1,1,1,1,1,1,1,3,0,0],
	[0,3,1,1,1,1,1,1,1,1,1,1,1,3,0],
	[3,1,1,1,1,1,1,1,1,1,1,1,1,1,3],
	[0,3,1,1,1,1,1,1,1,1,1,1,1,3,0],
	[0,0,3,1,1,1,1,1,1,1,1,1,3,0,0],
	[0,0,0,3,1,1,1,1,1,1,1,3,0,0,0],
	[0,0,0,0,3,3,3,3,3,3,3,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]
],[
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,3,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,3,1,3,0,0,0,0,0,0],
	[0,0,0,0,0,3,1,1,1,3,0,0,0,0,0],
	[0,0,0,0,3,1,1,1,1,1,3,0,0,0,0],
	[0,0,0,3,1,1,1,1,1,1,1,3,0,0,0],
	[0,0,3,1,1,1,1,1,1,1,1,1,3,0,0],
	[0,3,1,1,1,1,1,1,1,1,1,1,1,3,0],
	[0,0,3,1,1,1,1,1,1,1,1,1,3,0,0],
	[0,0,0,3,1,1,1,1,1,1,1,3,0,0,0],
	[0,0,0,0,3,1,1,1,1,1,3,0,0,0,0],
	[0,0,0,0,0,3,1,1,1,3,0,0,0,0,0],
	[0,0,0,0,0,0,3,1,3,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,3,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]
],[
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,3,3,3,0,0,0,0,0,0],
	[0,0,0,0,3,3,1,1,1,3,3,0,0,0,0],
	[0,0,0,3,1,1,1,1,1,1,1,3,0,0,0],
	[0,0,3,1,1,1,1,1,1,1,1,1,3,0,0],
	[0,0,3,1,1,1,1,1,1,1,1,1,3,0,0],
	[0,3,1,1,1,1,1,1,1,1,1,1,1,3,0],
	[0,3,1,1,1,1,1,1,1,1,1,1,1,3,0],
	[0,3,1,1,1,1,1,1,1,1,1,1,1,3,0],
	[0,3,1,1,1,1,1,1,1,1,1,1,1,3,0],
	[0,3,3,3,3,3,3,3,3,3,3,3,3,3,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]
],[
	[3,3,3,3,3,3,3,3,3,3,3,3,3,3,3],
	[3,1,1,1,1,1,1,2,1,1,1,1,1,1,3],
	[3,1,1,1,2,1,1,2,1,1,1,1,1,1,3],
	[3,1,1,2,2,2,2,2,2,2,2,1,1,1,3],
	[3,1,1,1,1,1,1,2,1,1,1,1,1,1,3],
	[3,1,2,2,2,2,2,2,2,2,2,2,1,1,3],
	[3,1,1,2,1,1,1,2,1,1,2,1,1,1,3],
	[3,2,2,2,2,2,2,2,2,2,2,2,2,2,3],
	[3,1,1,2,1,1,1,2,1,1,2,1,1,1,3],
	[3,1,1,2,1,1,1,2,1,1,2,1,1,1,3],
	[3,1,2,2,2,2,2,2,2,2,2,2,1,1,3],
	[3,1,1,2,1,1,1,2,1,1,1,1,1,1,3],
	[3,1,1,1,1,1,1,2,1,1,1,1,1,1,3],
	[3,1,1,1,1,1,1,2,1,1,1,1,1,1,3],
	[3,3,3,3,3,3,3,3,3,3,3,3,3,3,3]
]];

const iconSymbol = [[
	[1,0,0,0,1],
	[0,1,0,1,0],
	[0,0,1,0,0],
	[0,1,0,1,0],
	[1,0,0,0,1]
],[
	[0,0,1,0,0],
	[0,0,1,0,0],
	[1,1,0,1,1],
	[0,0,1,0,0],
	[0,0,1,0,0]
],[
	[0,0,0,0,0],
	[0,0,1,0,0],
	[0,1,1,1,0],
	[0,0,1,0,0],
	[0,0,0,0,0]
],[
	[1,0,1,0,1],
	[1,0,1,0,1],
	[1,0,1,0,1],
	[1,1,1,1,1],
	[0,0,0,0,0]
],[
	[1,1,1,1,1],
	[0,0,0,0,0],
	[0,1,1,1,0],
	[0,0,0,0,0],
	[0,0,1,0,0]
],[
	[1,1,1,1,1],
	[1,0,0,0,1],
	[1,0,0,0,1],
	[0,0,1,0,0],
	[0,0,1,0,0]
]];
