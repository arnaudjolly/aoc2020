const readline = require('readline');
const fs = require('fs');

function find(arr, goal) {
    for (var i = 0; i < arr.length - 2; ++i) {
        let first = arr[i];
        for (var j = i + 1; j < arr.length - 1; ++j) {
            let second = arr[j];
            for (var k = j + 1; k < arr.length; ++k) {
                let third = arr[k];
                if (first + second + third == goal) {
                    return first * second * third;
                }
            }
        }
    }
}

const ri = readline.createInterface({
    input: fs.createReadStream('input')
});

var input = [];
ri.on('line', line => input.push(parseInt(line, 10)));
ri.on('close', () => console.log("result =", find(input, 2020)));