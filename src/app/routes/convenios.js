module.exports = (routes) => {
    const convenios = require('../controllers/ConvenioController');

    routes.post('/convenios', convenios.create);

    routes.get('/convenios', convenios.findAll);

    routes.get('/convenios/:convenioId', convenios.findOne);

    routes.put('/convenios/:convenioId', convenios.update);
}