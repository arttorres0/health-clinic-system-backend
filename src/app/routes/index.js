const express = require('express');
const routes = express.Router();

require('./medicos')(routes);
require('./recepcionistas')(routes);
require('./pacientes')(routes);
require('./convenios')(routes);
require('./medicamentos')(routes);
require('./consultas')(routes);
require('./receitasDeMedicamento')(routes);

module.exports = routes;