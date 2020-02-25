const mongoose = require('mongoose');
const Joi = require('@hapi/joi');

const ConsultaSchema = mongoose.Schema(
    {
        idPaciente : mongoose.Types.ObjectId,
        idMedico : mongoose.Types.ObjectId,
        date : Date,
        hour : Number,
        status : String,
        tipo : String,
        idConvenio : mongoose.Types.ObjectId
    },
    {
        timestamps: true
    }
);

ConsultaSchema.statics.joiValidate = (obj) => {
	return Joi.object(
        {
            idPaciente : Joi.string().alphanum().length(24).required(),
            idMedico : Joi.string().alphanum().length(24).required(),
            date : Joi.date().required(),
            hour : Joi.number().integer().min(8).max(18).required(),
            status : Joi.string().valid("AGENDADA", "CONFIRMADA").required(),
            tipo : Joi.string().valid("PARTICULAR", "CONVENIO", "RETORNO").required(),
            idConvenio : Joi.when('tipo', {
                is : Joi.valid("CONVENIO"),
                then : Joi.string().alphanum().length(24).required(),
                otherwise : Joi.forbidden()
            })
    	}).validate(obj);
}

module.exports = mongoose.model('Consulta', ConsultaSchema);