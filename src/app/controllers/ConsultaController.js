const Consulta = require("../models/Consulta");
const {
  idPacienteIsValid,
  idMedicoIsValid,
  idConvenioIsValid,
  medicoHasConsultaAtSameTime,
  pacienteHasConsultaAtSameTime
} = require("../helper/DatabaseFunctions");

exports.create = async (req, res) => {
  const consultaReqInfo = {
    idPaciente: req.body.idPaciente,
    idMedico: req.body.idMedico,
    data: req.body.data,
    hora: req.body.hora,
    status: "AGENDADA",
    tipo: req.body.tipo
  };

  if (consultaReqInfo.tipo === "CONVENIO")
    consultaReqInfo.idConvenio = req.body.idConvenio;

  var validationError = Consulta.joiValidate(consultaReqInfo);

  if (validationError.error)
    return res.status(400).send({
      message: validationError.error.details[0].message
        ? "Formato inválido do campo " +
          validationError.error.details[0].context.key
        : "Erro nos dados da Consulta"
    });

  if (!(await idMedicoIsValid(consultaReqInfo.idMedico)))
    return res.status(400).send({
      message: "Médico não encontrado ou inativo"
    });

  if (!(await idPacienteIsValid(consultaReqInfo.idPaciente)))
    return res.status(400).send({
      message: "Paciente não encontrado ou inativo"
    });

  if (
    consultaReqInfo.tipo === "CONVENIO" &&
    !(await idConvenioIsValid(consultaReqInfo.idConvenio))
  )
    return res.status(400).send({
      message: "Convênio não encontrado ou inativo"
    });

  if (
    await medicoHasConsultaAtSameTime(
      consultaReqInfo.idMedico,
      consultaReqInfo.data,
      consultaReqInfo.hora
    )
  )
    return res.status(400).send({
      message: "Médico já possui consulta agendada para data e hora informadas"
    });

  if (
    await pacienteHasConsultaAtSameTime(
      consultaReqInfo.idPaciente,
      consultaReqInfo.data,
      consultaReqInfo.hora
    )
  )
    return res.status(400).send({
      message:
        "Paciente já possui consulta agendada para data e hora informadas"
    });

  const consulta = new Consulta(consultaReqInfo);

  consulta
    .save()
    .then(consulta => {
      return res.send(consulta);
    })
    .catch(err => {
      return res.status(500).send({
        message: err.message || "Erro ao gravar Consulta"
      });
    });
};

exports.findAll = (req, res) => {
  var page = req.body.page || 1;
  var limitPerPage = 10;

  var query = {};

  req.body.idPaciente ? (query.idPaciente = req.body.idPaciente) : undefined;
  req.body.idMedico ? (query.idMedico = req.body.idMedico) : undefined;
  req.body.data ? (query.data = req.body.data) : undefined;

  Consulta.find(query)
    .sort({ nome: 1 })
    .skip(limitPerPage * page - limitPerPage)
    .limit(limitPerPage)
    .then(consultas => {
      Consulta.count(query).exec((error, count) => {
        if (error)
          return res.status(500).send({
            message: err.message || "Erro ao buscar lista de Consultas"
          });

        return res.send({
          consultas,
          page,
          numberOfPages: Math.ceil(count / limitPerPage),
          numberOfResults: count
        });
      });
    })
    .catch(err => {
      return res.status(500).send({
        message: err.message || "Erro ao buscar lista de Consultas"
      });
    });
};

exports.findOne = (req, res) => {
  Consulta.findById(req.params.consultaId)
    .then(consulta => {
      if (consulta) return res.send(consulta);

      return res.status(404).send({
        message: "Consulta não encontrada"
      });
    })
    .catch(err => {
      if (err.kind === "ObjectId")
        return res.status(404).send({
          message: "Consulta não encontrada"
        });

      return res.status(500).send({
        message: "Erro ao buscar Consulta"
      });
    });
};

exports.update = async (req, res) => {
  var validationError = Consulta.joiValidate(req.body);

  if (validationError.error)
    return res.status(400).send({
      message: validationError.error.details[0].message
        ? "Formato inválido do campo " +
          validationError.error.details[0].context.key
        : "Erro nos dados do Consulta"
    });

  if (!(await idMedicoIsValid(req.body.idMedico)))
    return res.status(400).send({
      message: "Médico não encontrado ou inativo"
    });

  if (!(await idPacienteIsValid(req.body.idPaciente)))
    return res.status(400).send({
      message: "Paciente não encontrado ou inativo"
    });

  if (
    req.body.tipo === "CONVENIO" &&
    !(await idConvenioIsValid(req.body.idConvenio))
  )
    return res.status(400).send({
      message: "Convênio não encontrado ou inativo"
    });

  if (
    await medicoHasConsultaAtSameTime(
      req.body.idMedico,
      req.body.data,
      req.body.hora,
      req.params.consultaId
    )
  )
    return res.status(400).send({
      message: "Médico já possui consulta agendada para data e hora informadas"
    });

  if (
    await pacienteHasConsultaAtSameTime(
      req.body.idPaciente,
      req.body.data,
      req.body.hora,
      req.params.consultaId
    )
  )
    return res.status(400).send({
      message:
        "Paciente já possui consulta agendada para data e hora informadas"
    });

  Consulta.findOneAndUpdate(
    { _id: req.params.consultaId, status: "AGENDADA" },
    req.body,
    { new: true }
  )
    .then(consulta => {
      if (consulta) return res.send(consulta);

      return res.status(404).send({
        message: "Consulta não encontrada ou com status Confirmada"
      });
    })
    .catch(err => {
      if (err.kind === "ObjectId")
        return res.status(404).send({
          message: "Consulta não encontrada ou com status Confirmada"
        });

      return res.status(500).send({
        message: "Erro ao atualizar Consulta"
      });
    });
};

exports.delete = (req, res) => {
  Consulta.findOneAndDelete({ _id: req.params.consultaId, status: "AGENDADA" })
    .then(consulta => {
      if (consulta)
        return res.send({
          message: "Consulta deletada com sucesso"
        });

      return res.status(404).send({
        message: "Consulta não encontrada ou com status Confirmada"
      });
    })
    .catch(err => {
      return res.status(500).send({
        message: "Erro ao deletar Consulta"
      });
    });
};
