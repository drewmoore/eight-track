import { HTTP }  from 'meteor/http';
import { sinon } from 'meteor/practicalmeteor:sinon';

let fs;
let jsonfile;
if (Meteor.isServer) {
  fs       = Npm.require('fs');
  jsonfile = Npm.require('jsonfile');
}

export class EightTrack {
  static useCassette(cassetteName, block) {
    const self = this;
    const cassetteFileName = cassetteName + '.json';
    const cassetteFilePath = self.cassettesDirectoryPath + cassetteFileName;
    let cassettesDirectoryList = [];

    // Read directory of cassettes or initialize an empty one.
    try {
      cassettesDirectoryList = fs.readdirSync(self.cassettesDirectoryPath);
    } catch(e) {
      if (e.message.match(RegExp('no such file or directory')))
        fs.mkdirSync(self.cassettesDirectoryPath);
    }

    // Stub http methods. Preserve the original to be conditionally called inside wrapper.
    const httpMethods = ['get', 'post', 'put', 'patch', 'del'];
    httpMethods.forEach(methodName => {
      const originalMethod = HTTP[methodName];
      if (originalMethod.restore) originalMethod.restore();
      sinon.stub(HTTP, methodName, (_args) => {
        let response;
        if (
          cassettesDirectoryList.includes(cassetteFileName) &&
          !self.cacheExpired(cassetteFilePath)
        ) {
          response = jsonfile.readFileSync(cassetteFilePath);
        } else {
          if (!(_args instanceof Array))
            _args = [_args];
          response = originalMethod.apply(HTTP, _args);
          jsonfile.writeFileSync(cassetteFilePath, response);
        }
        return response;
      });
    });

    block();

    httpMethods.forEach(methodName => { HTTP[methodName].restore(); });
  }

  // Is the cassette expired, according to the set reRecordInterval?
  static cacheExpired(cassetteFilePath) {
    const self      = this;
    const fileStats = fs.statSync(cassetteFilePath);
    return (Date.now() - fileStats.birthtime.getTime()) >= self.reRecordInterval;
  }


  static get cassettesDirectoryPath() {
    return process.env.PWD + '/eight-track-cassettes/';
  }

  // Determines expiration interval for cassettes. After they expire, they will
  // be recreated with a new http request.
  static get reRecordInterval() {
    // For now, arbitrarily set all cassettes to expire in 24 hours from birth in milliseconds.
    return 8.64e+7;
  }
}
