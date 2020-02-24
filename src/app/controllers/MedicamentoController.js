const Medicamento = require('../models/Medicamento');

exports.create = (req, res) => {
    const data = {
        nomeGenerico : req.body.nomeGenerico,
        nomeDeFabrica : req.body.nomeDeFabrica,
        fabricante : req.body.fabricante,
        ativo : true
    }

    var validationError = Medicamento.joiValidate(data);

    if(validationError.error) return res.status(400).send({
        message: validationError.error.details[0].message ? "Formato inválido do campo " + validationError.error.details[0].context.key : "Erro nos dados do Medicamento"
    });

    const medicamento = new Medicamento(data);

    medicamento.save()
        .then(data => {
            return res.send(data);
        
        }).catch(err => {
            if(err.code === 11000){
                const duplicatedKey = Object.keys(err.keyValue)[0];
                const duplicatedValue = err.keyValue[duplicatedKey];
                return res.status(409).send({message: "Medicamento com " + duplicatedKey + " " + duplicatedValue + " já existente"});
            }

            return res.status(500).send({
                message: err.message || "Erro ao gravar Medicamento"
            });
        });
};

exports.findAll = (req, res) => {
    var filter = req.body.filter || "";
    var page = req.body.page || 1;
    var limitPerPage = 10;

    Medicamento.find( { $or : [{ nomeGenerico : { $regex : filter } }, { nomeDeFabrica : { $regex : filter } }] } )
        .sort({ nomeGenerico : 1 })
        .skip((limitPerPage*page) - limitPerPage)
        .limit(limitPerPage)
        .then(medicamentos => {
            return res.send({
                medicamentos,
                page
            });

        }).catch(err => {
            return res.status(500).send({
                message: err.message || "Erro ao buscar lista de Medicamentos"
            });
        });
};

exports.findOne = (req, res) => {
    Medicamento.findById(req.params.medicamentoId)
        .then(medicamento => {
            if(medicamento) return res.send(medicamento);

            return res.status(404).send({
                message: "Medicamento não encontrado"
            });

        }).catch(err => {
            if(err.kind === 'ObjectId') return res.status(404).send({
                message: "Medicamento não encontrado"
            });

            return res.status(500).send({
                message: "Erro ao buscar Medicamento"
            });
        });
};

exports.update = (req, res) => {
    var validationError = Medicamento.joiValidate(req.body);

    if(validationError.error) return res.status(400).send({
        message: validationError.error.details[0].message ? "Formato inválido do campo " + validationError.error.details[0].context.key : "Erro nos dados do Medicamento"
    });

    Medicamento.findByIdAndUpdate(req.params.medicamentoId, req.body, {new: true})
        .then(medicamento => {
            if(medicamento) return res.send(medicamento);

            return res.status(404).send({
                message: "Medicamento não encontrado"
            });

        }).catch(err => {
            if(err.kind === 'ObjectId') return res.status(404).send({
                message: "Medicamento não encontrado"
            });

            if(err.code === 11000){
                const duplicatedKey = Object.keys(err.keyValue)[0];
                const duplicatedValue = err.keyValue[duplicatedKey];
                return res.status(409).send({message: "Medicamento com " + duplicatedKey + " " + duplicatedValue + " já existente"});
            }

            return res.status(500).send({
                message: "Erro ao atualizar Medicamento"
            });
        });
};

exports.inactivate = (req, res) => {
    Medicamento.findByIdAndUpdate(req.params.medicamentoId, { ativo : false })
        .then(medicamento => {
            if(medicamento) return res.send({message: "Medicamento inativado com sucesso"});

            return res.status(404).send({
                message: "Medicamento não encontrado"
            });

        }).catch(err => {
            if(err.kind === 'ObjectId') {
                return res.status(404).send({
                    message: "Medicamento não encontrado"
                });
            }
            return res.status(500).send({
                message: "Erro ao inativar Medicamento"
            });
        });
};

exports.activate = (req, res) => {
    Medicamento.findByIdAndUpdate(req.params.medicamentoId, { ativo : true })
        .then(medicamento => {
            if(medicamento) return res.send({message: "Medicamento ativado com sucesso"});

            return res.status(404).send({
                message: "Medicamento não encontrado"
            });

        }).catch(err => {
            if(err.kind === 'ObjectId') {
                return res.status(404).send({
                    message: "Medicamento não encontrado"
                });                
            }
            return res.status(500).send({
                message: "Erro ao ativar Medicamento"
            });
        });
};