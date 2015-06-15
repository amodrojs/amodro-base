/*jshint node: true */
'use strict';
var fs = require('fs'),
    path = require('path'),
    loadRegExp = /\/\/INSERT ([\w\/\.-]+)/g,
    dir = path.join(__dirname, '..', 'parts'),
    mainFilePath = path.join(dir, 'main.js'),
    mainContents = fs.readFileSync(mainFilePath, 'utf8'),
    transformNoLog = require('./transform-nolog'),
    args = process.argv.slice(2);

var hasOwn = Object.prototype.hasOwnProperty;
function hasProp(obj, prop) {
    return hasOwn.call(obj, prop);
}

// Options passed to build command via CLI arguments, of the form name=value.
var options = {};
args.forEach(function(arg) {
  var pair = arg.split('=');
  if (pair.length === 2) {
    var value = pair[1];
    if (value === 'true') {
      value = true;
    } else if (value === 'false') {
      value = false;
    }
    options[pair[0]] = value;
  }
});


// Permutations of the builds
var permutations = {
  // The default one used for running node tests by default.
  'amodro-node': {
  },
  // The default one with debug logging.
  'amodro-node-debug': {
    keepLog: true
  },

  // The default one used for running node tests by default.
  'amodro-es-node': {
    'translate.js': [
      'translate/esm-pre.js',
      'translate/esprima.js',
      'translate/esm-amd.js',
      'translate/esm-post.js',
      'translate/esm-define.js'
    ]
  },

  // For browser with promise support, no requirejs compatibility, only script
  // tag and worker support.
  'amodro': {
    'support/prim.js': '',
    'support/prim-to-promise.js': '',
    'fetch.js': 'fetch/browser-script-worker.js',
    'requirejs-require-adapter.js': '',
    'requirejs-to-amodro.js': '',
    'suffix.js': ''
  },
  // Same as aboev, but with debug logs
  'amodro-debug': {
    keepLog: true,
    'support/prim.js': '',
    'support/prim-to-promise.js': '',
    'fetch.js': 'fetch/browser-script-worker.js',
    'requirejs-require-adapter.js': '',
    'requirejs-to-amodro.js': '',
    'suffix.js': '',
  },

  // For browser with promise support, no requirejs compatibility, only script
  // tag and worker support.
  'amodro-es': {
    'support/prim.js': '',
    'support/prim-to-promise.js': '',
    'fetch.js': 'fetch/browser-script-worker.js',
    'requirejs-require-adapter.js': '',
    'requirejs-to-amodro.js': '',
    'suffix.js': '',
    'translate.js': [
      'translate/esm-pre.js',
      'translate/esprima.js',
      'translate/esm-amd.js',
      'translate/esm-post.js',
      'translate/esm-define.js'
    ]
  },

  // Base amodro, with some requirejs api support, using native promises.
  'amodro-requirejs': {
    'support/prim.js': '',
    'support/prim-to-promise.js': '',
    'fetch.js': 'fetch/browser-script-worker.js',
    'suffix.js': 'suffix/requirejs-to-amodro.js'
  },
  // Same as aboev, but with debug logs
  'amodro-requirejs-debug': {
    keepLog: true,
    'support/prim.js': '',
    'support/prim-to-promise.js': '',
    'fetch.js': 'fetch/browser-script-worker.js',
    'suffix.js': 'suffix/requirejs-to-amodro.js'
  },

  // Base amodro, with some requirejs api support and includes prim for a
  // promise shim.
  'amodro-requirejs-prim': {
    'fetch.js': 'fetch/browser-script-worker.js',
    'suffix.js': 'suffix/requirejs-to-amodro.js'
  },
  // Same as aboev, but with debug logs
  'amodro-requirejs-prim-debug': {
    keepLog: true,
    'fetch.js': 'fetch/browser-script-worker.js',
    'suffix.js': 'suffix/requirejs-to-amodro.js'
  }
};

Object.keys(permutations).forEach(function(key) {
  var mapping = permutations[key];

  var transform = function(filePath, contents) {
    return contents;
  };

  if (!mapping.keepLog) {
    transform = transformNoLog;
  }

  var contents = transform(mainFilePath, mainContents);

  //Inline file contents
  contents = contents.replace(loadRegExp, function (match, fileName) {
    if (hasProp(mapping, fileName)) {
      fileName = mapping[fileName];
      if (fileName === '') {
        return '';
      }
    }

    if (!Array.isArray(fileName)) {
      fileName = [fileName];
    }

    var text = '';
    fileName.forEach(function(fileName) {
      var filePath = path.join(dir, fileName);
      // Path may not exist for cases where the expectatation is a mapping
      // *must* be provided.
      if (fs.existsSync(filePath)) {
        text += transform(filePath, fs.readFileSync(filePath, 'utf8'));
      }
    });

    return text;
  });

  // Write the file.
  var outPath = path.join(__dirname, '..', key + '.js');
  fs.writeFileSync(outPath, contents, 'utf8');
});
