// JALANGI DO NOT INSTRUMENT
const expect = require('chai').expect;
const path = require('path');
let runner = require('../analysis/run');

function prepareCommand (projectName, mainFileName) {
    let mainFilePath = path.join(__dirname, 'input', projectName, mainFileName);
    let outputPath = path.join(__dirname, 'output-actual', projectName + '.json');

    runner.run(mainFilePath, outputPath);
}

describe('tests', function () {
    // it('ExampleApplication', function () {
    //     prepareCommand('ExampleApplication', 'main.js');
    // });

    // it('ExampleApplication2', function () {
    //     prepareCommand('ExampleApplication2', 'main.js');
    // });

    it('acorn', function () {
        prepareCommand('acorn', path.join('test', 'run.js'));
    })
});