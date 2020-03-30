const SolicitacaoDeExame = require("../models/SolicitacaoDeExame");
const {
  idPacienteIsValid,
  idMedicoIsValid
} = require("../helper/DatabaseFunctions");
const examTypeList = require("../models/ListaDeExames");
const path = require("path");

exports.create = async (req, res) => {
  const solicitacaoDeExameReqInfo = {
    idPaciente: req.body.idPaciente,
    idMedico: req.body.idMedico,
    data: req.body.data,
    exame: req.body.exame
  };

  if (req.body.observacao)
    solicitacaoDeExameReqInfo.observacao = req.body.observacao;

  var validationError = SolicitacaoDeExame.joiValidate(
    solicitacaoDeExameReqInfo
  );

  if (validationError.error)
    return res.status(400).send({
      message: validationError.error.details[0].message
        ? "Formato inválido do campo " +
          validationError.error.details[0].context.key
        : "Erro nos dados da Solicitação de Exame"
    });

  if (!(await idMedicoIsValid(solicitacaoDeExameReqInfo.idMedico)))
    return res.status(400).send({
      message: "Médico não encontrado ou inativo"
    });

  if (!(await idPacienteIsValid(solicitacaoDeExameReqInfo.idPaciente)))
    return res.status(400).send({
      message: "Paciente não encontrado ou inativo"
    });

  const solicitacaoDeExame = new SolicitacaoDeExame(solicitacaoDeExameReqInfo);

  solicitacaoDeExame
    .save()
    .then(solicitacaoDeExame => {
      return res.send({
        solicitacaoDeExame,
        message: "Solicitação de Exame salva com sucesso"
      });
    })
    .catch(err => {
      return res.status(500).send({
        message: err.message || "Erro ao salvar Solicitação de Exame"
      });
    });
};

exports.findAll = (req, res) => {
  var page = req.query.page || 1;
  var limitPerPage = 10;

  var query = {};

  req.query.idPaciente ? (query.idPaciente = req.query.idPaciente) : undefined;
  req.query.idMedico ? (query.idMedico = req.query.idMedico) : undefined;
  req.query.data ? (query.data = req.query.data) : undefined;

  SolicitacaoDeExame.find(query)
    .sort({ data: -1 })
    .skip(limitPerPage * page - limitPerPage)
    .limit(limitPerPage)
    .populate("idMedico", "nome")
    .populate("idPaciente", "nome")
    .then(solicitacoesDeExame => {
      SolicitacaoDeExame.count(query).exec((error, count) => {
        if (error)
          return res.status(500).send({
            message:
              err.message || "Erro ao buscar lista de Solicitações de Exame"
          });

        return res.send({
          solicitacoesDeExame,
          page,
          pageSize: limitPerPage,
          numberOfResults: count
        });
      });
    })
    .catch(err => {
      return res.status(500).send({
        message: err.message || "Erro ao buscar lista de Solicitações de Exame"
      });
    });
};

exports.findOne = (req, res) => {
  SolicitacaoDeExame.findById(req.params.solicitacaoDeExameId)
    .populate("idMedico", "nome cpf")
    .populate("idPaciente", "nome cpf")
    .then(solicitacaoDeExame => {
      if (solicitacaoDeExame) return res.send({ solicitacaoDeExame });

      return res.status(404).send({
        message: "Solicitação de Exame não encontrada"
      });
    })
    .catch(err => {
      if (err.kind === "ObjectId")
        return res.status(404).send({
          message: "Solicitação de Exame não encontrada"
        });

      return res.status(500).send({
        message: "Erro ao buscar Solicitação de Exame"
      });
    });
};

exports.examTypeList = (req, res) => {
  try {
    return res.send({
      listaDeTiposDeExame: examTypeList.examTypeList
    });
  } catch (error) {
    return res.status(500).send({
      message: err.message || "Erro ao buscar lista de tipos de Exame"
    });
  }
};

exports.saveExamResult = (req, res) => {
  if (!req.files || Object.keys(req.files).length === 0)
    return res.status(400).send({
      message: "Nenhum Resultado de Exame foi enviado."
    });

  var arquivoResultadoExame = req.files.arquivoResultadoExame;

  var extensaoArquivo =
    "." +
    arquivoResultadoExame.name.split(".")[
      arquivoResultadoExame.name.split(".").length - 1
    ];

  var nomeArquivo = arquivoResultadoExame.name.split(extensaoArquivo)[0];

  var novoNomeArquivoResultado =
    nomeArquivo + "_" + req.params.solicitacaoDeExameId + extensaoArquivo;

  arquivoResultadoExame.mv(
    path.join(
      __dirname,
      "../../files/resultadosDeExames",
      novoNomeArquivoResultado
    ),
    err => {
      if (err)
        return res.status(500).send({
          message: "Erro ao enviar Resultado de Exame"
        });

      SolicitacaoDeExame.findByIdAndUpdate(req.params.solicitacaoDeExameId, {
        nomeArquivoResultado: novoNomeArquivoResultado
      })
        .then(medico => {
          if (medico)
            return res.send({
              message: "Resultado de Exame enviado com sucesso"
            });

          return res.status(404).send({
            message: "Solicitação de Exame não encontrada"
          });
        })
        .catch(err => {
          if (err.kind === "ObjectId")
            return res.status(404).send({
              message: "Solicitação de Exame não encontrada"
            });

          return res.status(500).send({
            message: "Erro ao enviar Resultado de Exame"
          });
        });
    }
  );
};

exports.getExamResult = (req, res) => {
  SolicitacaoDeExame.findById(req.params.solicitacaoDeExameId)
    .then(solicitacaoDeExame => {
      if (solicitacaoDeExame && solicitacaoDeExame.nomeArquivoResultado)
        return res.sendFile(
          path.join(
            __dirname,
            "../../files/resultadosDeExames",
            solicitacaoDeExame.nomeArquivoResultado
          )
        );

      return res.status(404).send({
        message: "Solicitação de Exame não encontrada"
      });
    })
    .catch(err => {
      if (err.kind === "ObjectId")
        return res.status(404).send({
          message: "Solicitação de Exame não encontrada"
        });

      return res.status(500).send({
        message: "Erro ao salvar Resultado de Exame"
      });
    });
};
