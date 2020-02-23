const mongoose = require('mongoose');
const Joi = require('@hapi/joi');

const PacienteSchema = mongoose.Schema(
    {
        nome : String,
        cpf : { type: String, unique : true },
        email : String,
        telefone : String,
        dataDeNascimento : Date,
        ativo : Boolean
    },
    {
        timestamps: true
    }
);

PacienteSchema.statics.joiValidate = (obj) => {
	return Joi.object(
        {
            nome : Joi.string().required(),
            cpf : Joi.string().regex(/^\d+$/).length(11).required(),
            email : Joi.string().email().required(),
            telefone : Joi.string().regex(/^\d+$/).required(),
            dataDeNascimento : Joi.date().required(),
            ativo: Joi.boolean().required()
    	}).validate(obj);
}

module.exports = mongoose.model('Paciente', PacienteSchema);