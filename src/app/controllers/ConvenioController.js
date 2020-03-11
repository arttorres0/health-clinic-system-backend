const Convenio = require("../models/Convenio");

exports.create = (req, res) => {
  const convenioReqInfo = {
    nome: req.body.nome,
    ativo: true
  };

  var validationError = Convenio.joiValidate(convenioReqInfo);

  if (validationError.error)
    return res.status(400).send({
      message: validationError.error.details[0].message
        ? "Formato inválido do campo " +
          validationError.error.details[0].context.key
        : "Erro nos dados do Convênio"
    });

  const convenio = new Convenio(convenioReqInfo);

  convenio
    .save()
    .then(convenio => {
      return res.send(convenio);
    })
    .catch(err => {
      if (err.code === 11000) {
        const duplicatedKey = Object.keys(err.keyValue)[0];
        const duplicatedValue = err.keyValue[duplicatedKey];
        return res.status(409).send({
          message:
            "Convênio com " +
            duplicatedKey +
            " " +
            duplicatedValue +
            " já existente"
        });
      }

      return res.status(500).send({
        message: err.message || "Erro ao gravar Convênio"
      });
    });
};

exports.findAll = (req, res) => {
  var filter = req.query.filter || "";
  var page = req.query.page || 1;
  var limitPerPage = 10;

  var query = { nome: { $regex: filter } };

  Convenio.find(query)
    .sort({ nome: 1 })
    .skip(limitPerPage * page - limitPerPage)
    .limit(limitPerPage)
    .then(convenios => {
      Convenio.count(query).exec((error, count) => {
        if (error)
          return res.status(500).send({
            message: err.message || "Erro ao buscar lista de Convênios"
          });

        return res.send({
          convenios,
          page,
          numberOfPages: Math.ceil(count / limitPerPage),
          numberOfResults: count
        });
      });
    })
    .catch(err => {
      return res.status(500).send({
        message: err.message || "Erro ao buscar lista de Convênios"
      });
    });
};

exports.findOne = (req, res) => {
  Convenio.findById(req.params.convenioId)
    .then(convenio => {
      if (convenio) return res.send(convenio);

      return res.status(404).send({
        message: "Convênio não encontrado"
      });
    })
    .catch(err => {
      if (err.kind === "ObjectId")
        return res.status(404).send({
          message: "Convênio não encontrado"
        });

      return res.status(500).send({
        message: "Erro ao buscar Convênio"
      });
    });
};

exports.update = (req, res) => {
  var validationError = Convenio.joiValidate(req.body);

  if (validationError.error)
    return res.status(400).send({
      message: validationError.error.details[0].message
        ? "Formato inválido do campo " +
          validationError.error.details[0].context.key
        : "Erro nos dados do Convênio"
    });

  Convenio.findByIdAndUpdate(req.params.convenioId, req.body, { new: true })
    .then(convenio => {
      if (convenio) return res.send(convenio);

      return res.status(404).send({
        message: "Convênio não encontrado"
      });
    })
    .catch(err => {
      if (err.kind === "ObjectId")
        return res.status(404).send({
          message: "Convênio não encontrado"
        });

      if (err.code === 11000) {
        const duplicatedKey = Object.keys(err.keyValue)[0];
        const duplicatedValue = err.keyValue[duplicatedKey];
        return res.status(409).send({
          message:
            "Convênio com " +
            duplicatedKey +
            " " +
            duplicatedValue +
            " já existente"
        });
      }

      return res.status(500).send({
        message: "Erro ao atualizar Convênio"
      });
    });
};
