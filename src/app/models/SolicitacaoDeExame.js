const mongoose = require("mongoose");
const Joi = require("@hapi/joi").extend(require("@hapi/joi-date"));
const { examTypeList } = require("../models/ListaDeExames");

const SolicitacaoDeExameSchema = mongoose.Schema(
  {
    idPaciente: { type: mongoose.Types.ObjectId, ref: "Paciente" },
    idMedico: { type: mongoose.Types.ObjectId, ref: "Medico" },
    data: String,
    exames: [{ type: String }],
    nomeArquivoResultado: String,
    observacao: String
  },
  {
    timestamps: true
  }
);

SolicitacaoDeExameSchema.statics.joiValidate = obj => {
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
    exames: Joi.array().items(
      Joi.string()
        .valid(...examTypeList)
        .required()
    ),
    nomeArquivoResultado: Joi.string(),
    observacao: Joi.string()
  }).validate(obj);
};

module.exports = mongoose.model("SolicitacaoDeExame", SolicitacaoDeExameSchema);
