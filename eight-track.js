import { HTTP }  from 'meteor/http';
import { sinon } from 'meteor/practicalmeteor:sinon';

const fs = Npm.require('fs');

export class EightTrack {
  static use(cassetteName, block) {
    const self = this;
    const cassetteFilePath = self.cassettesDirectoryPath + cassetteName + '.json';
    let cassettesDirectoryList = [];

    // Read directory of cassettes or initialize an empty one.
    try {
      cassettesDirectoryList = fs.readdirSync(self.cassettesDirectoryPath);
    } catch(e) {
      if (e.message.match(RegExp('no such file or directory')))
        fs.mkdirSync(self.cassettesDirectoryPath);
    }

    // Stub http methods. Preserve the original to be conditionally called inside wrapper.
    const httpMethods = ['get', 'post', 'put', 'del'];
    httpMethods.forEach(methodName => {
      const originalMethod = HTTP[methodName];
      sinon.stub(HTTP, methodName, (_args) => {
        let response;
        if (cassettesDirectoryList.includes(cassetteFilePath)) {
          response = fs.readFileSync(cassetteFilePath);
        } else {
          if (!(_args instanceof Array))
            _args = [_args];
          response = originalMethod.apply(HTTP, _args);
          fs.writeFileSync(cassetteFilePath, JSON.stringify(response));
        }
        return response;
      });
    });

    block();

    httpMethods.forEach(methodName => { HTTP[methodName].restore(); });
  }

  static get cassettesDirectoryPath() {
    return process.env.PWD + '/eight-track-cassettes/';
  }
}
