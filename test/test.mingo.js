var test = require('tape');
var fs = require('fs');
var Query = require('mingo');

var npm = JSON.parse(fs.readFileSync(__dirname + '/data/npm.json'));


test('npm registry find JSON module', function (t) {
  t.plan(1);
  var result = Query.find(npm.rows, {id: 'JSON'}).all();
  t.true(result.length == 1);
});


test('npm registry find `express` stuff', function (t) {
  t.plan(1);
  var result = Query.find(npm.rows, {$where: 'this.id.indexOf("express") !== -1'}).all();
  t.true(result.length > 100);
});

test('npm registry find `connect` stuff', function (t) {
  t.plan(1);

  function hasConnect() {
    return this.id.indexOf("connect") !== -1;
  }

  var result = Query.find(npm.rows, {$where: hasConnect}).all();
  t.true(result.length > 100);
});

test('npm registry find `mocha` stuff', function (t) {
  t.plan(1);
  var result = Query.find(npm.rows, {id: /mocha/g}).all();
  t.true(result.length > 100);
});