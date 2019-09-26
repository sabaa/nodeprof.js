const path = require('path');
const fs = require('fs');
const eol = require('os').EOL;
const mkdirp = require('mkdirp');

function readStaticCG (projectName, staticCGFile, scgJsonPath) {
    let allCalls = [];
    // let scgJsonPath = path.join(__dirname, path.sep, 'output-actual', path.sep, projectName, path.sep, 'scg.json');
    // let staticCGFile = path.join(__dirname, path.sep, 'input', path.sep, projectName, path.sep, 'callgraph-static.txt');
    let staticCG = fs.readFileSync(staticCGFile, 'utf8');

    let lines = staticCG.split(eol);
    for (let i = 0; i < lines.length; i ++) {
        if (lines[i].length > 1) {
            let callRelation = splitLine(lines[i]);
            allCalls.push(callRelation);
        }
    }

    writeCallsToFile(allCalls, scgJsonPath);

    return allCalls;
}

function writeCallsToFile (allCalls, scgJsonPath) {
    mkdirp.sync(path.dirname(scgJsonPath));
    fs.writeFileSync(scgJsonPath, JSON.stringify(allCalls, null, 2), 'utf8');
}

function splitLine (cgLine) {
    let tokens = cgLine.split(/"/);
    let source = tokens[1];
    let target = tokens[3];

    let sourceLoc = getSourceInfo(source);
    let targetLoc = getTargetInfo(target);

    return {
        caller/*source*/: sourceLoc,
        callee/*target*/: targetLoc
    };
}

function getSourceInfo (src) {
    let source = src.split(/Callee\(/)[1];
    let sourceDetails = source.split(/:|<|>|\)/);
    let startLoc = sourceDetails[2].split(',');
    let endLoc = sourceDetails[4].split(',');

    return {
        fileName: sourceDetails[0],
        start: {
            line: startLoc[0],
            column: startLoc[1]
        },
        end: {
            line: endLoc[0],
            column: endLoc[1]
        }
    };
}

function getTargetInfo (trgt) {
    let target = trgt.split(/Fun\(/)[1];
    let targetDetails = target.split(/:|<|>|\)/);
    let startLoc = targetDetails[2].split(',');
    let endLoc = targetDetails[4].split(',');

    return {
        fileName: targetDetails[0],
        start: {
            line: startLoc[0],
            column: startLoc[1]
        },
        end: {
            line: endLoc[0],
            column: endLoc[1]
        }
    };
}

module.exports = function (projectName, staticCGFile, scgJsonPath) {
    return readStaticCG(projectName, staticCGFile, scgJsonPath);
};