const Roles = require("../auth/Roles");
const { authorizeByRole } = require("../auth/authMiddleware");

module.exports = routes => {
  const receitasDeMedicamento = require("../controllers/ReceitaDeMedicamentoController");

  routes.post(
    "/receitasDeMedicamento",
    authorizeByRole([Roles.MEDICO]),
    receitasDeMedicamento.create
  );

  routes.get("/receitasDeMedicamento", receitasDeMedicamento.findAll);

  routes.get(
    "/receitasDeMedicamento/:receitaDeMedicamentoId",
    receitasDeMedicamento.findOne
  );
};
