const Roles = require("../auth/Roles");
const { authorizeByRole } = require("../auth/authMiddleware");

module.exports = routes => {
  const solicitacoesDeExame = require("../controllers/SolicitacaoDeExameController");

  routes.post(
    "/solicitacoesDeExame",
    authorizeByRole([Roles.MEDICO]),
    solicitacoesDeExame.create
  );

  routes.get("/solicitacoesDeExame", solicitacoesDeExame.findAll);

  routes.get(
    "/solicitacoesDeExame/listaDeTiposDeExames",
    solicitacoesDeExame.examTypeList
  );

  routes.put(
    "/solicitacoesDeExame/resultado/:solicitacaoDeExameId",
    authorizeByRole([Roles.MEDICO]),
    solicitacoesDeExame.saveExamResult
  );

  routes.get(
    "/solicitacoesDeExame/resultado/:solicitacaoDeExameId",
    solicitacoesDeExame.getExamResult
  );

  routes.get(
    "/solicitacoesDeExame/:solicitacaoDeExameId",
    solicitacoesDeExame.findOne
  );
};
