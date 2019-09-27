// JALANGI DO NOT INSTRUMENT
const { exec } = require('child_process');
const path = require('path');

let run = function (mainFile, outputPath, projectName, analyze) {
    let analysisPath = path.join(__dirname, 'intercept.js');

    let cmd = "mx jalangi --excl=\"node_modules\"" +
        " --initParam outputPath:" + outputPath +
        " --analysis " + analysisPath + ' ' + mainFile;
    console.log('<<cmd>>:  ' + cmd);

    let nodeprofProcess = exec(cmd);
    nodeprofProcess.on('exit', function() {
        analyze(projectName, outputPath);
    });
    nodeprofProcess.stdout.pipe(process.stdout);
    nodeprofProcess.stderr.pipe(process.stderr);
};

module.exports = {
    run: run
};