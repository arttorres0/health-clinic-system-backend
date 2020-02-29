const CryptoJS = require("crypto-js");
const key = require("../../config.json")["cryptoKey"];

exports.encryptPassword = decryptedPassword => {
  return CryptoJS.AES.encrypt(decryptedPassword, key).toString();
};

exports.decryptPassword = encryptedPassword => {
  return CryptoJS.AES.decrypt(encryptedPassword, key).toString(
    CryptoJS.enc.Utf8
  );
};
