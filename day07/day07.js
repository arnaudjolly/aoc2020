const readline = require('readline');
const fs = require('fs');

/*
--- Day 7: Handy Haversacks ---
You land at the regional airport in time for your next flight. In fact, it looks like you'll even have time to grab some food:
all flights are currently delayed due to issues in luggage processing.

Due to recent aviation regulations, many rules (your puzzle input) are being enforced about bags and their contents;
bags must be color-coded and must contain specific quantities of other color-coded bags. Apparently, nobody responsible for
these regulations considered how long they would take to enforce!

For example, consider the following rules:

```
light red bags contain 1 bright white bag, 2 muted yellow bags.
dark orange bags contain 3 bright white bags, 4 muted yellow bags.
bright white bags contain 1 shiny gold bag.
muted yellow bags contain 2 shiny gold bags, 9 faded blue bags.
shiny gold bags contain 1 dark olive bag, 2 vibrant plum bags.
dark olive bags contain 3 faded blue bags, 4 dotted black bags.
vibrant plum bags contain 5 faded blue bags, 6 dotted black bags.
faded blue bags contain no other bags.
dotted black bags contain no other bags.
```

These rules specify the required contents for 9 bag types.
In this example, every faded blue bag is empty, every vibrant plum bag contains 11 bags (5 faded blue and 6 dotted black), and so on.

You have a shiny gold bag. If you wanted to carry it in at least one other bag, how many different bag colors would be valid for the outermost bag?
(In other words: how many colors can, eventually, contain at least one shiny gold bag?)

In the above rules, the following options would be available to you:
- A bright white bag, which can hold your shiny gold bag directly.
- A muted yellow bag, which can hold your shiny gold bag directly, plus some other bags.
- A dark orange bag, which can hold bright white and muted yellow bags, either of which could then hold your shiny gold bag.
- A light red bag, which can hold bright white and muted yellow bags, either of which could then hold your shiny gold bag.

So, in this example, the number of bag colors that can eventually contain at least one shiny gold bag is 4.

How many bag colors can eventually contain at least one shiny gold bag? (The list of rules is quite long; make sure you get all of it.)
*/

function solve_part1(bag_name) {
    const bl = get_ancestors(bag_name);
    return bl.size;
}

function get_ancestors(bag_name) {
    const ancestors = new Set();
    if (nodes.has(bag_name)) {
        for (const parent of nodes.get(bag_name).parents.values()) {
            ancestors.add(parent);
            for (const ancestor of get_ancestors(parent)) {
                ancestors.add(ancestor);
            }
        }
    }
    return ancestors;
}

/*
--- Part Two ---
It's getting pretty expensive to fly these days - not because of ticket prices, but because of the ridiculous number of bags you need to buy!

Consider again your shiny gold bag and the rules from the above example:

faded blue bags contain 0 other bags.
dotted black bags contain 0 other bags.
vibrant plum bags contain 11 other bags: 5 faded blue bags and 6 dotted black bags.
dark olive bags contain 7 other bags: 3 faded blue bags and 4 dotted black bags.

So, a single shiny gold bag must contain 1 dark olive bag (and the 7 bags within it) plus 2 vibrant plum bags (and the 11 bags within each of those):
1 + 1*7 + 2 + 2*11 = 32 bags!

Of course, the actual rules have a small chance of going several levels deeper than this example;
be sure to count all of the bags, even if the nesting becomes topologically impractical!

Here's another example:

shiny gold bags contain 2 dark red bags.
dark red bags contain 2 dark orange bags.
dark orange bags contain 2 dark yellow bags.
dark yellow bags contain 2 dark green bags.
dark green bags contain 2 dark blue bags.
dark blue bags contain 2 dark violet bags.
dark violet bags contain no other bags.
In this example, a single shiny gold bag must contain 126 other bags.

How many individual bags are required inside your single shiny gold bag?
*/

// use a cache to avoid multiple computation of the same exact computation
const cache = new Map();

function count_bags_for_bag(bag_name) {
    if (cache.has(bag_name))
        return cache.get(bag_name);

    const bag_content = rules.get(bag_name);
    const result = bag_content.map( c => c.quantity * count_bags_for_bag(c.bag))
                              .reduce((a,b) => a+b, 1);

    cache.set(bag_name, result);
    return result;
}

/*
Now that we have all we need to solve the puzzle, let's read the input
Usage: node day07.js <input_filename>
*/

const ri = readline.createInterface({
    input: fs.createReadStream(process.argv.slice(2)[0])
});

function parse_line(line) {
    const [bag_name, rest] = line.split(' bags contain ');
    const content_description = rest.split(', ');
    const content = content_description.filter(element => !element.startsWith('no other'))
                                       .map(element => {
                                            const [_, n, other_bag] = element.match(/(\d+) (.+) bag\.?/);
                                            return { quantity: n, bag: other_bag };
                                        });
    rules.set(bag_name, content);
}

function populate_nodes(){
    for (const [bag, content] of rules.entries()) {
        for (const c of content) {
            const node = nodes.get(c.bag) || {name: c.bag, parents: new Set()};
            nodes.set(c.bag, node);
            let parent = nodes.get(bag) || {name: bag, parents: new Set()};
            nodes.set(bag, parent);

            node.parents.add(bag);
        }
    }
}

const rules = new Map();
const nodes = new Map();

ri.on('line', parse_line);
ri.on('close', function () {
    // part 1
    populate_nodes();
    console.log("result part1:", solve_part1("shiny gold"));

    // part 2
    // -1 as we want the number of bags that are needed to contain ours
    console.log("result part2:", count_bags_for_bag("shiny gold") - 1);
});