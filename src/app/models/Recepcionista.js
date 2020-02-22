const mongoose = require('mongoose');
const Joi = require('@hapi/joi');

const RecepcionistaSchema = mongoose.Schema(
    {
        nome : String,
        login : String,
        senha : String,
        cpf : String,
        email : String,
        telefone : String,
        dataDeNascimento : Date,
        dataDeAdmissão : Date,
        ativo : Boolean
    },
    {
        timestamps: true
    }
);

RecepcionistaSchema.statics.joiValidate = (obj) => {
	return Joi.object(
        {
            nome : Joi.string().required(),
            login : Joi.string().required(),
            senha : Joi.string().required(),
            cpf : Joi.string().regex(/^\d+$/).length(11).required(),
            email : Joi.string().email().required(),
            telefone : Joi.string().regex(/^\d+$/).required(),
            dataDeNascimento : Joi.date().required(),
            dataDeAdmissão : Joi.date().required(),
            ativo: Joi.boolean().required()
    	}).validate(obj);
}

module.exports = mongoose.model('Recepcionista', RecepcionistaSchema);