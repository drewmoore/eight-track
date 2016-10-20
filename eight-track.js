const fs = Npm.require('fs');

export class EightTrack {
  static use(cassetteName, block) {
    const self = this;
    const cassetteFilePath = self.cassettesDirectoryPath + cassetteName + '.json';

    let cassettesDirectoryList;
    let httpResponse;

    try {
      cassettesDirectoryList = fs.readdirSync(self.cassettesDirectoryPath);
    } catch(e) {
      if (e.message.match(RegExp('no such file or directory'))) {
        fs.mkdirSync(self.cassettesDirectoryPath);
        cassettesDirectoryList = fs.readdirSync(self.cassettesDirectoryPath);
      }
    }

    if (!cassettesDirectoryList.includes(cassetteFilePath)) {
      httpResponse = block();

      console.log('hello inside use: ', httpResponse);
      
      fs.writeFileSync(cassetteFilePath, JSON.stringify(httpResponse));
    }

    return httpResponse;
  }

  static get cassettesDirectoryPath() {
    return process.env.PWD + '/eight-track-cassettes/';
  }
};
