const dotenv = require("dotenv");
dotenv.config();

const { jwtKey, cryptoKey, port, dbUri } = require("./default-config.json");

module.exports = {
  jwtKey: process.env.JWTKEY || jwtKey,
  cryptoKey: process.env.CRYPTOKEY || cryptoKey,
  port: process.env.PORT || port,
  dbUri: process.env.DBURI || dbUri
};
