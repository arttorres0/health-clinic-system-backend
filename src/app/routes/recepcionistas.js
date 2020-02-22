module.exports = (routes) => {
    const recepcionistas = require('../controllers/RecepcionistaController');

    routes.post('/recepcionistas', recepcionistas.create);

    routes.get('/recepcionistas', recepcionistas.findAll);

    routes.get('/recepcionistas/:recepcionistaId', recepcionistas.findOne);

    routes.put('/recepcionistas/:recepcionistaId', recepcionistas.update);

    routes.put('/recepcionistas/inativar/:recepcionistaId', recepcionistas.inactivate);

    routes.put('/recepcionistas/ativar/:recepcionistaId', recepcionistas.activate);
}