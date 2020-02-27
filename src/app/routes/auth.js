module.exports = (routes) => {
    const auth = require('../controllers/AuthController');

    routes.post('/login', auth.login);

    routes.get('/admin', auth.getAdminCredentials);

    routes.put('/admin', auth.editAdminCredentials);
}