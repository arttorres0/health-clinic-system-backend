const mongoose = require("mongoose");
const Joi = require("@hapi/joi").extend(require("@hapi/joi-date"));

const ReceitaDeMedicamentoSchema = mongoose.Schema(
  {
    idPaciente: { type: mongoose.Types.ObjectId, ref: "Paciente" },
    idMedico: { type: mongoose.Types.ObjectId, ref: "Medico" },
    data: String,
    idMedicamento: { type: mongoose.Types.ObjectId, ref: "Medicamento" },
    observacao: String
  },
  {
    timestamps: true
  }
);

ReceitaDeMedicamentoSchema.statics.joiValidate = obj => {
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
    idMedicamento: Joi.string()
      .alphanum()
      .length(24)
      .required(),
    observacao: Joi.string()
  }).validate(obj);
};

module.exports = mongoose.model(
  "ReceitaDeMedicamento",
  ReceitaDeMedicamentoSchema
);
