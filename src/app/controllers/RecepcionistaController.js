const Recepcionista = require('../models/Recepcionista');
const {loginAlreadyExistsForAdminOrMedico} = require('../helper/HelperFunctions');

exports.create = async (req, res) => {
    //TODO: encrypt password
    const recepcionistaReqInfo = {
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

    var validationError = Recepcionista.joiValidate(recepcionistaReqInfo);

    if(validationError.error) return res.status(400).send({
        message: validationError.error.details[0].message ? "Formato inválido do campo " + validationError.error.details[0].context.key : "Erro nos dados do Recepcionista"
    });

    if(await loginAlreadyExistsForAdminOrMedico(recepcionistaReqInfo.login)) return res.status(400).send({
        message: "Outro usuário do sistema já possui o login " + recepcionistaReqInfo.login
    });

    const recepcionista = new Recepcionista(recepcionistaReqInfo);

    recepcionista.save()
        .then(recepcionistaReqInfo => {
            return res.send(recepcionistaReqInfo);
        
        }).catch(err => {
            if(err.code === 11000){
                const duplicatedKey = Object.keys(err.keyValue)[0];
                const duplicatedValue = err.keyValue[duplicatedKey];
                return res.status(409).send({message: "Recepcionista com " + duplicatedKey + " " + duplicatedValue + " já existente"});
            }

            return res.status(500).send({
                message: err.message || "Erro ao gravar Recepcionista"
            });
        });
};

exports.findAll = (req, res) => {
    var filter = req.body.filter || "";
    var page = req.body.page || 1;
    var limitPerPage = 10;

    var query = { nome : { $regex : filter } };

    Recepcionista.find( query )
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

            Recepcionista.count( query ).exec((error, count) => {
                if(error) return res.status(500).send({
                    message: err.message || "Erro ao buscar lista de Recepcionistas"
                });

                return res.send({
                    recepcionistas,
                    page,
                    numberOfPages : Math.ceil(count/limitPerPage),
                    numberOfResults : count
                });
            })

        }).catch(err => {
            return res.status(500).send({
                message: err.message || "Erro ao buscar lista de Recepcionistas"
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

            return res.status(404).send({
                message: "Recepcionista não encontrado"
            });

        }).catch(err => {
            if(err.kind === 'ObjectId') return res.status(404).send({
                message: "Recepcionista não encontrado"
            });

            return res.status(500).send({
                message: "Erro ao buscar Recepcionista"
            });
        });
};

exports.update = async (req, res) => {
    //TODO: encrypt password
    var validationError = Recepcionista.joiValidate(req.body);

    if(validationError.error) return res.status(400).send({
        message: validationError.error.details[0].message ? "Formato inválido do campo " + validationError.error.details[0].context.key : "Erro nos dados do Recepcionista"
    });

    if(await loginAlreadyExistsForAdminOrMedico(req.body.login)) return res.status(400).send({
        message: "Outro usuário do sistema já possui o login " + req.body.login
    });

    Recepcionista.findByIdAndUpdate(req.params.recepcionistaId, req.body, {new: true})
        .then(recepcionista => {
            if(recepcionista) return res.send(recepcionista);

            return res.status(404).send({
                message: "Recepcionista não encontrado"
            });

        }).catch(err => {
            if(err.kind === 'ObjectId') return res.status(404).send({
                message: "Recepcionista não encontrado"
            });

            if(err.code === 11000){
                const duplicatedKey = Object.keys(err.keyValue)[0];
                const duplicatedValue = err.keyValue[duplicatedKey];
                return res.status(409).send({message: "Recepcionista com " + duplicatedKey + " " + duplicatedValue + " já existente"});
            }

            return res.status(500).send({
                message: "Erro ao atualizar Recepcionista"
            });
        });
};