const Roles = require("../auth/Roles");
const { authorizeByRole } = require("../auth/authMiddleware");

module.exports = routes => {
  const medicos = require("../controllers/MedicoController");

  routes.post("/medicos", authorizeByRole([Roles.ADMIN]), medicos.create);

  routes.get("/medicos", medicos.findAll);

  routes.get("/medicos/:medicoId", medicos.findOne);

  routes.put(
    "/medicos/:medicoId",
    authorizeByRole([Roles.ADMIN]),
    medicos.update
  );
};
