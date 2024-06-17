// const fs = require("fs");
// const deleteFile = (fileName, path) => {
//   console.log(fileName)
//   console.log(path)
//   return fileName.map((item) => {
//     const filePath = `${path}/${item}`;
//     if (fs.existsSync(filePath)) {
//       fs.unlink(filePath, (err) => {
//         if (err) {
//           return false;
//         } else {
//           return true;
//         }
//       });
//     }
//   });
// };
// module.exports = deleteFile;

const fs = require("fs");
const deleteFile = (pathname, fileName) => {
  fileName.map((item) => {
    const Path = `public/${pathname}/${item}`;
    // console.log(Path)
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
