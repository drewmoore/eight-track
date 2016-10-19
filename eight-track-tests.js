import { HTTP }       from 'meteor/http';
if (Meteor.isServer)
  import { FS }       from 'fs';
import { chai }       from 'meteor/practicalmeteor:chai';

import { EightTrack } from './eight-track';

const sampleBaseUrl = 'https://jsonplaceholder.typicode.com';

describe('Success', function () {
  let result;

  beforeEach(function (done) {
    EightTrack.use('jsonPlaceHolderGetSuccess', function () {
      HTTP.get(sampleBaseUrl + '/posts/1', function (error, response) {
        result = response;
        done();
      });
    });
  });

  it('should return the expected results without error', function (done) {
    assert(result instanceof Object);
    assert(typeof result.data.title == 'string');
    done();
  });
});
