const Convenio = require('../models/Convenio.js');

//ONLY ADMIN
exports.create = (req, res) => {
    Convenio.findOne( { nome : req.body.nome } )
        .then(convenioExistente => {
            if(convenioExistente){
                return res.status(409).send(
                    {message: "Convênio " + req.body.nome + " já existente"}
                );
            
            } else{
                const data = {
                    nome : req.body.nome,
                    ativo : true
                }

                var validationError = Convenio.joiValidate(data);

                if(validationError.error) return res.status(400).send({
                    message: validationError.error.details[0].message || "Erro nos dados do Convênio."
                });
            
                const convenio = new Convenio(data);

                convenio.save()
                .then(data => {
                    res.send(data);
                }).catch(err => {
                    res.status(500).send({
                        message: err.message || "Erro ao gravar Convênio."
                    });
                });
            }
        })
};

exports.findAll = (req, res) => {
    var filter = req.body.filter || "";
    var page = req.body.page || 1;
    var limitPerPage = 10;

    Convenio.find({ nome : { $regex : filter } })
        .sort({ nome : 1 })
        .skip((limitPerPage*page) - limitPerPage)
        .limit(limitPerPage)
        .then(convenios => {
            res.send({
                convenios,
                page
            });
        }).catch(err => {
            res.status(500).send({
                message: err.message || "Erro ao buscar lista de Convênios."
            });
        });
};

exports.findOne = (req, res) => {
    Convenio.findById(req.params.convenioId)
    .then(convenio => {
        if(convenio) return res.send(convenio);
    }).catch(err => {
        if(err.kind === 'ObjectId') {
            return res.status(404).send({
                message: "Convênio não encontrado com id " + req.params.convenioId
            });                
        }
        return res.status(500).send({
            message: "Erro ao buscar Convênio com id " + req.params.convenioId
        });
    });
};

//ONLY ADMIN
exports.update = (req, res) => {
    var validationError = Convenio.joiValidate(req.body);

    if(validationError.error) return res.status(400).send({
        message: validationError.error.details[0].message || "Erro nos dados do Convênio."
    });

    Convenio.findByIdAndUpdate(req.params.convenioId, req.body, {new: true})
    .then(note => {
        if(note) res.send(note);
    }).catch(err => {
        if(err.kind === 'ObjectId') {
            return res.status(404).send({
                message: "Convênio não encontrado com id " + req.params.convenioId
            });                
        }
        return res.status(500).send({
            message: "Erro ao atualizar Convênio com id " + req.params.convenioId
        });
    });
};

//ONLY ADMIN
exports.inactivate = (req, res) => {
    Convenio.findByIdAndUpdate(req.params.convenioId, { ativo : false })
    .then(convenio => {
        if(convenio) res.send({message: "Convênio inativado com sucesso"});
    }).catch(err => {
        if(err.kind === 'ObjectId' || err.name === 'NotFound') {
            return res.status(404).send({
                message: "Convênio não encontrado com id " + req.params.convenioId
            });                
        }
        return res.status(500).send({
            message: "Erro ao inativar Convênio com id " + req.params.convenioId
        });
    });
};

//ONLY ADMIN
exports.activate = (req, res) => {
    Convenio.findByIdAndUpdate(req.params.convenioId, { ativo : true })
    .then(convenio => {
        if(convenio) res.send({message: "Convênio ativado com sucesso"});
    }).catch(err => {
        if(err.kind === 'ObjectId' || err.name === 'NotFound') {
            return res.status(404).send({
                message: "Convênio não encontrado com id " + req.params.convenioId
            });                
        }
        return res.status(500).send({
            message: "Erro ao ativar Convênio com id " + req.params.convenioId
        });
    });
};