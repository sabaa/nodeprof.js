// JALANGI DO NOT INSTRUMENT
const { exec } = require('child_process');
const path = require('path');

let run = function (mainFile, outputPath) {
    let analysisPath = path.join(__dirname, 'intercept.js');

    let cmd = "mx jalangi " +
        "--initParam outputPath:" + outputPath +
        " --analysis " + analysisPath + ' ' + mainFile;
    console.log('<<cmd>>:  ' + cmd);

    let nodeprofProcess = exec(cmd);
    nodeprofProcess.stdout.pipe(process.stdout);
    nodeprofProcess.stderr.pipe(process.stderr);
};

module.exports = {
    run: run
};