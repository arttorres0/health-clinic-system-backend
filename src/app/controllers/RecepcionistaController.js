const Recepcionista = require("../models/Recepcionista");
const {
  loginAlreadyExistsForAdminOrMedico,
} = require("../helper/DatabaseFunctions");
const {
  encryptPassword,
  decryptPassword,
} = require("../helper/CryptoFunctions");

exports.create = async (req, res) => {
  const recepcionistaReqInfo = {
    nome: req.body.nome,
    login: req.body.login,
    senha: encryptPassword(req.body.senha),
    cpf: req.body.cpf,
    email: req.body.email,
    telefone: req.body.telefone,
    dataDeNascimento: req.body.dataDeNascimento,
    dataDeAdmissao: req.body.dataDeAdmissao,
    ativo: true,
  };

  var validationError = Recepcionista.joiValidate(recepcionistaReqInfo);

  if (validationError.error)
    return res.status(400).send({
      message: validationError.error.details[0].message
        ? "Formato inválido do campo " +
          validationError.error.details[0].context.key
        : "Erro nos dados do(a) Recepcionista",
    });

  if (await loginAlreadyExistsForAdminOrMedico(recepcionistaReqInfo.login))
    return res.status(400).send({
      message:
        "Outro usuário do sistema já possui o login " +
        recepcionistaReqInfo.login,
    });

  const recepcionista = new Recepcionista(recepcionistaReqInfo);

  recepcionista
    .save()
    .then((recepcionista) => {
      return res.send({
        recepcionista,
        message: "Recepcionista salvo(a) com sucesso",
      });
    })
    .catch((err) => {
      if (err.code === 11000) {
        const duplicatedKey = Object.keys(err.keyValue)[0];
        const duplicatedValue = err.keyValue[duplicatedKey];
        return res.status(409).send({
          message:
            "Recepcionista com " +
            duplicatedKey +
            " " +
            duplicatedValue +
            " já existente",
        });
      }

      return res.status(500).send({
        message: err.message || "Erro ao salvar Recepcionista",
      });
    });
};

exports.findAll = (req, res) => {
  var filter = req.query.filter || "";
  var page = req.query.page || 1;
  var limitPerPage = 10;

  var query = { nome: { $regex: filter, $options: "i" } };

  Recepcionista.find(query)
    .sort({ nome: 1 })
    .skip(limitPerPage * page - limitPerPage)
    .limit(limitPerPage)
    .then((recepcionistas) => {
      recepcionistas.map((recepcionista) => {
        if (req.user.role != "admin") {
          recepcionista.login = undefined;
          recepcionista.senha = undefined;
        } else {
          recepcionista.senha = decryptPassword(recepcionista.senha);
        }
        return recepcionista;
      });

      Recepcionista.count(query).exec((error, count) => {
        if (error)
          return res.status(500).send({
            message: err.message || "Erro ao buscar lista de Recepcionistas",
          });

        return res.send({
          recepcionistas,
          page,
          pageSize: limitPerPage,
          numberOfResults: count,
        });
      });
    })
    .catch((err) => {
      return res.status(500).send({
        message: err.message || "Erro ao buscar lista de Recepcionistas",
      });
    });
};

exports.findOne = (req, res) => {
  Recepcionista.findById(req.params.recepcionistaId)
    .then((recepcionista) => {
      if (recepcionista) {
        if (req.user.role != "admin") {
          recepcionista.login = undefined;
          recepcionista.senha = undefined;
        } else {
          recepcionista.senha = decryptPassword(recepcionista.senha);
        }
        return res.send({ recepcionista });
      }

      return res.status(404).send({
        message: "Recepcionista não encontrado(a)",
      });
    })
    .catch((err) => {
      if (err.kind === "ObjectId")
        return res.status(404).send({
          message: "Recepcionista não encontrado(a)",
        });

      return res.status(500).send({
        message: "Erro ao buscar Recepcionista",
      });
    });
};

exports.update = async (req, res) => {
  req.body.senha = encryptPassword(req.body.senha);

  var validationError = Recepcionista.joiValidate(req.body);

  if (validationError.error)
    return res.status(400).send({
      message: validationError.error.details[0].message
        ? "Formato inválido do campo " +
          validationError.error.details[0].context.key
        : "Erro nos dados do(a) Recepcionista",
    });

  if (await loginAlreadyExistsForAdminOrMedico(req.body.login))
    return res.status(400).send({
      message: "Outro usuário do sistema já possui o login " + req.body.login,
    });

  Recepcionista.findByIdAndUpdate(req.params.recepcionistaId, req.body, {
    new: true,
  })
    .then((recepcionista) => {
      if (recepcionista)
        return res.send({
          recepcionista,
          message: "Recepcionista atualizado(a) com sucesso",
        });

      return res.status(404).send({
        message: "Recepcionista não encontrado(a)",
      });
    })
    .catch((err) => {
      if (err.kind === "ObjectId")
        return res.status(404).send({
          message: "Recepcionista não encontrado(a)",
        });

      if (err.code === 11000) {
        const duplicatedKey = Object.keys(err.keyValue)[0];
        const duplicatedValue = err.keyValue[duplicatedKey];
        return res.status(409).send({
          message:
            "Recepcionista com " +
            duplicatedKey +
            " " +
            duplicatedValue +
            " já existente",
        });
      }

      return res.status(500).send({
        message: "Erro ao atualizar Recepcionista",
      });
    });
};
