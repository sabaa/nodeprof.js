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

let displayedDiffs = [];

let diffTable = diffDoc.getElementById('diffTable');
diffTable.innerHTML = '';
for (let i = 0; i < 100/*diffs.length*/; i ++) {
    createDiffCell(i);

    console.log('>>>>> ' + i);
    let diffCode = getCodeByLocation(diffs[i]);

    // console.log(diffCode);
}

// fs.writeFileSync(diffVisPath, dom.serialize(), 'utf8');


function createDiffCell (i) {
    let newRow = diffDoc.createElement('tr');
    let newCell = diffDoc.createElement('td');
    newCell.innerHTML = 'diff' + i;
    newCell.id = i; //'diff' + i;
    newCell.className = 'cell';
    newRow.appendChild(newCell);
    diffTable.appendChild(newRow);
}

// let diffsForVis = 'let __diffs = ' + JSON.stringify(diffs) + ';';
// let diffsForVisPath = path.join(__dirname, 'vis', 'data', projectName + '.js');
// fs.writeFileSync(diffsForVisPath, diffsForVis, 'utf8');

/*
let diffsScript = diffDoc.createElement('script');
diffsScript.setAttribute('src', './data/acorn.js'); //path.join('.', 'data', projectName + '.js')); // todo
diffsScript.onLoad = "alert('hi');";
diffsScript.type = "text/javascript";
diffDoc.head.appendChild(diffsScript);
*/
fs.writeFileSync(diffVisPath, dom.serialize(), 'utf8');


function getCode (filePath, startLine, startCol, endLine, endCol) {
    let callerArray = fs.readFileSync(filePath, 'utf8').toString().split(eol);
    // let withinScopt = false;
    let code = '';

    let startLineItr = startLine;
    let startColItr = startCol;

    for (let i = startLineItr; i <= endLine; i ++) {
        let line = callerArray[i].split('');
        for (let j = startColItr; j < line.length; j ++) {
            if (i === endLine && j > endCol) {
                break;
            }
            code += line[j];
        }
    }

    console.log(code);
    return code;
}

function getCodeByLocation (diff) {
    let callerPath = diff.caller.fullPath;

    let callerStartLine = Number(diff.caller.start.line) - 1;
    let callerStartCol = Number(diff.caller.start.column) - 1;
    let callerEndLine = Number(diff.caller.end.line) - 1;
    let callerEndCol = Number(diff.caller.end.column) - 1;

    let callsiteCode = getCode(callerPath, callerStartLine, callerStartCol, callerEndLine, callerEndCol);
    diff.caller.code = callsiteCode;


    let calleePath = diff.callee.fullPath;

    let calleeStartLine = Number(diff.callee.start.line) - 1;
    let calleeStartCol = Number(diff.callee.start.column) - 1;
    let calleeEndLine = Number(diff.callee.end.line) - 1;
    let calleeEndCol = Number(diff.callee.end.column) - 1;

    let calleeCode = getCode(calleePath, calleeStartLine, calleeStartCol, calleeEndLine, calleeEndCol);
    diff.callee.code = calleeCode;

    /*
    let callerArray = fs.readFileSync(callerPath, 'utf8').toString().split(eol);
    // let withinScopt = false;
    let callsiteCode = '';

    let startLineItr = callerStartLine;
    let startColItr = callerStartCol;

    for (let i = startLineItr; i <= callerEndLine; i ++) {
        let line = callerArray[i].split('');
        for (let j = startColItr; j < line.length; j ++) {
            if (i === callerEndLine && j > callerEndCol) {
                break;
            }
            callsiteCode += line[j];
        }
    }
    *
    /*
    for (let i in callerArray) {
        if (i >= callerStartLine) {
            if (i <= callerEndLine) {
                // console.log('<< ' + callerStartLine + ' < ' + i + ' > ' + callerEndLine + ' >>');
                let line = callerArray[i];
                let splitLine = line.split('');
                for (let j = 0; j < splitLine.length; j ++) {
                    if (i === callerStartLine && j >= callerStartCol
                        || i === callerEndLine && j <= callerEndCol
                        || i > callerStartCol && i < callerEndLine) {

                        callsiteCode += splitLine[j];
                    }
                    // else {
                    //     break;
                    // }
                }
                // console.log(line);
                // console.log(typeof line);
                // for (let j = )
            }
            else {
                break;
            }
        }
    }
    */
    // if (callsiteCode.length > 1) {
    //     console.log(callsiteCode);
    //     console.log('\n');
    // }
    // console.log(callsiteCode);


}

// console.log(diffs.length);


let diffsForVis = 'let __diffs = ' + JSON.stringify(diffs) + ';';
let diffsForVisPath = path.join(__dirname, 'vis', 'data', projectName + '.js');
fs.writeFileSync(diffsForVisPath, diffsForVis, 'utf8');