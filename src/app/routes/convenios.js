const Roles = require('../auth/Roles');
const {authorizeByRole} = require('../auth/authMiddleware');

module.exports = (routes) => {
    const convenios = require('../controllers/ConvenioController');

    routes.post('/convenios', authorizeByRole([Roles.ADMIN]), convenios.create);

    routes.get('/convenios', convenios.findAll);

    routes.get('/convenios/:convenioId', convenios.findOne);

    routes.put('/convenios/:convenioId', authorizeByRole([Roles.ADMIN]), convenios.update);
}