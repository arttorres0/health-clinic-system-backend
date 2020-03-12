const mongoose = require("mongoose");
const Joi = require("@hapi/joi").extend(require("@hapi/joi-date"));

const ConsultaSchema = mongoose.Schema(
  {
    idPaciente: { type: mongoose.Types.ObjectId, ref: "Paciente" },
    idMedico: { type: mongoose.Types.ObjectId, ref: "Medico" },
    data: String,
    hora: Number,
    status: String,
    tipo: String,
    idConvenio: { type: mongoose.Types.ObjectId, ref: "Convenio" }
  },
  {
    timestamps: true
  }
);

ConsultaSchema.statics.joiValidate = obj => {
  return Joi.object({
    idPaciente: Joi.string()
      .alphanum()
      .length(24)
      .required(),
    idMedico: Joi.string()
      .alphanum()
      .length(24)
      .required(),
    data: Joi.date()
      .format("YYYY-MM-DD")
      .required(),
    hora: Joi.number()
      .integer()
      .min(8)
      .max(18)
      .required(),
    status: Joi.string()
      .valid("AGENDADA", "CONFIRMADA")
      .required(),
    tipo: Joi.string()
      .valid("PARTICULAR", "CONVENIO", "RETORNO")
      .required(),
    idConvenio: Joi.when("tipo", {
      is: Joi.valid("CONVENIO"),
      then: Joi.string()
        .alphanum()
        .length(24)
        .required(),
      otherwise: Joi.forbidden()
    })
  }).validate(obj);
};

module.exports = mongoose.model("Consulta", ConsultaSchema);
