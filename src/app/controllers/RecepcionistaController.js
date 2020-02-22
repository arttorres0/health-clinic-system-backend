const Recepcionista = require('../models/Recepcionista.js');

//ONLY ADMIN
exports.create = (req, res) => {
    Recepcionista.findOne( { $or: [{ cpf : req.body.cpf }, { login : req.body.login }] } )
        .then(recepcionistaExistente => {
            if(recepcionistaExistente){
                return res.status(409).send(
                    {message: "Recepcionista de CPF " + req.body.cpf + " e/ou login " + req.body.login + " já existente"}
                );
            
            } else{
                const data = {
                    nome : req.body.nome,
                    login : req.body.login,
                    senha : req.body.senha,
                    cpf : req.body.cpf,
                    email : req.body.email,
                    telefone : req.body.telefone,
                    dataDeNascimento : new Date(req.body.dataDeNascimento),
                    dataDeAdmissão : new Date(req.body.dataDeAdmissão),
                    ativo : true
                }

                var validationError = Recepcionista.joiValidate(data);

                if(validationError.error) return res.status(400).send({
                    message: validationError.error.details[0].message || "Erro nos dados do Recepcionista."
                });
            
                const recepcionista = new Recepcionista(data);

                recepcionista.save()
                .then(data => {
                    res.send(data);
                }).catch(err => {
                    res.status(500).send({
                        message: err.message || "Erro ao gravar Recepcionista."
                    });
                });
            }
        })
};

exports.findAll = (req, res) => {
    var filter = req.body.filter || "";
    var page = req.body.page || 1;
    var limitPerPage = 10;

    Recepcionista.find({ nome : { $regex : filter } })
        .sort({ nome : 1 })
        .skip((limitPerPage*page) - limitPerPage)
        .limit(limitPerPage)
        .then(recepcionistas => {

            //TODO: skip this is if logged in user is ADMIN
            recepcionistas.map((recepcionista) => {
                recepcionista.login = undefined;
                recepcionista.senha = undefined;
                return recepcionista;
            });

            res.send({
                recepcionistas,
                page
            });
        }).catch(err => {
            res.status(500).send({
                message: err.message || "Erro ao buscar lista de recepcionistas."
            });
        });
};

exports.findOne = (req, res) => {
    Recepcionista.findById(req.params.recepcionistaId)
    .then(recepcionista => {
        if(recepcionista){
            //TODO: only returns this values if logged in user is ADMIN
            recepcionista.login = undefined;
            recepcionista.senha = undefined;
            return res.send(recepcionista);
        }
    }).catch(err => {
        if(err.kind === 'ObjectId') {
            return res.status(404).send({
                message: "Recepcionista não encontrado com id " + req.params.recepcionistaId
            });                
        }
        return res.status(500).send({
            message: "Erro ao buscar recepcionista com id " + req.params.recepcionistaId
        });
    });
};

//ONLY ADMIN
exports.update = (req, res) => {
    var validationError = Recepcionista.joiValidate(req.body);

    if(validationError.error) return res.status(400).send({
        message: validationError.error.details[0].message || "Erro nos dados do Recepcionista."
    });

    Recepcionista.findByIdAndUpdate(req.params.recepcionistaId, req.body, {new: true})
    .then(note => {
        if(note) res.send(note);
    }).catch(err => {
        console.log(err);
        if(err.kind === 'ObjectId') {
            return res.status(404).send({
                message: "Recepcionista não encontrado com id " + req.params.recepcionistaId
            });                
        }
        return res.status(500).send({
            message: "Erro ao atualizar Recepcionista com id " + req.params.recepcionistaId
        });
    });
};

//ONLY ADMIN
exports.inactivate = (req, res) => {
    Recepcionista.findByIdAndUpdate(req.params.recepcionistaId, { ativo : false })
    .then(recepcionista => {
        if(recepcionista) res.send({message: "Recepcionista inativado com sucesso"});
    }).catch(err => {
        if(err.kind === 'ObjectId' || err.name === 'NotFound') {
            return res.status(404).send({
                message: "Recepcionista não encontrado com id " + req.params.recepcionistaId
            });                
        }
        return res.status(500).send({
            message: "Erro ao inativar recepcionista com id " + req.params.recepcionistaId
        });
    });
};

//ONLY ADMIN
exports.activate = (req, res) => {
    Recepcionista.findByIdAndUpdate(req.params.recepcionistaId, { ativo : true })
    .then(recepcionista => {
        if(recepcionista) res.send({message: "Recepcionista ativado com sucesso"});
    }).catch(err => {
        if(err.kind === 'ObjectId' || err.name === 'NotFound') {
            return res.status(404).send({
                message: "Recepcionista não encontrado com id " + req.params.recepcionistaId
            });                
        }
        return res.status(500).send({
            message: "Erro ao ativar recepcionista com id " + req.params.recepcionistaId
        });
    });
};