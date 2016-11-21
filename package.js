Package.describe({
  name: 'drewmoore:eight-track',
  version: '0.0.2',
  // Brief, one-line summary of the package.
  summary: 'HTTP caching for the Meteor framework.',
  // URL to the Git repository containing the source code for this package.
  git: 'https://github.com/drewmoore/eight-track',
  // By default, Meteor will default to using README.md for documentation.
  // To avoid submitting documentation, set this field to null.
  documentation: 'README.md'
});

Package.onUse(function(api) {
  api.versionsFrom('1.4.1.2');
  api.use('ecmascript');
  api.use('http');
  api.use('practicalmeteor:sinon@1.14.1');
  api.mainModule('eight-track.js');
  api.export('EightTrack');
});

Package.onTest(function(api) {
  api.use('ecmascript');
  api.use('dispatch:mocha-phantomjs@0.1.7');
  api.use('practicalmeteor:chai@2.1.0');
  api.use('practicalmeteor:sinon@1.14.1');
  api.use('drewmoore:eight-track');
  api.mainModule('eight-track-tests.js');
});

Npm.depends({
  jsonfile: '2.4.0'
});
