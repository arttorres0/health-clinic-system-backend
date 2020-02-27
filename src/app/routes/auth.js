const Roles = require('../auth/Roles');
const {authorizeByRole} = require('../auth/authMiddleware');

module.exports = (routes) => {
    const auth = require('../controllers/AuthController');

    routes.post('/login', auth.login);

    routes.get('/admin', authorizeByRole([Roles.ADMIN]), auth.getAdminCredentials);

    routes.put('/admin', authorizeByRole([Roles.ADMIN]), auth.editAdminCredentials);
}