const Medico = require("../models/Medico");
const {
  loginAlreadyExistsForAdminOrRecepcionista,
} = require("../helper/DatabaseFunctions");
const {
  encryptPassword,
  decryptPassword,
} = require("../helper/CryptoFunctions");

exports.create = async (req, res) => {
  const medicoReqInfo = {
    nome: req.body.nome,
    login: req.body.login,
    senha: encryptPassword(req.body.senha),
    cpf: req.body.cpf,
    email: req.body.email,
    telefone: req.body.telefone,
    crm: req.body.crm,
    dataDeNascimento: req.body.dataDeNascimento,
    dataDeAdmissao: req.body.dataDeAdmissao,
    ativo: true,
  };

  var validationError = Medico.joiValidate(medicoReqInfo);

  if (validationError.error)
    return res.status(400).send({
      message: validationError.error.details[0].message
        ? "Formato inválido do campo " +
          validationError.error.details[0].context.key
        : "Erro nos dados do(a) Médico(a)",
    });

  if (await loginAlreadyExistsForAdminOrRecepcionista(medicoReqInfo.login))
    return res.status(400).send({
      message:
        "Outro usuário do sistema já possui o login " + medicoReqInfo.login,
    });

  const medico = new Medico(medicoReqInfo);

  medico
    .save()
    .then((medico) => {
      return res.send({ medico, message: "Médico(a) salvo(a) com sucesso" });
    })
    .catch((err) => {
      if (err.code === 11000) {
        const duplicatedKey = Object.keys(err.keyValue)[0];
        const duplicatedValue = err.keyValue[duplicatedKey];
        return res.status(409).send({
          message:
            "Médico(a) com " +
            duplicatedKey +
            " " +
            duplicatedValue +
            " já existente",
        });
      }

      return res.status(500).send({
        message: err.message || "Erro ao salvar Médico(a)",
      });
    });
};

exports.findAll = (req, res) => {
  var filter = req.query.filter || "";
  var ativo = req.query.ativo;
  var page = req.query.page || 1;
  var limitPerPage = 10;

  var query = { nome: { $regex: filter, $options: "i" } };
  if (ativo != undefined) query.ativo = ativo;

  Medico.find(query)
    .sort({ nome: 1 })
    .skip(limitPerPage * page - limitPerPage)
    .limit(limitPerPage)
    .then((medicos) => {
      medicos.map((medico) => {
        if (req.user.role !== "admin") {
          medico.login = undefined;
          medico.senha = undefined;
        } else {
          medico.senha = decryptPassword(medico.senha);
        }
        return medico;
      });

      Medico.count(query).exec((error, count) => {
        if (error)
          return res.status(500).send({
            message: err.message || "Erro ao buscar lista de Médicos",
          });

        return res.send({
          medicos,
          page,
          pageSize: limitPerPage,
          numberOfResults: count,
        });
      });
    })
    .catch((err) => {
      return res.status(500).send({
        message: err.message || "Erro ao buscar lista de Médicos",
      });
    });
};

exports.findOne = (req, res) => {
  Medico.findById(req.params.medicoId)
    .then((medico) => {
      if (medico) {
        if (req.user.role != "admin") {
          medico.login = undefined;
          medico.senha = undefined;
        } else {
          medico.senha = decryptPassword(medico.senha);
        }
        return res.send({ medico });
      }

      return res.status(404).send({
        message: "Médico(a) não encontrado(a)",
      });
    })
    .catch((err) => {
      if (err.kind === "ObjectId")
        return res.status(404).send({
          message: "Médico(a) não encontrado(a)",
        });

      return res.status(500).send({
        message: "Erro ao buscar Médico(a)",
      });
    });
};

exports.update = async (req, res) => {
  req.body.senha = encryptPassword(req.body.senha);

  var validationError = Medico.joiValidate(req.body);

  if (validationError.error)
    return res.status(400).send({
      message: validationError.error.details[0].message
        ? "Formato inválido do campo " +
          validationError.error.details[0].context.key
        : "Erro nos dados do(a) Médico(a)",
    });

  if (await loginAlreadyExistsForAdminOrRecepcionista(req.body.login))
    return res.status(400).send({
      message: "Outro usuário do sistema já possui o login " + req.body.login,
    });

  Medico.findByIdAndUpdate(req.params.medicoId, req.body, { new: true })
    .then((medico) => {
      if (medico)
        return res.send({
          medico,
          message: "Médico(a) atualizado(a) com sucesso",
        });

      return res.status(404).send({
        message: "Médico(a) não encontrado(a)",
      });
    })
    .catch((err) => {
      if (err.kind === "ObjectId")
        return res.status(404).send({
          message: "Médico(a) não encontrado(a)",
        });

      if (err.code === 11000) {
        const duplicatedKey = Object.keys(err.keyValue)[0];
        const duplicatedValue = err.keyValue[duplicatedKey];
        return res.status(409).send({
          message:
            "Médico(a) com " +
            duplicatedKey +
            " " +
            duplicatedValue +
            " já existente",
        });
      }

      return res.status(500).send({
        message: "Erro ao atualizar Médico(a)",
      });
    });
};
