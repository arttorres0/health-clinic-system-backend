module.exports = (routes) => {
    const receitasDeMedicamento = require('../controllers/ReceitaDeMedicamentoController');

    routes.post('/receitasDeMedicamento', receitasDeMedicamento.create);

    routes.get('/receitasDeMedicamento', receitasDeMedicamento.findAll);

    routes.get('/receitasDeMedicamento/:receitaDeMedicamentoId', receitasDeMedicamento.findOne);
}