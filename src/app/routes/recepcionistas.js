const Roles = require("../auth/Roles");
const { authorizeByRole } = require("../auth/authMiddleware");

module.exports = routes => {
  const recepcionistas = require("../controllers/RecepcionistaController");

  routes.post(
    "/recepcionistas",
    authorizeByRole([Roles.ADMIN]),
    recepcionistas.create
  );

  routes.get("/recepcionistas", recepcionistas.findAll);

  routes.get("/recepcionistas/:recepcionistaId", recepcionistas.findOne);

  routes.put(
    "/recepcionistas/:recepcionistaId",
    authorizeByRole([Roles.ADMIN]),
    recepcionistas.update
  );
};
