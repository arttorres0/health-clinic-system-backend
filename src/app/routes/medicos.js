module.exports = (routes) => {
    const medicos = require('../controllers/MedicoController');

    routes.post('/medicos', medicos.create);

    routes.get('/medicos', medicos.findAll);

    routes.get('/medicos/:medicoId', medicos.findOne);

    routes.put('/medicos/:medicoId', medicos.update);
}