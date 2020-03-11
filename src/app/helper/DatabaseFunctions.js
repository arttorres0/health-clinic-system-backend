const Recepcionista = require("../models/Recepcionista");
const Medico = require("../models/Medico");
const Paciente = require("../models/Paciente");
const Convenio = require("../models/Convenio");
const Medicamento = require("../models/Medicamento");
const Consulta = require("../models/Consulta");

exports.loginAlreadyExistsForAdminOrRecepcionista = async login => {
  try {
    var adminLogin = require("../auth/AdminCredentials.json").adminLogin;
    if (login === adminLogin) return true;

    var result = await Recepcionista.findOne({ login: login });
    if (result) return true;
    return false;
  } catch (error) {
    console.log(error);
    return true;
  }
};

exports.loginAlreadyExistsForAdminOrMedico = async login => {
  try {
    var adminLogin = require("../auth/AdminCredentials.json").adminLogin;
    if (login === adminLogin) return true;

    var result = await Medico.findOne({ login: login });
    if (result) return true;
    return false;
  } catch (error) {
    console.log(error);
    return true;
  }
};

exports.loginAlreadyExistsForMedicoOrRecepcionista = async login => {
  try {
    var result = await Medico.findOne({ login: login });
    if (result) return true;

    var result = await Recepcionista.findOne({ login: login });
    if (result) return true;
    return false;
  } catch (error) {
    console.log(error);
    return true;
  }
};

exports.idPacienteIsValid = async idPaciente => {
  try {
    var foundPaciente = await Paciente.find({ _id: idPaciente, ativo: true });
    if (foundPaciente) return true;
    return false;
  } catch (error) {
    console.log(error);
    return false;
  }
};

exports.idMedicoIsValid = async idMedico => {
  try {
    var foundMedico = await Medico.findOne({ _id: idMedico, ativo: true });
    if (foundMedico) return true;
    return false;
  } catch (error) {
    console.log(error);
    return false;
  }
};

exports.idConvenioIsValid = async idConvenio => {
  try {
    var foundConvenio = await Convenio.findOne({
      _id: idConvenio,
      ativo: true
    });
    if (foundConvenio) return true;
    return false;
  } catch (error) {
    console.log(error);
    return false;
  }
};

exports.idMedicamentoIsValid = async idMedicamento => {
  try {
    var foundMedicamento = await Medicamento.findOne({
      _id: idMedicamento,
      ativo: true
    });
    if (foundMedicamento) return true;
    return false;
  } catch (error) {
    console.log(error);
    return false;
  }
};

exports.medicoHasConsultaAtSameTime = async (
  idMedico,
  data,
  hora,
  idConsulta = null
) => {
  try {
    if (idConsulta) {
      var foundConsultaMedico = await Consulta.findOne({
        idMedico,
        data,
        hora,
        _id: { $ne: idConsulta }
      });
    } else {
      var foundConsultaMedico = await Consulta.findOne({
        idMedico,
        data,
        hora
      });
    }

    if (foundConsultaMedico) return true;
    return false;
  } catch (error) {
    console.log(error);
    return true;
  }
};

exports.pacienteHasConsultaAtSameTime = async (
  idPaciente,
  data,
  hora,
  idConsulta = null
) => {
  try {
    if (idConsulta) {
      var foundConsultaPaciente = await Consulta.findOne({
        idPaciente,
        data,
        hora,
        _id: { $ne: idConsulta }
      });
    } else {
      var foundConsultaPaciente = await Consulta.findOne({
        idPaciente,
        data,
        hora
      });
    }

    if (foundConsultaPaciente) return true;
    return false;
  } catch (error) {
    console.log(error);
    return true;
  }
};
