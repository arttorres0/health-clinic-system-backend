const mongoose = require('mongoose');
const Joi = require('@hapi/joi');

const MedicoSchema = mongoose.Schema(
    {
        nome : String,
        login : { type: String, unique : true },
        senha : String,
        cpf : { type: String, unique : true },
        email : String,
        telefone : String,
        crm : { type: String, unique : true },
        dataDeNascimento : Date,
        dataDeAdmissão : Date,
        ativo : Boolean
    },
    {
        timestamps: true
    }
);

MedicoSchema.statics.joiValidate = (obj) => {
	return Joi.object(
        {
            nome : Joi.string().required(),
            login : Joi.string().required(),
            senha : Joi.string().required(),
            cpf : Joi.string().regex(/^\d+$/).length(11).required(),
            email : Joi.string().email().required(),
            telefone : Joi.string().regex(/^\d+$/).required(),
            crm : Joi.string().regex(/^[0-9]*-[A-Z]{2}/).required(),
            dataDeNascimento : Joi.date().required(),
            dataDeAdmissão : Joi.date().required(),
            ativo: Joi.boolean().required()
    	}).validate(obj);
}

module.exports = mongoose.model('Medico', MedicoSchema);