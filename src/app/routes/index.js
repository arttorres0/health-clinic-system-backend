const express = require("express");
const routes = express.Router();

require("./medicos")(routes);
require("./recepcionistas")(routes);
require("./pacientes")(routes);

module.exports = routes;