module.exports = (routes) => {
    const solicitacoesDeExame = require('../controllers/SolicitacaoDeExameController');

    routes.post('/solicitacoesDeExame', solicitacoesDeExame.create);

    routes.get('/solicitacoesDeExame', solicitacoesDeExame.findAll);

    routes.get('/solicitacoesDeExame/listaDeTiposDeExames', solicitacoesDeExame.examTypeList);

    routes.put('/solicitacoesDeExame/resultado/:solicitacaoDeExameId', solicitacoesDeExame.saveExamResult);

    routes.get('/solicitacoesDeExame/resultado/:solicitacaoDeExameId', solicitacoesDeExame.getExamResult);

    routes.get('/solicitacoesDeExame/:solicitacaoDeExameId', solicitacoesDeExame.findOne);
}