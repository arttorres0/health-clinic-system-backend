const Medicamento = require("../models/Medicamento");

exports.create = (req, res) => {
  const medicamentoReqInfo = {
    nomeGenerico: req.body.nomeGenerico,
    nomeDeFabrica: req.body.nomeDeFabrica,
    fabricante: req.body.fabricante,
    ativo: true
  };

  var validationError = Medicamento.joiValidate(medicamentoReqInfo);

  if (validationError.error)
    return res.status(400).send({
      message: validationError.error.details[0].message
        ? "Formato inválido do campo " +
          validationError.error.details[0].context.key
        : "Erro nos dados do Medicamento"
    });

  const medicamento = new Medicamento(medicamentoReqInfo);

  medicamento
    .save()
    .then(medicamento => {
      return res.send({
        medicamento,
        message: "Medicamento salvo com sucesso"
      });
    })
    .catch(err => {
      if (err.code === 11000) {
        const duplicatedKey = Object.keys(err.keyValue)[0];
        const duplicatedValue = err.keyValue[duplicatedKey];
        return res.status(409).send({
          message:
            "Medicamento com " +
            duplicatedKey +
            " " +
            duplicatedValue +
            " já existente"
        });
      }

      return res.status(500).send({
        message: err.message || "Erro ao salvar Medicamento"
      });
    });
};

exports.findAll = (req, res) => {
  var filter = req.query.filter || "";
  var ativo = req.query.ativo;
  var page = req.query.page || 1;
  var limitPerPage = 10;

  var query = {
    $or: [
      { nomeGenerico: { $regex: filter } },
      { nomeDeFabrica: { $regex: filter } }
    ]
  };
  if (ativo != undefined) query.ativo = ativo;

  Medicamento.find(query)
    .sort({ nomeGenerico: 1 })
    .skip(limitPerPage * page - limitPerPage)
    .limit(limitPerPage)
    .then(medicamentos => {
      Medicamento.count(query).exec((error, count) => {
        if (error)
          return res.status(500).send({
            message: err.message || "Erro ao buscar lista de Medicamentos"
          });

        return res.send({
          medicamentos,
          page,
          pageSize: limitPerPage,
          numberOfResults: count
        });
      });
    })
    .catch(err => {
      return res.status(500).send({
        message: err.message || "Erro ao buscar lista de Medicamentos"
      });
    });
};

exports.findOne = (req, res) => {
  Medicamento.findById(req.params.medicamentoId)
    .then(medicamento => {
      if (medicamento) return res.send({ medicamento });

      return res.status(404).send({
        message: "Medicamento não encontrado"
      });
    })
    .catch(err => {
      if (err.kind === "ObjectId")
        return res.status(404).send({
          message: "Medicamento não encontrado"
        });

      return res.status(500).send({
        message: "Erro ao buscar Medicamento"
      });
    });
};

exports.update = (req, res) => {
  var validationError = Medicamento.joiValidate(req.body);

  if (validationError.error)
    return res.status(400).send({
      message: validationError.error.details[0].message
        ? "Formato inválido do campo " +
          validationError.error.details[0].context.key
        : "Erro nos dados do Medicamento"
    });

  Medicamento.findByIdAndUpdate(req.params.medicamentoId, req.body, {
    new: true
  })
    .then(medicamento => {
      if (medicamento)
        return res.send({
          medicamento,
          message: "Medicamento atualizado com sucesso"
        });

      return res.status(404).send({
        message: "Medicamento não encontrado"
      });
    })
    .catch(err => {
      if (err.kind === "ObjectId")
        return res.status(404).send({
          message: "Medicamento não encontrado"
        });

      if (err.code === 11000) {
        const duplicatedKey = Object.keys(err.keyValue)[0];
        const duplicatedValue = err.keyValue[duplicatedKey];
        return res.status(409).send({
          message:
            "Medicamento com " +
            duplicatedKey +
            " " +
            duplicatedValue +
            " já existente"
        });
      }

      return res.status(500).send({
        message: "Erro ao atualizar Medicamento"
      });
    });
};
