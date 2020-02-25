const express = require('express');
const routes = express.Router();

require('./medicos')(routes);
require('./recepcionistas')(routes);
require('./pacientes')(routes);
require('./convenios')(routes);
require('./medicamentos')(routes);
require('./consultas')(routes);

module.exports = routes;