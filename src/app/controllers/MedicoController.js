const Medico = require("../models/Medico");
const {
  loginAlreadyExistsForAdminOrRecepcionista
} = require("../helper/DatabaseFunctions");

exports.create = async (req, res) => {
  //TODO: encrypt password
  const medicoReqInfo = {
    nome: req.body.nome,
    login: req.body.login,
    senha: req.body.senha,
    cpf: req.body.cpf,
    email: req.body.email,
    telefone: req.body.telefone,
    crm: req.body.crm,
    dataDeNascimento: new Date(req.body.dataDeNascimento),
    dataDeAdmissão: new Date(req.body.dataDeAdmissão),
    ativo: true
  };

  var validationError = Medico.joiValidate(medicoReqInfo);

  if (validationError.error)
    return res.status(400).send({
      message: validationError.error.details[0].message
        ? "Formato inválido do campo " +
          validationError.error.details[0].context.key
        : "Erro nos dados do Médico"
    });

  if (await loginAlreadyExistsForAdminOrRecepcionista(medicoReqInfo.login))
    return res.status(400).send({
      message:
        "Outro usuário do sistema já possui o login " + medicoReqInfo.login
    });

  const medico = new Medico(medicoReqInfo);

  medico
    .save()
    .then(medico => {
      return res.send(medico);
    })
    .catch(err => {
      if (err.code === 11000) {
        const duplicatedKey = Object.keys(err.keyValue)[0];
        const duplicatedValue = err.keyValue[duplicatedKey];
        return res
          .status(409)
          .send({
            message:
              "Médico com " +
              duplicatedKey +
              " " +
              duplicatedValue +
              " já existente"
          });
      }

      return res.status(500).send({
        message: err.message || "Erro ao gravar Médico"
      });
    });
};

exports.findAll = (req, res) => {
  var filter = req.body.filter || "";
  var page = req.body.page || 1;
  var limitPerPage = 10;

  var query = { nome: { $regex: filter } };

  Medico.find(query)
    .sort({ nome: 1 })
    .skip(limitPerPage * page - limitPerPage)
    .limit(limitPerPage)
    .then(medicos => {
      if (req.user.role != "admin") {
        medicos.map(medico => {
          medico.login = undefined;
          medico.senha = undefined;
          return medico;
        });
      }

      Medico.count(query).exec((error, count) => {
        if (error)
          return res.status(500).send({
            message: err.message || "Erro ao buscar lista de Médicos"
          });

        return res.send({
          medicos,
          page,
          numberOfPages: Math.ceil(count / limitPerPage),
          numberOfResults: count
        });
      });
    })
    .catch(err => {
      return res.status(500).send({
        message: err.message || "Erro ao buscar lista de Médicos"
      });
    });
};

exports.findOne = (req, res) => {
  Medico.findById(req.params.medicoId)
    .then(medico => {
      if (medico) {
        if (req.user.role != "admin") {
          medico.login = undefined;
          medico.senha = undefined;
        }
        return res.send(medico);
      }

      return res.status(404).send({
        message: "Médico não encontrado"
      });
    })
    .catch(err => {
      if (err.kind === "ObjectId")
        return res.status(404).send({
          message: "Médico não encontrado"
        });

      return res.status(500).send({
        message: "Erro ao buscar Médico"
      });
    });
};

exports.update = async (req, res) => {
  var validationError = Medico.joiValidate(req.body);

  if (validationError.error)
    return res.status(400).send({
      message: validationError.error.details[0].message
        ? "Formato inválido do campo " +
          validationError.error.details[0].context.key
        : "Erro nos dados do Médico"
    });

  if (await loginAlreadyExistsForAdminOrRecepcionista(req.body.login))
    return res.status(400).send({
      message: "Outro usuário do sistema já possui o login " + req.body.login
    });

  Medico.findByIdAndUpdate(req.params.medicoId, req.body, { new: true })
    .then(medico => {
      if (medico) return res.send(medico);

      return res.status(404).send({
        message: "Médico não encontrado"
      });
    })
    .catch(err => {
      if (err.kind === "ObjectId")
        return res.status(404).send({
          message: "Médico não encontrado"
        });

      if (err.code === 11000) {
        const duplicatedKey = Object.keys(err.keyValue)[0];
        const duplicatedValue = err.keyValue[duplicatedKey];
        return res
          .status(409)
          .send({
            message:
              "Médico com " +
              duplicatedKey +
              " " +
              duplicatedValue +
              " já existente"
          });
      }

      return res.status(500).send({
        message: "Erro ao atualizar Médico"
      });
    });
};
