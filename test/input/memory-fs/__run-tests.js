const Mocha = require('mocha'),
	fs = require('fs'),
	path = require('path');

// Instantiate a Mocha instance with options specified in original makefile of the app
let mocha = new Mocha({
	ui: 'bdd',
	exit: true,
	reporter: 'spec'
});

let testDir = path.join(__dirname, path.sep, 'test')

fs.readdirSync(testDir).filter(function (file) {
	return file.substr(-3) === '.js';
}).forEach(function (file) {
	mocha.addFile(
		path.join(testDir, file)
	);
});

mocha.run()
	.on('end', function () {
		process.exit();
	})
	.on('exit', function () {
		process.exit();
	});
