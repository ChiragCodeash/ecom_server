const fs = require("fs");
const deleteFile = (pathname, fileName) => {
  fileName.map((item) => {
    const Path = `public/${pathname}/${item}`;
    if (fs.existsSync(Path)) {
      fs.unlink(Path, (err) => {
        if (err) {
          return false;
        } else {
          return true;
        }
      });
    }
  });
};

module.exports = deleteFile;
