import { HTTP }       from 'meteor/http';
import { chai }       from 'meteor/practicalmeteor:chai';
import { sinon }      from 'meteor/practicalmeteor:sinon';
import { EightTrack } from '../eight-track';
import { rmR }        from './test-helpers';

const fs            = Npm.require('fs');
const sampleBaseUrl = 'https://jsonplaceholder.typicode.com/';

describe('Success', function () {
  describe('Get', function () {
    let preFsError;
    let result;
    let cassetteName; cassettesDirectoryList; cassetteFilePath; cassetteFile;

    beforeEach(function (done) {
      // Remove the cassettes directory if it exists. Tests initial conditions.
      rmR(EightTrack.cassettesDirectoryPath);
      // Test that the cassettes directory does not exist pre-caching.
      try { fs.readdirSync(EightTrack.cassettesDirectoryPath); } catch(e) { preFsError = e; }
      cassetteName     = 'jsonPlaceHolderGetSuccess';
      cassetteFilePath = EightTrack.cassettesDirectoryPath + cassetteName + '.json';
      EightTrack.useCassette(cassetteName, function () {
        result = HTTP.get(sampleBaseUrl + 'posts/1');
        cassettesDirectoryList = fs.readdirSync(EightTrack.cassettesDirectoryPath);
        cassetteFile = fs.readFileSync(cassetteFilePath);
        done();
      });
    });

    afterEach(function (done) {
      // Remove the cassettes directory if it exists. Tests initial conditions.
      rmR(EightTrack.cassettesDirectoryPath);
      done();
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
      const cachedResponse = JSON.parse(cassetteFile);
      assert(cachedResponse.statusCode == 200);
      assert(cachedResponse.headers['content-type'].match(RegExp('application/json')));
      assert(typeof JSON.parse(cachedResponse.content).title == 'string');
      done();
    });

    describe('Stubbing Request from Cache', function () {
      let result2;
      let fileStatsBefore;

      beforeEach(function (done) {
        fileStatsBefore = fs.statSync(cassetteFilePath);
        EightTrack.useCassette(cassetteName, function () {
          result2 = HTTP.get(sampleBaseUrl + 'posts/1');
          done();
        });
      });

      it('perfectly mimics original http response', function (done) {
        assert.deepEqual(result2, result);
        done();
      });

      it('does not affect relevant cache file timestamps', function (done) {
        const fileStatsAfter = fs.statSync(cassetteFilePath);
        assert.deepEqual(fileStatsAfter.mtime, fileStatsBefore.mtime);
        assert.deepEqual(fileStatsAfter.birthtime, fileStatsBefore.birthtime);
        done();
      });
    });

    describe('Making New Request when Cache Expired', function () {
      let clock;
      let startTime;
      let result2;
      let fileStatsBefore;

      beforeEach(function (done) {
        startTime       = Date.now();
        clock           = sinon.useFakeTimers(startTime);
        fileStatsBefore = fs.statSync(cassetteFilePath);
        clock.tick(EightTrack.reRecordInterval);
        if ((Date.now() - startTime) < EightTrack.reRecordInterval)
          throw 'Test setup failed to mock time.';
        EightTrack.useCassette(cassetteName, function () {
          // We'll change the request endpoint to be sure to have different data
          // to test against.
          result2 = HTTP.get(sampleBaseUrl + 'posts/2');
          done();
        });
      });

      afterEach(function (done) {
        clock.restore();
        done();
      });

      it('makes new request', function (done) {
        assert.notDeepEqual(result2, result);
        done();
      });

      it('replaces cached file', function (done) {
        const cassetteFile2  = fs.readFileSync(cassetteFilePath);
        const fileStatsAfter = fs.statSync(cassetteFilePath);
        assert.notEqual(JSON.parse(cassetteFile).data.id, JSON.parse(cassetteFile2).data.id);
        assert.notEqual(fileStatsBefore.birthtime, fileStatsAfter.birthtime);
        done();
      });
    });
  });

  describe('Post', function () {
    let cassetteName;
    let result;

    beforeEach(function (done) {
      cassetteName = 'jsonPlaceHolderPostSuccess';
      EightTrack.useCassette(cassetteName, function () {
        result = HTTP.post(sampleBaseUrl + 'posts', { data: { thing: 'whatever' } });
        done();
      });
    });

    it('creates a json file with the cached http response', function (done) {
      const file = fs.readFileSync(
        EightTrack.cassettesDirectoryPath + cassetteName + '.json'
      );
      const cachedResponse = JSON.parse(file);
      assert.equal(201, cachedResponse.statusCode);
      assert(cachedResponse.headers['content-type'].match(RegExp('application/json')));
      assert.equal(typeof cachedResponse.data.id, 'number');
      done();
    });

    describe('Stubbing Request from Cache', function () {
      let result2;

      beforeEach(function (done) {
        EightTrack.useCassette(cassetteName, function () {
          result2 = HTTP.post(sampleBaseUrl + 'posts', { data: { thing: 'whatever' } });
          done();
        });
      });

      it('perfectly mimics original http response', function (done) {
        assert.deepEqual(result2, result);
        done();
      });
    });
  });

  describe('Put', function () {
    let cassetteName;
    let result;

    beforeEach(function (done) {
      cassetteName = 'jsonPlaceHolderPutSuccess';
      EightTrack.useCassette(cassetteName, function () {
        result = HTTP.put(sampleBaseUrl + 'posts/1', { data: { thing: 'whatever' } });
        done();
      });
    });

    it('creates a json file with the cached http response', function (done) {
      const file = fs.readFileSync(
        EightTrack.cassettesDirectoryPath + cassetteName + '.json'
      );
      const cachedResponse = JSON.parse(file);
      assert.equal(200, cachedResponse.statusCode);
      assert(cachedResponse.headers['content-type'].match(RegExp('application/json')));
      assert.equal(typeof cachedResponse.data.id, 'number');
      done();
    });

    describe('Stubbing Request from Cache', function () {
      let result2;

      beforeEach(function (done) {
        EightTrack.useCassette(cassetteName, function () {
          result2 = HTTP.put(sampleBaseUrl + 'posts/1', { data: { thing: 'whatever' } });
          done();
        });
      });

      it('perfectly mimics original http response', function (done) {
        assert.deepEqual(result2, result);
        done();
      });
    });
  });

  describe('Patch', function () {
    let cassetteName;
    let result;

    beforeEach(function (done) {
      cassetteName = 'jsonPlaceHolderPatchSuccess';
      EightTrack.useCassette(cassetteName, function () {
        result = HTTP.patch(sampleBaseUrl + 'posts/1', { data: { thing: 'whatever' } });
        done();
      });
    });

    it('creates a json file with the cached http response', function (done) {
      const file = fs.readFileSync(
        EightTrack.cassettesDirectoryPath + cassetteName + '.json'
      );
      const cachedResponse = JSON.parse(file);
      assert.equal(200, cachedResponse.statusCode);
      assert(cachedResponse.headers['content-type'].match(RegExp('application/json')));
      assert.equal(typeof cachedResponse.data.id, 'number');
      done();
    });

    describe('Stubbing Request from Cache', function () {
      let result2;

      beforeEach(function (done) {
        EightTrack.useCassette(cassetteName, function () {
          result2 = HTTP.patch(sampleBaseUrl + 'posts/1', { data: { thing: 'whatever' } });
          done();
        });
      });

      it('perfectly mimics original http response', function (done) {
        assert.deepEqual(result2, result);
        done();
      });
    });
  });

  describe('Del', function () {
    let cassetteName;
    let result;

    beforeEach(function (done) {
      cassetteName = 'jsonPlaceHolderDelSuccess';
      EightTrack.useCassette(cassetteName, function () {
        result = HTTP.del(sampleBaseUrl + 'posts/1');
        done();
      });
    });

    it('creates a json file with the cached http response', function (done) {
      const file = fs.readFileSync(
        EightTrack.cassettesDirectoryPath + cassetteName + '.json'
      );
      const cachedResponse = JSON.parse(file);
      assert.equal(200, cachedResponse.statusCode);
      assert(cachedResponse.headers['content-type'].match(RegExp('application/json')));
      done();
    });

    describe('Stubbing Request from Cache', function () {
      let result2;

      beforeEach(function (done) {
        EightTrack.useCassette(cassetteName, function () {
          result2 = HTTP.del(sampleBaseUrl + 'posts/1');
          done();
        });
      });

      it('perfectly mimics original http response', function (done) {
        assert.deepEqual(result2, result);
        done();
      });
    });
  });
});
