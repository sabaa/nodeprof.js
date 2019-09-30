const Mocha = require('mocha'),
  fs = require('fs'),
  path = require('path');

let mocha = new Mocha({
  ui: 'bdd',
  exit: true,
  reporter: 'spec'
});

let testDir = path.join(__dirname, path.sep, 'test');

let walk = function(dir) {
  let results = [];
  let list = fs.readdirSync(dir);
  list.forEach(function(file) {
    file = path.join(dir, file);
    let stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else {
      results.push(file);
    }
  });
  return results;
};

walk(testDir).filter(function(file) {
  return file.substr(-3) === '.js';
}).forEach(function(file) {
  mocha.addFile(
    file
  );
});

mocha.run()
  .on('end', function () {
    process.exit();
  })
  .on('exit', function () {
    process.exit();
  });
