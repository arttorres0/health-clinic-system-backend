const Recepcionista = require('../models/Recepcionista');
const Medico = require('../models/Medico');

//ONLY ADMIN
exports.create = async (req, res) => {
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
        message: validationError.error.details[0].message ? "Formato inválido do campo " + validationError.error.details[0].context.key : "Erro nos dados do Recepcionista"
    });

    if(await loginAlreadyExistsInOtherRole(data.login)) return res.status(400).send({
        message: "Outro usuário do sistema já possui o login " + data.login
    });

    const recepcionista = new Recepcionista(data);

    recepcionista.save()
    .then(data => {
        return res.send(data);
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

            return res.send({
                recepcionistas,
                page
            });
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
    }).catch(err => {
        if(err.kind === 'ObjectId') {
            return res.status(404).send({
                message: "Recepcionista não encontrado com id " + req.params.recepcionistaId
            });                
        }
        return res.status(500).send({
            message: "Erro ao buscar Recepcionista com id " + req.params.recepcionistaId
        });
    });
};

//ONLY ADMIN
exports.update = async (req, res) => {
    var validationError = Recepcionista.joiValidate(req.body);

    if(validationError.error) return res.status(400).send({
        message: validationError.error.details[0].message ? "Formato inválido do campo " + validationError.error.details[0].context.key : "Erro nos dados do Recepcionista"
    });

    if(await loginAlreadyExistsInOtherRole(req.body.login, req.params.recepcionistaId)) return res.status(400).send({
        message: "Outro usuário do sistema já possui o login " + req.body.login
    });

    Recepcionista.findByIdAndUpdate(req.params.recepcionistaId, req.body, {new: true})
    .then(recepcionista => {
        if(recepcionista) return res.send(recepcionista);
    }).catch(err => {
        if(err.kind === 'ObjectId') {
            return res.status(404).send({
                message: "Recepcionista não encontrado com id " + req.params.recepcionistaId
            });                
        }

        if(err.code === 11000){
            const duplicatedKey = Object.keys(err.keyValue)[0];
            const duplicatedValue = err.keyValue[duplicatedKey];
            return res.status(409).send({message: "Recepcionista com " + duplicatedKey + " " + duplicatedValue + " já existente"});
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
        if(recepcionista) return res.send({message: "Recepcionista inativado com sucesso"});
    }).catch(err => {
        if(err.kind === 'ObjectId' || err.name === 'NotFound') {
            return res.status(404).send({
                message: "Recepcionista não encontrado com id " + req.params.recepcionistaId
            });                
        }
        return res.status(500).send({
            message: "Erro ao inativar Recepcionista com id " + req.params.recepcionistaId
        });
    });
};

//ONLY ADMIN
exports.activate = (req, res) => {
    Recepcionista.findByIdAndUpdate(req.params.recepcionistaId, { ativo : true })
    .then(recepcionista => {
        if(recepcionista) return res.send({message: "Recepcionista ativado com sucesso"});
    }).catch(err => {
        if(err.kind === 'ObjectId' || err.name === 'NotFound') {
            return res.status(404).send({
                message: "Recepcionista não encontrado com id " + req.params.recepcionistaId
            });                
        }
        return res.status(500).send({
            message: "Erro ao ativar Recepcionista com id " + req.params.recepcionistaId
        });
    });
};

async function loginAlreadyExistsInOtherRole(login, id=null){
    if(login === "admin") return true;

    if(id){
        var result = await Medico.findOne({login, _id : {$ne : id}});
        if(result) return true;
        return false;

    } else{
        var result = await Medico.findOne({login : login});
        if(result) return true;
        return false;
    }
}