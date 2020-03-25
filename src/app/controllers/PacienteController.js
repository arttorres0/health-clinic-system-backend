const Paciente = require("../models/Paciente");

exports.create = (req, res) => {
  const pacienteReqInfo = {
    nome: req.body.nome,
    cpf: req.body.cpf,
    email: req.body.email,
    telefone: req.body.telefone,
    dataDeNascimento: new Date(req.body.dataDeNascimento),
    ativo: true
  };

  var validationError = Paciente.joiValidate(pacienteReqInfo);

  if (validationError.error)
    return res.status(400).send({
      message: validationError.error.details[0].message
        ? "Formato inválido do campo " +
          validationError.error.details[0].context.key
        : "Erro nos dados do(a) Paciente"
    });

  const paciente = new Paciente(pacienteReqInfo);

  paciente
    .save()
    .then(paciente => {
      return res.send({ paciente, message: "Paciente salvo(a) com sucesso" });
    })
    .catch(err => {
      if (err.code === 11000) {
        const duplicatedKey = Object.keys(err.keyValue)[0];
        const duplicatedValue = err.keyValue[duplicatedKey];
        return res.status(409).send({
          message:
            "Paciente com " +
            duplicatedKey +
            " " +
            duplicatedValue +
            " já existente"
        });
      }

      return res.status(500).send({
        message: err.message || "Erro ao salvar Paciente"
      });
    });
};

exports.findAll = (req, res) => {
  var filter = req.query.filter || "";
  var page = req.query.page || 1;
  var limitPerPage = 10;

  var query = { nome: { $regex: filter } };

  Paciente.find(query)
    .sort({ nome: 1 })
    .skip(limitPerPage * page - limitPerPage)
    .limit(limitPerPage)
    .then(pacientes => {
      Paciente.count(query).exec((error, count) => {
        if (error)
          return res.status(500).send({
            message: err.message || "Erro ao buscar lista de Pacientes"
          });

        return res.send({
          pacientes,
          page,
          pageSize: limitPerPage,
          numberOfResults: count
        });
      });
    })
    .catch(err => {
      return res.status(500).send({
        message: err.message || "Erro ao buscar lista de Pacientes"
      });
    });
};

exports.findOne = (req, res) => {
  Paciente.findById(req.params.pacienteId)
    .then(paciente => {
      if (paciente) return res.send({ paciente });

      return res.status(404).send({
        message: "Paciente não encontrado(a)"
      });
    })
    .catch(err => {
      if (err.kind === "ObjectId")
        return res.status(404).send({
          message: "Paciente não encontrado(a)"
        });

      return res.status(500).send({
        message: "Erro ao buscar Paciente"
      });
    });
};

exports.update = (req, res) => {
  var validationError = Paciente.joiValidate(req.body);

  if (validationError.error)
    return res.status(400).send({
      message: validationError.error.details[0].message
        ? "Formato inválido do campo " +
          validationError.error.details[0].context.key
        : "Erro nos dados do(a) Paciente"
    });

  Paciente.findByIdAndUpdate(req.params.pacienteId, req.body, { new: true })
    .then(paciente => {
      if (paciente)
        return res.send({
          paciente,
          message: "Paciente atualizado(a) com sucesso"
        });

      return res.status(404).send({
        message: "Paciente não encontrado(a)"
      });
    })
    .catch(err => {
      if (err.kind === "ObjectId")
        return res.status(404).send({
          message: "Paciente não encontrado(a)"
        });

      if (err.code === 11000) {
        const duplicatedKey = Object.keys(err.keyValue)[0];
        const duplicatedValue = err.keyValue[duplicatedKey];
        return res.status(409).send({
          message:
            "Paciente com " +
            duplicatedKey +
            " " +
            duplicatedValue +
            " já existente"
        });
      }

      return res.status(500).send({
        message: "Erro ao atualizar Paciente"
      });
    });
};
