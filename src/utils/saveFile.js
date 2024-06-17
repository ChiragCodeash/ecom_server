const fs = require("fs");
const path = require("path");
const createfolder = require("./createfolder");

const saveFile = (pathname, file) => {
  createfolder(pathname);
  const name_array = file.map((item, i) => {
    const extension = item.mimetype.split("/")[1];
    const pathnameSplit = pathname.split("/");
    const filePrefix = pathnameSplit[pathnameSplit.length - 1];
    const fileName = filePrefix + "_" + Date.now()  + "_" + Math.floor(Math.random()*100000)  + "." + extension;
    const uploadPath = path.join("public", pathname, `${fileName}`);

    fs.writeFile(uploadPath, item.buffer, (err) => {
      if (err) {
        return false;
      }
    });
    return fileName;
  });
  return name_array;
};

module.exports = saveFile;
