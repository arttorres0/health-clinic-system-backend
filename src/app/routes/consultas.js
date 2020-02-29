module.exports = routes => {
  const consultas = require("../controllers/ConsultaController");

  routes.post("/consultas", consultas.create);

  routes.get("/consultas", consultas.findAll);

  routes.get("/consultas/:consultaId", consultas.findOne);

  routes.put("/consultas/:consultaId", consultas.update);

  routes.delete("/consultas/:consultaId", consultas.delete);
};
