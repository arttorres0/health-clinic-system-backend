const mongoose = require('mongoose');
const Joi = require('@hapi/joi');

const ConvenioSchema = mongoose.Schema(
    {
        nome : String,
        ativo : Boolean
    },
    {
        timestamps: true
    }
);

ConvenioSchema.statics.joiValidate = (obj) => {
	return Joi.object(
        {
            nome : Joi.string().required(),
            ativo: Joi.boolean().required()
    	}).validate(obj);
}

module.exports = mongoose.model('Convenio', ConvenioSchema);