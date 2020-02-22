const express = require("express");
const routes = express.Router();

require("./medicos")(routes);

module.exports = routes;