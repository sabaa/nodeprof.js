const fs = require('fs');
const path = require('path');
const JSDOM = require('jsdom').JSDOM;

let diffVisPath = path.join(__dirname, 'vis', 'cg-diff.html');
const diffsTemplate = fs.readFileSync(diffVisPath, 'utf8');
const dom = new JSDOM(diffsTemplate);
const diffDoc = dom.window.document;


// todo
let projectName = 'acorn';
// todo
let diffFilePath = path.join(__dirname, '..', 'test', 'output-actual', 'diff', projectName + '.json');

let diffs = fs.readFileSync(diffFilePath, 'utf8');

let diffTable = diffDoc.getElementById('diffTable');
diffTable.innerHTML = '';
for (let i = 0; i < 100/*diffs.length*/; i ++) {
    let newRow = diffDoc.createElement('tr');
    let newCell = diffDoc.createElement('td');
    newCell.innerHTML = 'diff' + i;
    newCell.id = 'diff' + i;
    newCell.className = 'cell';
    newRow.appendChild(newCell);
    diffTable.appendChild(newRow);
}

fs.writeFileSync(diffVisPath, dom.serialize(), 'utf8');




// console.log(diffs.length);