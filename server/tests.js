import { HTTP }       from 'meteor/http';
import { chai }       from 'meteor/practicalmeteor:chai';
import { EightTrack } from '../eight-track';

const fs            = Npm.require('fs');
const sampleBaseUrl = 'https://jsonplaceholder.typicode.com';

describe('Success', function () {
  let preFsError;
  let result;
  let cassetteName;
  let cassettesDirectoryList;

  beforeEach(function (done) {
    try { fs.readdirSync(EightTrack.cassettesDirectoryPath); } catch(e) { preFsError = e; }
    cassetteName = 'jsonPlaceHolderGetSuccess';
    EightTrack.use(cassetteName, function () {
      HTTP.get(sampleBaseUrl + '/posts/1', function (error, response) {
        result = response;
        cassettesDirectoryList = fs.readdirSync(EightTrack.cassettesDirectoryPath);
        done();
      });
    });
  });

  it('should return the expected results without error', function (done) {
    assert(result instanceof Object);
    assert(typeof result.data.title == 'string');
    done();
  });

  it('should not find the cassettes directory before caching', function (done) {
    assert(preFsError.message.match(RegExp('no such file or directory')));
    done();
  });

  it('should find the cassettes directory after caching', function (done) {
    assert(cassettesDirectoryList.includes(cassetteName + '.json'));
    done();
  });
});
