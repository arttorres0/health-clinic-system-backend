const ReceitaDeMedicamento = require('../models/ReceitaDeMedicamento');
const {idPacienteIsValid, idMedicoIsValid, idMedicamentoIsValid} = require('./HelperFunctions');

exports.create = async (req, res) => {
    const data = {
        idPaciente : req.body.idPaciente,
        idMedico : req.body.idMedico,
        date : req.body.date,
        idMedicamento : req.body.idMedicamento,
    }

    if(req.body.observacao) data.observacao = req.body.observacao;

    var validationError = ReceitaDeMedicamento.joiValidate(data);

    if(validationError.error) return res.status(400).send({
        message: validationError.error.details[0].message ? "Formato inválido do campo " + validationError.error.details[0].context.key : "Erro nos dados da Receita de Medicamento"
    });

    if(!await idMedicoIsValid(data.idMedico)) return res.status(400).send({
        message: "Médico não encontrado ou inativo"
    });

    if(!await idPacienteIsValid(data.idPaciente)) return res.status(400).send({
        message: "Paciente não encontrado ou inativo"
    });

    if(!await idMedicamentoIsValid(data.idMedicamento)) return res.status(400).send({
        message: "Medicamento não encontrado ou inativo"
    });

    const receitaDeMedicamento = new ReceitaDeMedicamento(data);

    receitaDeMedicamento.save()
        .then(data => {
            return res.send(data);
        
        }).catch(err => {
            return res.status(500).send({
                message: err.message || "Erro ao gravar Receita de Medicamento"
            });
        });
};

exports.findAll = (req, res) => {
    var page = req.body.page || 1;
    var limitPerPage = 10;

    var query = {};

    req.body.idPaciente ? query.idPaciente = req.body.idPaciente : undefined;
    req.body.idMedico ? query.idMedico = req.body.idMedico : undefined;
    req.body.idMedicamento ? query.idMedicamento = req.body.idMedicamento : undefined;
    req.body.date ? query.date = req.body.date : undefined;

    ReceitaDeMedicamento.find( query )
        .sort({ nome : 1 })
        .skip((limitPerPage*page) - limitPerPage)
        .limit(limitPerPage)
        .then(receitasDeMedicamento => {
            ReceitaDeMedicamento.count( query ).exec((error, count) => {
                if(error) return res.status(500).send({
                    message: err.message || "Erro ao buscar lista de Receitas de Medicamento"
                });

                return res.send({
                    receitasDeMedicamento,
                    page,
                    numberOfPages : Math.ceil(count/limitPerPage),
                    numberOfResults : count
                });
            })
  
        }).catch(err => {
            return res.status(500).send({
                message: err.message || "Erro ao buscar lista de Receitas de Medicamento"
            });
        });
};

exports.findOne = (req, res) => {
    ReceitaDeMedicamento.findById(req.params.receitaDeMedicamentoId)
        .then(receitaDeMedicamento => {
            if(receitaDeMedicamento) return res.send(receitaDeMedicamento);

            return res.status(404).send({
                message: "Receita de Medicamento não encontrada"
            });

        }).catch(err => {
            if(err.kind === 'ObjectId') return res.status(404).send({
                message: "Receita de Medicamento não encontrada"
            });

            return res.status(500).send({
                message: "Erro ao buscar Receita de Medicamento"
            });
        });
};