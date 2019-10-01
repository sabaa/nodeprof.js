// JALANGI DO NOT INSTRUMENT
const expect = require('chai').expect;
const path = require('path');
const fs = require('fs');
const mkdirp = require('mkdirp');
let runner = require('../analysis/run');
let parseScg = require('./util/parse-scg');

describe('tests', function () {
    it('memory-fs', function () {
        prepareCommand('memory-fs', '__run-tests.js');
    });

    it('razorpay-node', function () {
        prepareCommand('razorpay-node', '__run-tests.js');
    });

    it('acorn', function () {
        prepareCommand('acorn', path.join('test', 'run.js'));
    });

    it('node-abi', function () {
        prepareCommand('node-abi', path.join('test', 'index.js'));
    });

    it('node-mkdirp', function () {
        prepareCommand('node-mkdirp', '__run-tests.js');
    });

    /*
    it('ExampleApplication', function () {
        prepareCommand('ExampleApplication', 'main.js');
    });
    */
});

function prepareCommand (projectName, mainFileName) {
    let mainFilePath = path.join(__dirname, 'input', projectName, mainFileName);
    let outputPath = path.join(__dirname, 'output-actual', 'dcg', projectName + '.json');

    runner.run(mainFilePath, outputPath, projectName, analyzeCallGraphs);
    // analyzeCallGraphs(projectName, outputPath);
    // analyzeCallGraphs(projectName, outputPath);
}

function analyzeCallGraphs (projectName, jsonDynamicCallGraphPath) {
    let rawStaticCallGraphPath = path.join(__dirname, 'input', 'scg', projectName + '.txt');
    let jsonStaticCallGraphPath = path.join(__dirname, 'output-actual', 'scg', projectName + '.json');

    let staticCalls = parseScg(projectName, rawStaticCallGraphPath, jsonStaticCallGraphPath);
    let dynamicCalls = JSON.parse(fs.readFileSync(jsonDynamicCallGraphPath, 'utf8'));
    let dynamicCallsPruned = pruneDynamicCG(dynamicCalls);

    let diffs = compareCallGraphs(staticCalls, dynamicCallsPruned);
    let diffPath = path.join(__dirname, 'output-actual', 'diff', projectName + '.json');
    mkdirp.sync(path.dirname(diffPath));
    fs.writeFileSync(diffPath, JSON.stringify(diffs, null, 2), 'utf8');
}

function pruneDynamicCG (dynamicCalls) {
    let prunedCalls = [];
    dynamicCalls.forEach(dCall => {
        if (!(dCall.caller.fileName === '__run-tests.js') && !(dCall.callee.fileName === '__run-tests.js')) {
            prunedCalls.push(dCall);
        }
    });
    return prunedCalls;
}

function compareCallGraphs (staticCalls, dynamicCalls) {
    let stringDynamicCalls = {}, stringStaticCalls = {};

    for (let i = 0; i < dynamicCalls.length; i ++) {
        let dynamicCall = dynamicCalls[i];
        let minimalDynamicCall = {
            caller: {
                fileName: dynamicCall.caller.fileName,
                start: dynamicCall.caller.start
            },
            callee: {
                fileName: dynamicCall.callee.fileName,
                start: dynamicCall.callee.start
            }
        };

        stringDynamicCalls[JSON.stringify(minimalDynamicCall)] = i;
    }

    staticCalls.forEach(staticCall => {
        let minimalStaticCall = {
            caller: {
                fileName: staticCall.caller.fileName,
                start: staticCall.caller.start
            },
            callee: {
                fileName: staticCall.callee.fileName,
                start: staticCall.callee.start
            }
        };

        stringStaticCalls[JSON.stringify(minimalStaticCall)] = 1;
    });

    let diffIndecies = [];
    for (let dynamicCall in stringDynamicCalls) {
        if (typeof stringStaticCalls[dynamicCall] !== 'undefined') {
            stringDynamicCalls[dynamicCall] = -1;
        }
        else {
            diffIndecies.push(diffIndecies[dynamicCalls]);
        }
    }

    let diffs = [];
    for (let i = 0; i < diffIndecies.length; i ++) {
        diffs.push(dynamicCalls[i]);
    }

    return diffs;
}