var test = require('tape');
var fs = require('fs');
var Query = require('mingo');
var FileSystemAdapter = require('../server');

var fsa = FileSystemAdapter({address: __dirname + '/data'});

var db = 'articles';
var type = 'article';

test('find all articles', function (t) {
  t.plan(1);

  fsa.find(db, type, {}, function(err, result) {
    t.true(result.length == 5);
  });
});

test('find article with title: `Title 1`', function (t) {
  t.plan(1);

  fsa.find(db, type, {title: "Title 1"}, function(err, result) {
    t.true(result.length == 1);
  });
});

test('find article with title like `title` (case insesitive)', function (t) {
  t.plan(1);

  fsa.find(db, type, {title: /title/i}, function(err, result) {
    t.true(result.length == 5);
  });
});

test('find article with title like `title` (case sensitive)', function (t) {
  t.plan(1);

  fsa.find(db, type, {title: /title/}, function(err, result) {
    t.true(result.length == 2);
  });
});

test('find no matching article -> return empty Array', function (t) {
  t.plan(2);

  fsa.find(db, type, {title: "hafechaes"}, function(err, result) {
    t.true(Array.isArray(result));
    t.true(result.length == 0);
  });
});