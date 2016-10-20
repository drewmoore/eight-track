import { HTTP }       from 'meteor/http';
import { chai }       from 'meteor/practicalmeteor:chai';
import { EightTrack } from '../eight-track';
import { rmR }        from './test-helpers';

const fs            = Npm.require('fs');
const sampleBaseUrl = 'https://jsonplaceholder.typicode.com';

describe('Success', function () {
  let preFsError;
  let result;
  let cassetteName;
  let cassettesDirectoryList;

  beforeEach(function (done) {
    // Remove the cassettes directory if it exists. Tests initial conditions.
    rmR(EightTrack.cassettesDirectoryPath);
    // Test that the cassettes directory does not exist pre-caching.
    try { fs.readdirSync(EightTrack.cassettesDirectoryPath); } catch(e) { preFsError = e; }
    cassetteName = 'jsonPlaceHolderGetSuccess';
    EightTrack.use(cassetteName, function () {
      result = HTTP.get(sampleBaseUrl + '/posts/1');
      cassettesDirectoryList = fs.readdirSync(EightTrack.cassettesDirectoryPath);
      done();
    });
  });

  it('returns the expected results without error', function (done) {
    assert(result instanceof Object);
    assert(typeof result.data.title == 'string');
    done();
  });

  it('does not find the cassettes directory before caching', function (done) {
    assert(preFsError.message.match(RegExp('no such file or directory')));
    done();
  });

  it('finds the cassettes directory and json files after caching', function (done) {
    assert(cassettesDirectoryList.includes(cassetteName + '.json'));
    done();
  });

  it('creates a json file with the cached http response', function (done) {
    const file = fs.readFileSync(
      EightTrack.cassettesDirectoryPath + cassetteName + '.json'
    );
    const cachedResponse = JSON.parse(file);
    assert(cachedResponse.statusCode == 200);
    assert(cachedResponse.headers['content-type'].match(RegExp('application/json')));
    assert(typeof JSON.parse(cachedResponse.content).title == 'string');
    done();
  });
});
