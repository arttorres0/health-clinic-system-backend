const Medico = require('../models/Medico');
const Recepcionista = require('../models/Recepcionista');

//ONLY ADMIN
exports.create = async (req, res) => {
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
        message: validationError.error.details[0].message ? "Formato inválido do campo " + validationError.error.details[0].context.key : "Erro nos dados do Médico"
    });

    if(await loginAlreadyExistsInOtherRole(data.login)) return res.status(400).send({
        message: "Outro usuário do sistema já possui o login " + data.login
    });

    const medico = new Medico(data);

    medico.save()
        .then(data => {
            return res.send(data);
        
        }).catch(err => {
            if(err.code === 11000){
                const duplicatedKey = Object.keys(err.keyValue)[0];
                const duplicatedValue = err.keyValue[duplicatedKey];
                return res.status(409).send({message: "Médico com " + duplicatedKey + " " + duplicatedValue + " já existente"});
            }

            return res.status(500).send({
                message: err.message || "Erro ao gravar Médico"
            });
        });
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

            return res.send({
                medicos,
                page
            });

        }).catch(err => {
            return res.status(500).send({
                message: err.message || "Erro ao buscar lista de Médicos"
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

            return res.status(404).send({
                message: "Médico não encontrado com id " + req.params.medicoId
            });

        }).catch(err => {
            if(err.kind === 'ObjectId') return res.status(404).send({
                message: "Médico não encontrado com id " + req.params.medicoId
            });

            return res.status(500).send({
                message: "Erro ao buscar Médico com id " + req.params.medicoId
            });
        });
};

//ONLY ADMIN
exports.update = async (req, res) => {
    var validationError = Medico.joiValidate(req.body);

    if(validationError.error) return res.status(400).send({
        message: validationError.error.details[0].message ? "Formato inválido do campo " + validationError.error.details[0].context.key : "Erro nos dados do Médico"
    });

    if(await loginAlreadyExistsInOtherRole(req.body.login)) return res.status(400).send({
        message: "Outro usuário do sistema já possui o login " + req.body.login
    });

    Medico.findByIdAndUpdate(req.params.medicoId, req.body, {new: true})
        .then(medico => {
            if(medico) return res.send(medico);

            return res.status(404).send({
                message: "Médico não encontrado com id " + req.params.medicoId
            });

        }).catch(err => {
            if(err.kind === 'ObjectId') return res.status(404).send({
                message: "Médico não encontrado com id " + req.params.medicoId
            });

            if(err.code === 11000){
                const duplicatedKey = Object.keys(err.keyValue)[0];
                const duplicatedValue = err.keyValue[duplicatedKey];
                return res.status(409).send({message: "Médico com " + duplicatedKey + " " + duplicatedValue + " já existente"});
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
            if(medico) return res.send({message: "Médico inativado com sucesso"});

            return res.status(404).send({
                message: "Médico não encontrado com id " + req.params.medicoId
            });

        }).catch(err => {
            if(err.kind === 'ObjectId') {
                return res.status(404).send({
                    message: "Médico não encontrado com id " + req.params.medicoId
                });
            }
            return res.status(500).send({
                message: "Erro ao inativar Médico com id " + req.params.medicoId
            });
        });
};

//ONLY ADMIN
exports.activate = (req, res) => {
    Medico.findByIdAndUpdate(req.params.medicoId, { ativo : true })
        .then(medico => {
            if(medico) return res.send({message: "Médico ativado com sucesso"});

            return res.status(404).send({
                message: "Médico não encontrado com id " + req.params.medicoId
            });

        }).catch(err => {
            if(err.kind === 'ObjectId') {
                return res.status(404).send({
                    message: "Médico não encontrado com id " + req.params.medicoId
                });                
            }
            return res.status(500).send({
                message: "Erro ao ativar Médico com id " + req.params.medicoId
            });
        });
};

async function loginAlreadyExistsInOtherRole(login){
    if(login === "admin") return true;

    var result = await Recepcionista.findOne({login : login});
    if(result) return true;
    return false;
}