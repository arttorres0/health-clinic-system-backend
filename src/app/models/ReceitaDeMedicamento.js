const mongoose = require('mongoose');
const Joi = require('@hapi/joi');

const ReceitaDeMedicamentoSchema = mongoose.Schema(
    {
        idPaciente : mongoose.Types.ObjectId,
        idMedico : mongoose.Types.ObjectId,
        date : Date,
        idMedicamento : mongoose.Types.ObjectId,
        observacao : String
    },
    {
        timestamps: true
    }
);

ReceitaDeMedicamentoSchema.statics.joiValidate = (obj) => {
	return Joi.object(
        {
            idPaciente : Joi.string().alphanum().length(24).required(),
            idMedico : Joi.string().alphanum().length(24).required(),
            date : Joi.date().required(),
            idMedicamento : Joi.string().alphanum().length(24).required(),
            observacao: Joi.string()
    	}).validate(obj);
}

module.exports = mongoose.model('ReceitaDeMedicamento', ReceitaDeMedicamentoSchema);