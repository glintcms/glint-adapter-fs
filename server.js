/**
 * Module dependencies.
 */
var fs = require('fs');
var path = require('path');
var mkdirp = require('mkdirp');
var async = require('async');
var Query = require('mingo');
var merge = require('utils-merge');
//var encode = require('glint-util/encode.js');
//var decode = require('glint-util/decode.js');
var debug = require('debug')('glint:FileSystemAdapter');
var config = require('./config');

/**
 *  Module variables.
 */
var sep = path.sep;
var ext = '.json';

/**
 * Initialize a new `FileSystemAdapter` element.
 */
function FileSystemAdapter(options) {
  if (!(this instanceof FileSystemAdapter)) return new FileSystemAdapter(options);
  merge(this, config);
  merge(this, options);
}

/**
 * API functions.
 */

FileSystemAdapter.prototype.api = FileSystemAdapter.api = 'adapter-provider';

FileSystemAdapter.prototype.provider = FileSystemAdapter.provider = 'fs';

FileSystemAdapter.prototype.find = function (db, type, query, fn) {
  var p = this.getPath(db, type);
  fn = fn || noop();
  debug('fs find', p, query);

  fs.readdir(p, function (err, files) {
    if (err) return fn(err);
    files = files.filter(endsWithExt);
    files = files.map(function (file) {
      return p + '/' + file;
    })

    async.map(files, readFile, function (err, arr) {
      if (err) return fn(err);

      // return the complete array result without query
      if (!query || Object.keys(query).length === 0) return fn(null, arr);
      // query and return the result
      var result = Query.find(arr, query).all();
      fn(null, result);
    });
  });
};

FileSystemAdapter.prototype.load = function (db, type, id, fn) {
  var p = this.getPath(db, type, id);
  fn = fn || noop;
  debug('fs load', p);

  readFile(p, fn);
};

FileSystemAdapter.prototype.save = function (db, type, id, obj, fn) {
  var p = this.getPath(db, type, id);
  fn = fn || noop;
  debug('fs save', p);

  var content;
  if (typeof obj === 'object') {
    try {
      //decode(obj);
      content = JSON.stringify(obj, null, this.indent);
    } catch (err) {
      if (err) return fn(err);
    }
  } else {
    content = obj;
  }

  var dir = path.dirname(p);
  fs.exists(dir, function (exists) {

    if (!exists) {
      mkdirp(dir, function (err) {
        if (err) return fn(err);
        write(p, content, fn);
      });
    } else {
      write(p, content, fn);
    }
  });

  function write(filename, content, fn) {
    fs.writeFile(filename, content, function (err) {
      if (err) return fn(err);
      return fn(null, content);
    });
  }
};

FileSystemAdapter.prototype.delete = function (db, type, id, fn) {
  var p = this.getPath(db, type, id);
  fn = fn || noop;
  debug('fs delete', p);

  var dir = path.dirname(p);
  fs.exists(dir, function (exists) {

    if (!exists) {
      fn(null, true);
    } else {
      del(p, fn);
    }
  });

  function del(filename, fn) {
    fs.unlink(filename, function (err) {
      if (err) return fn(err);
      return fn(null, true);
    });
  }
};

/**
 * Helper functions.
 */
FileSystemAdapter.prototype.getPath = function (db, type, id) {
  debug('fs getPath', db, type, id);
  db = db || '';

  var p = (id) ? [this.address, db, type, id + ext] : [this.address, db, type];
  p = p.map(function (val) {
    return (typeof val === 'string') ? val.toLowerCase() : '';
  })
  p = p.join(sep);
  return p;
};

function noop() {
}

function endsWithExt(str) {
  return endsWith(str, ext);
}

function endsWith(str, suffix) {
  return str.indexOf(suffix, str.length - suffix.length) !== -1;
}

function readFile(path, fn) {
  fn = fn || noop;
  fs.readFile(path, 'utf-8', function (err, data) {
    if (err) return fn(err);
    var obj;
    try {
      obj = JSON.parse(data);
      //encode(obj);
    } catch (err) {
      if (err) return fn(err);
    }
    return fn(null, obj);
  });
}

/**
 * Expose FileSystemAdapter.
 */
exports = module.exports = FileSystemAdapter;
