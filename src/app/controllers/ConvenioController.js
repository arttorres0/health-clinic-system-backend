const Convenio = require('../models/Convenio');

//ONLY ADMIN
exports.create = async (req, res) => {
    const data = {
        nome : req.body.nome,
        ativo : true
    }

    var validationError = Convenio.joiValidate(data);

    if(validationError.error) return res.status(400).send({
        message: validationError.error.details[0].message ? "Formato inválido do campo " + validationError.error.details[0].context.key : "Erro nos dados do Convênio"
    });

    const convenio = new Convenio(data);

    convenio.save()
        .then(data => {
            return res.send(data);
        
        }).catch(err => {
            if(err.code === 11000){
                const duplicatedKey = Object.keys(err.keyValue)[0];
                const duplicatedValue = err.keyValue[duplicatedKey];
                return res.status(409).send({message: "Convênio com " + duplicatedKey + " " + duplicatedValue + " já existente"});
            }

            return res.status(500).send({
                message: err.message || "Erro ao gravar Convênio"
            });
        });
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
            return res.send({
                convenios,
                page
            });

        }).catch(err => {
            return res.status(500).send({
                message: err.message || "Erro ao buscar lista de Convênios"
            });
        });
};

exports.findOne = (req, res) => {
    Convenio.findById(req.params.convenioId)
        .then(convenio => {
            if(convenio) return res.send(convenio);

            return res.status(404).send({
                message: "Convênio não encontrado com id " + req.params.convenioId
            });

        }).catch(err => {
            if(err.kind === 'ObjectId') return res.status(404).send({
                message: "Convênio não encontrado com id " + req.params.convenioId
            });

            return res.status(500).send({
                message: "Erro ao buscar Convênio com id " + req.params.convenioId
            });
        });
};

//ONLY ADMIN
exports.update = async (req, res) => {
    var validationError = Convenio.joiValidate(req.body);

    if(validationError.error) return res.status(400).send({
        message: validationError.error.details[0].message ? "Formato inválido do campo " + validationError.error.details[0].context.key : "Erro nos dados do Convênio"
    });

    Convenio.findByIdAndUpdate(req.params.convenioId, req.body, {new: true})
        .then(convenio => {
            if(convenio) return res.send(convenio);

            return res.status(404).send({
                message: "Convênio não encontrado com id " + req.params.convenioId
            });

        }).catch(err => {
            if(err.kind === 'ObjectId') return res.status(404).send({
                message: "Convênio não encontrado com id " + req.params.convenioId
            });

            if(err.code === 11000){
                const duplicatedKey = Object.keys(err.keyValue)[0];
                const duplicatedValue = err.keyValue[duplicatedKey];
                return res.status(409).send({message: "Convênio com " + duplicatedKey + " " + duplicatedValue + " já existente"});
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
            if(convenio) return res.send({message: "Convênio inativado com sucesso"});

            return res.status(404).send({
                message: "Convênio não encontrado com id " + req.params.convenioId
            });

        }).catch(err => {
            if(err.kind === 'ObjectId') {
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
            if(convenio) return res.send({message: "Convênio ativado com sucesso"});

            return res.status(404).send({
                message: "Convênio não encontrado com id " + req.params.convenioId
            });

        }).catch(err => {
            if(err.kind === 'ObjectId') {
                return res.status(404).send({
                    message: "Convênio não encontrado com id " + req.params.convenioId
                });                
            }
            return res.status(500).send({
                message: "Erro ao ativar Convênio com id " + req.params.convenioId
            });
        });
};