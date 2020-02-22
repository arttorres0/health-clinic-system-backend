module.exports = (routes) => {
    const pacientes = require('../controllers/PacienteController');

    routes.post('/pacientes', pacientes.create);

    routes.get('/pacientes', pacientes.findAll);

    routes.get('/pacientes/:pacienteId', pacientes.findOne);

    routes.put('/pacientes/:pacienteId', pacientes.update);

    routes.put('/pacientes/inativar/:pacienteId', pacientes.inactivate);

    routes.put('/pacientes/ativar/:pacienteId', pacientes.activate);
}