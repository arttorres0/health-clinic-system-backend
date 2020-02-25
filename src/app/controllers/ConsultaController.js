const Consulta = require('../models/Consulta');
const {idPacienteIsValid, idMedicoIsValid, idConvenioIsValid, medicoHasConsultaAtSameTime, pacienteHasConsultaAtSameTime} = require('./HelperFunctions');

exports.create = async (req, res) => {
    const data = {
        idPaciente : req.body.idPaciente,
        idMedico : req.body.idMedico,
        date : req.body.date,
        hour : req.body.hour,
        status : "AGENDADA",
        tipo : req.body.tipo
    }

    if(data.tipo === "CONVENIO") data.idConvenio = req.body.idConvenio;

    var validationError = Consulta.joiValidate(data);

    if(validationError.error) return res.status(400).send({
        message: validationError.error.details[0].message ? "Formato inválido do campo " + validationError.error.details[0].context.key : "Erro nos dados da Consulta"
    });

    if(!await idMedicoIsValid(data.idMedico)) return res.status(400).send({
        message: "Médico não encontrado ou inativo"
    });

    if(!await idPacienteIsValid(data.idPaciente)) return res.status(400).send({
        message: "Paciente não encontrado ou inativo"
    });

    if(data.tipo === "CONVENIO" && !await idConvenioIsValid(data.idConvenio)) return res.status(400).send({
        message: "Convênio não encontrado ou inativo"
    });

    if(await medicoHasConsultaAtSameTime(data.idMedico, data.date, data.hour)) return res.status(400).send({
        message: "Médico já possui consulta agendada para data e hora informadas"
    });

    if(await pacienteHasConsultaAtSameTime(data.idPaciente, data.date, data.hour)) return res.status(400).send({
        message: "Paciente já possui consulta agendada para data e hora informadas"
    });

    const consulta = new Consulta(data);

    consulta.save()
        .then(data => {
            return res.send(data);
        
        }).catch(err => {
            return res.status(500).send({
                message: err.message || "Erro ao gravar Consulta"
            });
        });
};

exports.findAll = (req, res) => {
    var page = req.body.page || 1;
    var limitPerPage = 10;

    var query = {};

    req.body.idPaciente ? query.idPaciente = req.body.idPaciente : undefined;
    req.body.idMedico ? query.idMedico = req.body.idMedico : undefined;
    req.body.date ? query.date = req.body.date : undefined;

    Consulta.find( query )
        .sort({ nome : 1 })
        .skip((limitPerPage*page) - limitPerPage)
        .limit(limitPerPage)
        .then(consultas => {
            Consulta.count( query ).exec((error, count) => {
                if(error) return res.status(500).send({
                    message: err.message || "Erro ao buscar lista de Consultas"
                });

                return res.send({
                    consultas,
                    page,
                    numberOfPages : Math.ceil(count/limitPerPage),
                    numberOfResults : count
                });
            })
  
        }).catch(err => {
            return res.status(500).send({
                message: err.message || "Erro ao buscar lista de Consultas"
            });
        });
};

exports.findOne = (req, res) => {
    Consulta.findById(req.params.consultaId)
        .then(consulta => {
            if(consulta) return res.send(consulta);

            return res.status(404).send({
                message: "Consulta não encontrada"
            });

        }).catch(err => {
            if(err.kind === 'ObjectId') return res.status(404).send({
                message: "Consulta não encontrada"
            });

            return res.status(500).send({
                message: "Erro ao buscar Consulta"
            });
        });
};

exports.update = async (req, res) => {
    var validationError = Consulta.joiValidate(req.body);

    if(validationError.error) return res.status(400).send({
        message: validationError.error.details[0].message ? "Formato inválido do campo " + validationError.error.details[0].context.key : "Erro nos dados do Consulta"
    });

    if(!await idMedicoIsValid(req.body.idMedico)) return res.status(400).send({
        message: "Médico não encontrado ou inativo"
    });

    if(!await idPacienteIsValid(req.body.idPaciente)) return res.status(400).send({
        message: "Paciente não encontrado ou inativo"
    });

    if(req.body.tipo === "CONVENIO" && !await idConvenioIsValid(req.body.idConvenio)) return res.status(400).send({
        message: "Convênio não encontrado ou inativo"
    });

    if(await medicoHasConsultaAtSameTime(req.body.idMedico, req.body.date, req.body.hour, req.params.consultaId)) return res.status(400).send({
        message: "Médico já possui consulta agendada para data e hora informadas"
    });

    if(await pacienteHasConsultaAtSameTime(req.body.idPaciente, req.body.date, req.body.hour, req.params.consultaId)) return res.status(400).send({
        message: "Paciente já possui consulta agendada para data e hora informadas"
    });

    Consulta.findOneAndUpdate({_id : req.params.consultaId, status : "AGENDADA"}, req.body, {new: true})
        .then(consulta => {
            if(consulta) return res.send(consulta);

            return res.status(404).send({
                message: "Consulta não encontrada ou com status Confirmada"
            });

        }).catch(err => {
            if(err.kind === 'ObjectId') return res.status(404).send({
                message: "Consulta não encontrada ou com status Confirmada"
            });

            return res.status(500).send({
                message: "Erro ao atualizar Consulta"
            });
        });
};

exports.delete = (req, res) => {
    Consulta.findOneAndDelete({_id : req.params.consultaId, status : "AGENDADA"})
        .then(consulta => {
            if(consulta) return res.send({
                message: "Consulta deletada com sucesso"
            });

            return res.status(404).send({
                message: "Consulta não encontrada ou com status Confirmada"
            });
        })
        .catch(err => {
            return res.status(500).send({
                message: "Erro ao deletar Consulta"
            });
        });
};