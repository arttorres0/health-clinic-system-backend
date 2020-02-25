module.exports = (routes) => {
    const medicamentos = require('../controllers/MedicamentoController');

    routes.post('/medicamentos', medicamentos.create);

    routes.get('/medicamentos', medicamentos.findAll);

    routes.get('/medicamentos/:medicamentoId', medicamentos.findOne);

    routes.put('/medicamentos/:medicamentoId', medicamentos.update);
}