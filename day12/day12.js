const readline = require('readline');
const fs = require('fs');

/*
--- Day 12: Rain Risk ---
Your ferry made decent progress toward the island, but the storm came in faster than anyone expected. The ferry needs to take evasive actions!

Unfortunately, the ship's navigation computer seems to be malfunctioning; rather than giving a route directly to safety, it produced extremely
circuitous instructions. When the captain uses the PA system to ask if anyone can help, you quickly volunteer.

The navigation instructions (your puzzle input) consists of a sequence of single-character actions paired with integer input values.
After staring at them for a few minutes, you work out what they probably mean:

Action N means to move north by the given value.
Action S means to move south by the given value.
Action E means to move east by the given value.
Action W means to move west by the given value.
Action L means to turn left the given number of degrees.
Action R means to turn right the given number of degrees.
Action F means to move forward by the given value in the direction the ship is currently facing.

The ship starts by facing east. Only the L and R actions change the direction the ship is facing.
(That is, if the ship is facing east and the next instruction is N10, the ship would move north 10 units, but would still move east if the following action were F.)

For example:

F10
N3
F7
R90
F11

These instructions would be handled as follows:

F10 would move the ship 10 units east (because the ship starts by facing east) to east 10, north 0.
N3 would move the ship 3 units north to east 10, north 3.
F7 would move the ship another 7 units east (because the ship is still facing east) to east 17, north 3.
R90 would cause the ship to turn right by 90 degrees and face south; it remains at east 17, north 3.
F11 would move the ship 11 units south to east 17, south 8.

At the end of these instructions, the ship's Manhattan distance (sum of the absolute values of its east/west position and its north/south position)
from its starting position is 17 + 8 = 25.

Figure out where the navigation instructions lead. What is the Manhattan distance between that location and the ship's starting position?
*/

function solve_puzzle_part1(actions) {
    let end_state = actions.reduce(
        (state, action) => doMove(action, state),
        {east: 0, north: 0, facing: 'E'}
    );

    return Math.abs(end_state.east) + Math.abs(end_state.north);
}

const go_north = n => state => ({...state, north: state.north + n});
const go_east = n => state => ({...state, east: state.east + n});
const go_south = n => go_north(-n);
const go_west = n => go_east(-n);

const forwards = {
    'E': go_east,
    'W': go_west,
    'N': go_north,
    'S': go_south,
}

function go_forward(state, action) {
    return forwards[state.facing](action.number)(state)
}

const to_right_steps = ['E', 'S', 'W', 'N'];
const turn_right = n => state => ({...state, facing: to_right_steps[(4 + to_right_steps.indexOf(state.facing) + n/90) % 4]});
const turn_left = n => turn_right(-n);

function doMove(action, state){
    switch(action.action) {
        case 'N': return go_north(action.number)(state);
        case 'S': return go_south(action.number)(state);
        case 'E': return go_east(action.number)(state);
        case 'W': return go_west(action.number)(state);

        case 'R': return turn_right(action.number)(state);
        case 'L': return turn_left(action.number)(state);
        
        case 'F': return go_forward(state, action);
        
        default: throw "unknown action " + action.action;
    }
}

/*
--- Part Two ---
Before you can give the destination to the captain, you realize that the actual action meanings were printed on the back of the instructions the whole time.

Almost all of the actions indicate how to move a waypoint which is relative to the ship's position:

Action N means to move the waypoint north by the given value.
Action S means to move the waypoint south by the given value.
Action E means to move the waypoint east by the given value.
Action W means to move the waypoint west by the given value.
Action L means to rotate the waypoint around the ship left (counter-clockwise) the given number of degrees.
Action R means to rotate the waypoint around the ship right (clockwise) the given number of degrees.
Action F means to move forward to the waypoint a number of times equal to the given value.

The waypoint starts 10 units east and 1 unit north relative to the ship.
The waypoint is relative to the ship; that is, if the ship moves, the waypoint moves with it.

For example, using the same instructions as above:

- F10 moves the ship to the waypoint 10 times (a total of 100 units east and 10 units north), leaving the ship at east 100, north 10.
  The waypoint stays 10 units east and 1 unit north of the ship.

- N3 moves the waypoint 3 units north to 10 units east and 4 units north of the ship. The ship remains at east 100, north 10.

- F7 moves the ship to the waypoint 7 times (a total of 70 units east and 28 units north), leaving the ship at east 170, north 38.
  The waypoint stays 10 units east and 4 units north of the ship.

- R90 rotates the waypoint around the ship clockwise 90 degrees, moving it to 4 units east and 10 units south of the ship.
  The ship remains at east 170, north 38.

- F11 moves the ship to the waypoint 11 times (a total of 44 units east and 110 units south), leaving the ship at east 214, south 72.
  The waypoint stays 4 units east and 10 units south of the ship.

After these operations, the ship's Manhattan distance from its starting position is 214 + 72 = 286.

Figure out where the navigation instructions actually lead. What is the Manhattan distance between that location and the ship's starting position?
*/

const times = n => f => arg => {
    if (n == 1) return f(arg);
    return times(n-1)(f)(f(arg));
};

const move_wp_north = n => state => ({...state, wp: go_north(n)(state.wp)});
const move_wp_east = n => state => ({...state, wp: go_east(n)(state.wp)});
const move_wp_south = n => move_wp_north(-n);
const move_wp_west = n => move_wp_east(-n);

const rotate_clockwise = wp => ({ north: -wp.east, east: wp.north});
const rotate_counter_clockwise = wp => ({ north: wp.east, east: -wp.north});
const rotate_wp = direction => n => state => ({...state, wp: times(n/90)(direction)(state.wp)});
const rotate_wp_clockwise = rotate_wp(rotate_clockwise);
const rotate_wp_counter_clockwise = rotate_wp(rotate_counter_clockwise);

const move_ship_forward = n => state => ({...state, ship: go_north(n * state.wp.north)(go_east(n * state.wp.east)(state.ship))});

function doMove_part2(action, state){
    switch(action.action) {
        case 'N': return move_wp_north(action.number)(state);
        case 'S': return move_wp_south(action.number)(state);
        case 'E': return move_wp_east(action.number)(state);
        case 'W': return move_wp_west(action.number)(state);

        case 'R': return rotate_wp_clockwise(action.number)(state);
        case 'L': return rotate_wp_counter_clockwise(action.number)(state);
        
        case 'F': return move_ship_forward(action.number)(state);
        
        default: throw "unknown action " + action.action;
    }
}

function solve_puzzle_part2(actions) {
    let end_state = actions.reduce(
        (state, action) => doMove_part2(action, state),
        {
            ship: {east: 0, north: 0},
            wp: {east: 10, north: 1}
        }
    );

    return Math.abs(end_state.ship.east) + Math.abs(end_state.ship.north);
}

/*
Now that we have all we need to solve the puzzle, let's read the input
*/
const input_file = process.argv.slice(2)[0];
const ri = readline.createInterface({
    input: fs.createReadStream(input_file)
});

function parseLine(line) {
    return {
        action: line.substring(0, 1),
        number: parseInt(line.substring(1), 10)
    }
}

let input = [];
ri.on('line', line => input.push(parseLine(line)));
ri.on('close', function () {
    console.log("result part1:", solve_puzzle_part1(input));
    console.log("result part2:", solve_puzzle_part2(input));
});