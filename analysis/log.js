// JALANGI DO NOT INSTRUMENT
const fs = require('fs');
const path = require('path');
const eol = require('os').EOL;
const mkdirp = require('mkdirp');

let Logger = function (outputPath) {
    this.outputPath = outputPath;
    // let initialStr = '[' + eol;
    mkdirp.sync(path.basename(outputPath));
    // fs.writeFileSync(this.outputPath, initialStr);
    // this.currentDataLength = initialStr.length;
};

Logger.prototype.write = function (callGraph) {
    fs.writeFileSync(this.outputPath, JSON.stringify(callGraph, null, 2), 'utf8');
};

module.exports = Logger;

