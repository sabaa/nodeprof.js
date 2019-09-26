// JALANGI DO NOT INSTRUMENT
const expect = require('chai').expect;
const path = require('path');
const fs = require('fs');
const mkdirp = require('mkdirp');
let runner = require('../analysis/run');
let parseScg = require('./util/parse-scg');

describe('tests', function () {
    it('ExampleApplication', function () {
        prepareCommand('ExampleApplication', 'main.js');
    });

    // it('ExampleApplication2', function () {
    //     prepareCommand('ExampleApplication2', 'main.js');
    // });

    // it('acorn', function () {
    //     prepareCommand('acorn', path.join('test', 'run.js'));
    // })
});

function prepareCommand (projectName, mainFileName) {
    let mainFilePath = path.join(__dirname, 'input', projectName, mainFileName);
    let outputPath = path.join(__dirname, 'output-actual', 'dcg', projectName + '.json');

    runner.run(mainFilePath, outputPath);

    analyzeCallGraphs(projectName, outputPath);
}

function analyzeCallGraphs (projectName, jsonDynamicCallGraphPath) {
    let rawStaticCallGraphPath = path.join(__dirname, 'input', 'scg', projectName + '.txt');
    let jsonStaticCallGraphPath = path.join(__dirname, 'output-actual', 'scg', projectName + '.json');

    let staticCalls = parseScg(projectName, rawStaticCallGraphPath, jsonStaticCallGraphPath);
    let dynamicCalls = JSON.parse(fs.readFileSync(jsonDynamicCallGraphPath, 'utf8'));

    let diffs = compareCallGraphs(staticCalls, dynamicCalls);
    let diffPath = path.join(__dirname, 'output-actual', 'diff', projectName + '.json');
    mkdirp.sync(path.dirname(diffPath));
    fs.writeFileSync(diffPath, JSON.stringify(diffs, null, 2), 'utf8');
}

function compareCallGraphs (staticCalls, dynamicCalls) {
    let stringDynamicCalls = {}, stringStaticCalls = {};

    dynamicCalls.forEach(dynamicCall => {
        dynamicCall.caller.end = ''; // todo
        dynamicCall.callee.end = '';
        stringDynamicCalls[JSON.stringify(dynamicCall)] = -1;
    });

    staticCalls.forEach(staticCall => {
        staticCall.caller.end = ''; // todo
        staticCall.callee.end = '';
        stringStaticCalls[JSON.stringify(staticCall)] = -1;
    });

    let diffs = [];
    for (let dynamicCall in stringDynamicCalls) {
        if (typeof stringStaticCalls[dynamicCall] !== 'undefined') {
            // console.log(dynamicCall);
            stringDynamicCalls[dynamicCall] = 1;
        }
        else {
            diffs.push(JSON.parse(dynamicCall));
        }
    }
    return diffs;
}