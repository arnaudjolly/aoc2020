const readline = require('readline');
const fs = require('fs');

/*
--- Day 11: Seating System ---
Your plane lands with plenty of time to spare. The final leg of your journey is a ferry that goes directly to the tropical island where you can finally start your vacation. As you reach the waiting area to board the ferry, you realize you're so early, nobody else has even arrived yet!

By modeling the process people use to choose (or abandon) their seat in the waiting area, you're pretty sure you can predict the best place to sit. You make a quick map of the seat layout (your puzzle input).

The seat layout fits neatly on a grid. Each position is either floor (.), an empty seat (L), or an occupied seat (#). For example, the initial seat layout might look like this:

L.LL.LL.LL
LLLLLLL.LL
L.L.L..L..
LLLL.LL.LL
L.LL.LL.LL
L.LLLLL.LL
..L.L.....
LLLLLLLLLL
L.LLLLLL.L
L.LLLLL.LL
Now, you just need to model the people who will be arriving shortly. Fortunately, people are entirely predictable and always follow a simple set of rules. All decisions are based on the number of occupied seats adjacent to a given seat (one of the eight positions immediately up, down, left, right, or diagonal from the seat). The following rules are applied to every seat simultaneously:

If a seat is empty (L) and there are no occupied seats adjacent to it, the seat becomes occupied.
If a seat is occupied (#) and four or more seats adjacent to it are also occupied, the seat becomes empty.
Otherwise, the seat's state does not change.
Floor (.) never changes; seats don't move, and nobody sits on the floor.

After one round of these rules, every seat in the example layout becomes occupied:

#.##.##.##
#######.##
#.#.#..#..
####.##.##
#.##.##.##
#.#####.##
..#.#.....
##########
#.######.#
#.#####.##
After a second round, the seats with four or more occupied adjacent seats become empty again:

#.LL.L#.##
#LLLLLL.L#
L.L.L..L..
#LLL.LL.L#
#.LL.LL.LL
#.LLLL#.##
..L.L.....
#LLLLLLLL#
#.LLLLLL.L
#.#LLLL.##
This process continues for three more rounds:

#.##.L#.##
#L###LL.L#
L.#.#..#..
#L##.##.L#
#.##.LL.LL
#.###L#.##
..#.#.....
#L######L#
#.LL###L.L
#.#L###.##

#.#L.L#.##
#LLL#LL.L#
L.L.L..#..
#LLL.##.L#
#.LL.LL.LL
#.LL#L#.##
..L.L.....
#L#LLLL#L#
#.LLLLLL.L
#.#L#L#.##

#.#L.L#.##
#LLL#LL.L#
L.#.L..#..
#L##.##.L#
#.#L.LL.LL
#.#L#L#.##
..L.L.....
#L#L##L#L#
#.LLLLLL.L
#.#L#L#.##
At this point, something interesting happens: the chaos stabilizes and further applications of these rules cause no seats to change state! Once people stop moving around, you count 37 occupied seats.

Simulate your seating area by applying the seating rules repeatedly until no seats change state. How many seats end up occupied?
*/

function solve_puzzle(state, rules, print_steps) {
    const cache = new Set();
    do {
        if (print_steps) print_state(state);
        cache.add(doStringify(state));
        state = advance(state, rules);
    } while (!cache.has(doStringify(state)));

    return doStringify(state).split('')
        .filter(c => c == '#')
        .length;
}

function doStringify(state) {
    return state.flat().join('');
}

function advance(state, rules) {
    const height = state.length;

    const new_state = [];
    for (let j = 0; j < height; ++j) {
        const new_row = [];
        const length = state[j].length;
        for (let i = 0; i < length; ++i) {
            let actual_location = state[j][i];

            switch (actual_location) {
                case '.':
                    new_row.push('.');
                    break;
                case 'L':
                case '#':
                    let count = 0;
                    if (rules.is_north_west_occupied(i, j, state)) ++count;
                    if (rules.is_north_occupied(i, j, state)) ++count;
                    if (rules.is_north_east_occupied(i, j, state)) ++count;

                    if (rules.is_west_occupied(i, j, state)) ++count;
                    if (rules.is_east_occupied(i, j, state)) ++count;

                    if (rules.is_south_west_occupied(i, j, state)) ++count;
                    if (rules.is_south_occupied(i, j, state)) ++count;
                    if (rules.is_south_east_occupied(i, j, state)) ++count;

                    if (actual_location == 'L' && count == 0) new_row.push('#');
                    else if (actual_location == '#' && count >= rules.nb_seat) new_row.push('L');
                    else new_row.push(actual_location);
                    break;
            }
        }
        new_state.push(new_row);
    }
    return new_state;
}

const rules_part1 = {
    nb_seat: 4,
    is_north_west_occupied : (i, j, state) => j - 1 >= 0 && i - 1 >= 0 && state[j - 1][i - 1] == '#',
    is_north_occupied : (i, j, state) => j - 1 >= 0 && state[j - 1][i] == '#',
    is_north_east_occupied : (i, j, state) => j - 1 >= 0 && i + 1 < state[j].length && state[j - 1][i + 1] == '#',
    
    is_west_occupied : (i, j, state) => i - 1 >= 0 && state[j][i - 1] == '#',
    is_east_occupied : (i, j, state) => i + 1 < state[j].length && state[j][i + 1] == '#',

    is_south_west_occupied : (i, j, state) => j + 1 < state.length && i - 1 >= 0 && state[j + 1][i - 1] == '#',
    is_south_occupied : (i, j, state) => j + 1 < state.length && state[j + 1][i] == '#',
    is_south_east_occupied : (i, j, state) => j + 1 < state.length && i + 1 < state[j].length && state[j + 1][i + 1] == '#'
};


function print_state(state) {
    console.log("");
    console.log(state.map(row => row.join('')).join('\n'));
}

/*
--- Part Two ---
As soon as people start to arrive, you realize your mistake. People don't just care about adjacent seats -
they care about the first seat they can see in each of those eight directions!

Now, instead of considering just the eight immediately adjacent seats, consider the first seat in each of those eight directions.
For example, the empty seat below would see eight occupied seats:

.......#.
...#.....
.#.......
.........
..#L....#
....#....
.........
#........
...#.....

The leftmost empty seat below would only see one empty seat, but cannot see any of the occupied ones:

.............
.L.L.#.#.#.#.
.............
The empty seat below would see no occupied seats:

.##.##.
#.#.#.#
##...##
...L...
##...##
#.#.#.#
.##.##.

Also, people seem to be more tolerant than you expected:
- it now takes five or more visible occupied seats for an occupied seat to become empty (rather than four or more from the previous rules).
The other rules still apply:
- empty seats that see no occupied seats become occupied,
- seats matching no rule don't change, and floor never changes.

Given the same starting layout as above, these new rules cause the seating area to shift around as follows:

L.LL.LL.LL
LLLLLLL.LL
L.L.L..L..
LLLL.LL.LL
L.LL.LL.LL
L.LLLLL.LL
..L.L.....
LLLLLLLLLL
L.LLLLLL.L
L.LLLLL.LL

#.##.##.##
#######.##
#.#.#..#..
####.##.##
#.##.##.##
#.#####.##
..#.#.....
##########
#.######.#
#.#####.##

#.LL.LL.L#
#LLLLLL.LL
L.L.L..L..
LLLL.LL.LL
L.LL.LL.LL
L.LLLLL.LL
..L.L.....
LLLLLLLLL#
#.LLLLLL.L
#.LLLLL.L#

#.L#.##.L#
#L#####.LL
L.#.#..#..
##L#.##.##
#.##.#L.##
#.#####.#L
..#.#.....
LLL####LL#
#.L#####.L
#.L####.L#

#.L#.L#.L#
#LLLLLL.LL
L.L.L..#..
##LL.LL.L#
L.LL.LL.L#
#.LLLLL.LL
..L.L.....
LLLLLLLLL#
#.LLLLL#.L
#.L#LL#.L#

#.L#.L#.L#
#LLLLLL.LL
L.L.L..#..
##L#.#L.L#
L.L#.#L.L#
#.L####.LL
..#.#.....
LLL###LLL#
#.LLLLL#.L
#.L#LL#.L#

#.L#.L#.L#
#LLLLLL.LL
L.L.L..#..
##L#.#L.L#
L.L#.LL.L#
#.LLLL#.LL
..#.L.....
LLL###LLL#
#.LLLLL#.L
#.L#LL#.L#

Again, at this point, people stop shifting around and the seating area reaches equilibrium. Once this occurs, you count 26 occupied seats.

Given the new visibility method and the rule change for occupied seats becoming empty, once equilibrium is reached, how many seats end up occupied?
*/

const rules_part2 = {
    nb_seat: 5,
    is_north_west_occupied : function(i, j, state) {
        while (j - 1 >= 0 && i - 1 >= 0 && state[j - 1][i - 1] == '.') {
            --i;
            --j;
        }
        return j - 1 >= 0 && i - 1 >= 0 && state[j - 1][i - 1] == '#';
    },
    is_north_occupied : function(i, j, state) {
        while (j - 1 >= 0 && state[j - 1][i] == '.') {
            --j;
        }
        return j - 1 >= 0 && state[j - 1][i] == '#';
    },
    is_north_east_occupied : function(i, j, state) {
        while (j - 1 >= 0 && i + 1 < state[j].length && state[j - 1][i + 1] == '.') {
            ++i;
            --j;
        }
        return j - 1 >= 0 && i + 1 < state[j].length && state[j - 1][i + 1] == '#'
    },
    
    is_west_occupied : function(i, j, state) {
        while (i - 1 >= 0 && state[j][i - 1] == '.') {
            --i;
        }
        return i - 1 >= 0 && state[j][i - 1] == '#';
    },
    is_east_occupied : function(i, j, state){
        while (i + 1 < state[j].length && state[j][i + 1] == '.') {
            ++i;
        }
        return i + 1 < state[j].length && state[j][i + 1] == '#'
    },

    is_south_west_occupied : function(i, j, state) {
        while(j + 1 < state.length && i - 1 >= 0 && state[j + 1][i - 1] == '.') {
            ++j;
            --i;
        }
        return j + 1 < state.length && i - 1 >= 0 && state[j + 1][i - 1] == '#';
    },
    is_south_occupied : function(i, j, state) {
        while(j + 1 < state.length && state[j + 1][i] == '.') {
            ++j;
        }
        return j + 1 < state.length && state[j + 1][i] == '#';
    },
    is_south_east_occupied : function(i, j, state) {
        while(j + 1 < state.length && i + 1 < state[j].length && state[j + 1][i + 1] == '.') {
            ++j;
            ++i;
        }
        return j + 1 < state.length && i + 1 < state[j].length && state[j + 1][i + 1] == '#';
    }
};

/*
Now that we have all we need to solve the puzzle, let's read the input
*/
const input_file = process.argv.slice(2)[0];
const ri = readline.createInterface({
    input: fs.createReadStream(input_file)
});

function parseLine(line) {
    return line.split('');
}

let input = [];
ri.on('line', line => input.push(parseLine(line)));
ri.on('close', function () {
    console.log("result part1:", solve_puzzle(input, rules_part1, false));
    console.log("result part2:", solve_puzzle(input, rules_part2, false));
});