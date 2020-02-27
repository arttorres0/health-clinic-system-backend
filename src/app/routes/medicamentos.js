const Roles = require('../auth/Roles');
const {authorizeByRole} = require('../auth/authMiddleware');

module.exports = (routes) => {
    const medicamentos = require('../controllers/MedicamentoController');

    routes.post('/medicamentos', authorizeByRole([Roles.ADMIN]), medicamentos.create);

    routes.get('/medicamentos', medicamentos.findAll);

    routes.get('/medicamentos/:medicamentoId', medicamentos.findOne);

    routes.put('/medicamentos/:medicamentoId', authorizeByRole([Roles.ADMIN]), medicamentos.update);
}