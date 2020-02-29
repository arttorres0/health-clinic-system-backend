const mongoose = require("mongoose");
const Joi = require("@hapi/joi");

const MedicamentoSchema = mongoose.Schema(
  {
    nomeGenerico: { type: String, unique: true },
    nomeDeFabrica: { type: String, unique: true },
    fabricante: String,
    ativo: Boolean
  },
  {
    timestamps: true
  }
);

MedicamentoSchema.statics.joiValidate = obj => {
  return Joi.object({
    nomeGenerico: Joi.string().required(),
    nomeDeFabrica: Joi.string().required(),
    fabricante: Joi.string().required(),
    ativo: Joi.boolean().required()
  }).validate(obj);
};

module.exports = mongoose.model("Medicamento", MedicamentoSchema);
