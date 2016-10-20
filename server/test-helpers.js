const fs = Npm.require('fs');

// Thanks to https://gist.github.com/liangzan/807712#gistcomment-337828
export const rmR = (path) => {
  let directoryList = [];
  try { directoryList = fs.readdirSync(path); } catch(e) { return; }
  directoryList.forEach(fileName => {
    const filePath = path + '/' + fileName;
    if (fs.statSync(filePath).isFile())
      fs.unlinkSync(filePath);
    else
      rmDir(filePath);
  });
  fs.rmdirSync(path);
};
