const Paciente = require('../models/Paciente.js');

//ONLY ADMIN
exports.create = (req, res) => {
    Paciente.findOne( { cpf : req.body.cpf } )
        .then(pacienteExistente => {
            if(pacienteExistente){
                return res.status(409).send(
                    {message: "Paciente de CPF " + req.body.cpf + " já existente"}
                );
            
            } else{
                const data = {
                    nome : req.body.nome,
                    cpf : req.body.cpf,
                    email : req.body.email,
                    telefone : req.body.telefone,
                    dataDeNascimento : new Date(req.body.dataDeNascimento),
                    ativo : true
                }

                var validationError = Paciente.joiValidate(data);

                if(validationError.error) return res.status(400).send({
                    message: validationError.error.details[0].message || "Erro nos dados do Paciente."
                });
            
                const paciente = new Paciente(data);

                paciente.save()
                .then(data => {
                    res.send(data);
                }).catch(err => {
                    res.status(500).send({
                        message: err.message || "Erro ao gravar Paciente."
                    });
                });
            }
        })
};

exports.findAll = (req, res) => {
    var filter = req.body.filter || "";
    var page = req.body.page || 1;
    var limitPerPage = 10;

    Paciente.find({ nome : { $regex : filter } })
        .sort({ nome : 1 })
        .skip((limitPerPage*page) - limitPerPage)
        .limit(limitPerPage)
        .then(pacientes => {
            res.send({
                pacientes,
                page
            });
        }).catch(err => {
            res.status(500).send({
                message: err.message || "Erro ao buscar lista de pacientes."
            });
        });
};

exports.findOne = (req, res) => {
    Paciente.findById(req.params.pacienteId)
    .then(paciente => {
        if(paciente) return res.send(paciente);
    }).catch(err => {
        if(err.kind === 'ObjectId') {
            return res.status(404).send({
                message: "Paciente não encontrado com id " + req.params.pacienteId
            });                
        }
        return res.status(500).send({
            message: "Erro ao buscar médico com id " + req.params.pacienteId
        });
    });
};

//ONLY ADMIN
exports.update = (req, res) => {
    var validationError = Paciente.joiValidate(req.body);

    if(validationError.error) return res.status(400).send({
        message: validationError.error.details[0].message || "Erro nos dados do Paciente."
    });

    Paciente.findByIdAndUpdate(req.params.pacienteId, req.body, {new: true})
    .then(note => {
        if(note) res.send(note);
    }).catch(err => {
        console.log(err);
        if(err.kind === 'ObjectId') {
            return res.status(404).send({
                message: "Paciente não encontrado com id " + req.params.pacienteId
            });                
        }
        return res.status(500).send({
            message: "Erro ao atualizar Paciente com id " + req.params.pacienteId
        });
    });
};

//ONLY ADMIN
exports.inactivate = (req, res) => {
    Paciente.findByIdAndUpdate(req.params.pacienteId, { ativo : false })
    .then(paciente => {
        if(paciente) res.send({message: "Paciente inativado com sucesso"});
    }).catch(err => {
        if(err.kind === 'ObjectId' || err.name === 'NotFound') {
            return res.status(404).send({
                message: "Paciente não encontrado com id " + req.params.pacienteId
            });                
        }
        return res.status(500).send({
            message: "Erro ao inativar médico com id " + req.params.pacienteId
        });
    });
};

//ONLY ADMIN
exports.activate = (req, res) => {
    Paciente.findByIdAndUpdate(req.params.pacienteId, { ativo : true })
    .then(paciente => {
        if(paciente) res.send({message: "Paciente ativado com sucesso"});
    }).catch(err => {
        if(err.kind === 'ObjectId' || err.name === 'NotFound') {
            return res.status(404).send({
                message: "Paciente não encontrado com id " + req.params.pacienteId
            });                
        }
        return res.status(500).send({
            message: "Erro ao ativar médico com id " + req.params.pacienteId
        });
    });
};