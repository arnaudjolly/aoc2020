const { once } = require('events');
const { createReadStream } = require('fs');
const { createInterface } = require('readline');


(async function fromFile(file_path) {
    const ri = createInterface({
        input: createReadStream(file_path)
    });
    
    function parseLine(line) {
        return {
            op: line.substring(0, 3),
            number: parseInt(line.substring(4), 10)
        };
    }

    let instructions = [];
    ri.on('line', line => instructions.push(parseLine(line)));
    
    await once(ri, 'close');
    return new BootCode(instructions);
})();

function BootCode(instructions){
    this.instructions = instructions;
}

BootCode.prototype.run = function() {
    let executed_instructions = new Set();
    let result = 0;
    let cursor = 0;

    while (cursor < this.instructions.length) {
        if (executed_instructions.has(cursor))
            return [false, result];

        executed_instructions.add(cursor);
        
        let operation = this.instructions[cursor];
        switch(operation.op) {
            case 'nop':
                cursor +=1;
                break;
            case 'acc':
                result += operation.number;
                cursor += 1;
                break;
            case 'jmp':
                cursor += operation.number;
                break;
            default:
                throw "unknown operation: " + operation.op;
        }
    }
    
    return [true, result];
};

exports.fromFile = fromFile;
exports.BootCode = BootCode;