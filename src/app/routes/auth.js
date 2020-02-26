module.exports = (routes) => {
    const auth = require('../controllers/AuthController');

    routes.post('/login', auth.login);

    routes.put('/admin', auth.editAdminCredentials);
}