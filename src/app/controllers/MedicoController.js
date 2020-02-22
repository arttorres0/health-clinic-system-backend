const Medico = require('../models/Medico.js');

//ONLY ADMIN
exports.create = (req, res) => {
    Medico.findOne( { $or: [{ cpf : req.body.cpf }, { login : req.body.login }] } )
        .then(medicoExistente => {
            if(medicoExistente){
                return res.status(409).send(
                    {message: "Médico de CPF " + req.body.cpf + " e/ou login " + req.body.login + " já existente"}
                );
            
            } else{
                const data = {
                    nome : req.body.nome,
                    login : req.body.login,
                    senha : req.body.senha,
                    cpf : req.body.cpf,
                    email : req.body.email,
                    telefone : req.body.telefone,
                    crm : req.body.crm,
                    dataDeNascimento : new Date(req.body.dataDeNascimento),
                    dataDeAdmissão : new Date(req.body.dataDeAdmissão),
                    ativo : true
                }

                var validationError = Medico.joiValidate(data);

                if(validationError.error) return res.status(400).send({
                    message: validationError.error.details[0].message || "Erro nos dados do Médico."
                });
            
                const medico = new Medico(data);

                medico.save()
                .then(data => {
                    res.send(data);
                }).catch(err => {
                    res.status(500).send({
                        message: err.message || "Erro ao gravar Médico."
                    });
                });
            }
        })
};

exports.findAll = (req, res) => {
    var filter = req.body.filter || "";
    var page = req.body.page || 1;
    var limitPerPage = 10;

    Medico.find({ nome : { $regex : filter } })
        .sort({ nome : 1 })
        .skip((limitPerPage*page) - limitPerPage)
        .limit(limitPerPage)
        .then(medicos => {

            //TODO: skip this is if logged in user is ADMIN
            medicos.map((medico) => {
                medico.login = undefined;
                medico.senha = undefined;
                return medico;
            });

            res.send({
                medicos,
                page
            });
        }).catch(err => {
            res.status(500).send({
                message: err.message || "Erro ao buscar lista de medicos."
            });
        });
};

exports.findOne = (req, res) => {
    Medico.findById(req.params.medicoId)
    .then(medico => {
        if(medico){
            //TODO: only returns this values if logged in user is ADMIN
            medico.login = undefined;
            medico.senha = undefined;
            return res.send(medico);
        }
    }).catch(err => {
        if(err.kind === 'ObjectId') {
            return res.status(404).send({
                message: "Medico não encontrado com id " + req.params.medicoId
            });                
        }
        return res.status(500).send({
            message: "Erro ao buscar médico com id " + req.params.medicoId
        });
    });
};

//ONLY ADMIN
exports.update = (req, res) => {
    var validationError = Medico.joiValidate(req.body);

    if(validationError.error) return res.status(400).send({
        message: validationError.error.details[0].message || "Erro nos dados do Médico."
    });

    Medico.findByIdAndUpdate(req.params.medicoId, req.body, {new: true})
    .then(note => {
        if(note) res.send(note);
    }).catch(err => {
        console.log(err);
        if(err.kind === 'ObjectId') {
            return res.status(404).send({
                message: "Médico não encontrado com id " + req.params.medicoId
            });                
        }
        return res.status(500).send({
            message: "Erro ao atualizar Médico com id " + req.params.medicoId
        });
    });
};

//ONLY ADMIN
exports.inactivate = (req, res) => {
    Medico.findByIdAndUpdate(req.params.medicoId, { ativo : false })
    .then(medico => {
        if(medico) res.send({message: "Médico inativado com sucesso"});
    }).catch(err => {
        if(err.kind === 'ObjectId' || err.name === 'NotFound') {
            return res.status(404).send({
                message: "Médico não encontrado com id " + req.params.medicoId
            });                
        }
        return res.status(500).send({
            message: "Erro ao inativar médico com id " + req.params.medicoId
        });
    });
};

//ONLY ADMIN
exports.activate = (req, res) => {
    Medico.findByIdAndUpdate(req.params.medicoId, { ativo : true })
    .then(medico => {
        if(medico) res.send({message: "Médico ativado com sucesso"});
    }).catch(err => {
        if(err.kind === 'ObjectId' || err.name === 'NotFound') {
            return res.status(404).send({
                message: "Médico não encontrado com id " + req.params.medicoId
            });                
        }
        return res.status(500).send({
            message: "Erro ao ativar médico com id " + req.params.medicoId
        });
    });
};