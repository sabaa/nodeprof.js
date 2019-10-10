const fs = require('fs');
const path = require('path');
const JSDOM = require('jsdom').JSDOM;
const eol = require('os').EOL;

let diffVisPath = path.join(__dirname, 'vis', 'cg-diff.html');
const diffsTemplate = fs.readFileSync(diffVisPath, 'utf8');
const dom = new JSDOM(diffsTemplate);
const diffDoc = dom.window.document;

// todo
let projectName = 'acorn';
// todo
let diffFilePath = path.join(__dirname, '..', 'test', 'output-actual', 'diff', projectName + '.json');

let diffs = JSON.parse(fs.readFileSync(diffFilePath, 'utf8'));
let diffFiles = {};

let diffTable = diffDoc.getElementById('diffTable');
// diffTable.innerHTML = '';
let diffTableBody = diffTable.getElementsByTagName('tbody')[0];
diffTableBody.innerHTML = '';

for (let i = 0; i < diffs.length; i ++) {
    createDiffCell(i);
    getCodeByLocation(diffs[i]);
}

function createDiffCell (i) {
    let newRow = diffDoc.createElement('tr');
    let newCell = diffDoc.createElement('td');
    newCell.innerHTML = 'diff' + i;
    newCell.id = i; //'diff' + i;
    newCell.className = 'cell';
    newRow.appendChild(newCell);
    // diffTable.appendChild(newRow);
    diffTableBody.appendChild(newRow);
}

fs.writeFileSync(diffVisPath, dom.serialize(), 'utf8');

function getCode (filePath, startLine, startCol, endLine, endCol) {
    let fileContent = fs.readFileSync(filePath, 'utf8').toString();
    let callerArray = fileContent.split(eol);

    if (typeof diffFiles[filePath] === 'undefined') {
        diffFiles[filePath] = fileContent;
    }

    let code = '';

    let startLineItr = startLine;
    let startColItr = startCol;

    let subStrStartIndex = -1, subStrEndIndex = -1;
    let indexCounter = 0;

    let highlightedLines = [];

    for (let i = startLineItr; i <= endLine; i ++) {
        console.log('** highlighted: ' + i);
        highlightedLines.push(i);


        let line = callerArray[i].split('');
        for (let j = startColItr; j < line.length; j ++) {
            if (i === startLine && j === startCol) {
                subStrStartIndex = indexCounter;
                console.log('start: ' + subStrStartIndex);
            }
            if (i === endLine && j === endCol) {
                subStrEndIndex = indexCounter;
                console.log('end: ' + subStrEndIndex);
            }

            if (i === endLine && j > endCol) {
                break;
            }
            code += line[j];

            indexCounter ++;
        }
        startColItr = 0;
        code += eol;
        indexCounter ++;
    }

    return {
        code: code,
        startIndex: subStrEndIndex,
        endIndex: subStrEndIndex,
        highlightLines: highlightedLines
    };
}

function getCodeByLocation (diff) {
    if (typeof diff === 'undefined') {
        console.log(diff);
    }

    let callerPath = diff.caller.fullPath;

    let callerStartLine = Number(diff.caller.start.line) - 1;
    let callerStartCol = Number(diff.caller.start.column) - 1;
    let callerEndLine = Number(diff.caller.end.line) - 1;
    let callerEndCol = Number(diff.caller.end.column) - 1;

    let callsiteCode = getCode(callerPath, callerStartLine, callerStartCol, callerEndLine, callerEndCol);
    diff.caller.code = callsiteCode.code;
    diff.caller.startIndex = callsiteCode.startIndex;
    diff.caller.endIndex = callsiteCode.endIndex;
    diff.caller.highlightLines = callsiteCode.highlightLines;

    let calleePath = diff.callee.fullPath;

    let calleeStartLine = Number(diff.callee.start.line) - 1;
    let calleeStartCol = Number(diff.callee.start.column) - 1;
    let calleeEndLine = Number(diff.callee.end.line) - 1;
    let calleeEndCol = Number(diff.callee.end.column) - 1;

    let calleeCode = getCode(calleePath, calleeStartLine, calleeStartCol, calleeEndLine, calleeEndCol);
    diff.callee.code = calleeCode.code;
    diff.callee.startIndex = calleeCode.startIndex;
    diff.callee.endIndex = calleeCode.endIndex;
    diff.callee.highlightLines = calleeCode.highlightLines;
}

let diffsForVis = 'let __diffs = ' + JSON.stringify(diffs) + ';';
diffsForVis += eol;
diffsForVis = diffsForVis + 'let __files = ' + JSON.stringify(diffFiles);
let diffsForVisPath = path.join(__dirname, 'vis', 'data', projectName + '.js');
fs.writeFileSync(diffsForVisPath, diffsForVis, 'utf8');