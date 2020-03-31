const CryptoJS = require("crypto-js");
const { cryptoKey } = require("../../config");

exports.encryptPassword = decryptedPassword => {
  return CryptoJS.AES.encrypt(decryptedPassword, cryptoKey).toString();
};

exports.decryptPassword = encryptedPassword => {
  return CryptoJS.AES.decrypt(encryptedPassword, cryptoKey).toString(
    CryptoJS.enc.Utf8
  );
};
