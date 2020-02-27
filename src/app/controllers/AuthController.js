const fs = require('fs');
const path = require('path');
const jwt = require('jsonwebtoken');
const Roles = require('../auth/Roles');
const { jwtKey } = require('../../config.json');
const {loginAlreadyExistsForMedicoOrRecepcionista} = require('../helper/HelperFunctions');
const Recepcionista = require('../models/Recepcionista');
const Medico = require('../models/Medico');

exports.login = async (req, res) => {
    const login = req.body.login;
    const senha = req.body.senha;

    if(!login || !senha) return res.status(400).send({
        message: "Campos login e senha são obrigatórios"
    });

    try {
        const adminCredentials = require('../auth/AdminCredentials.json');
        const adminLogin = adminCredentials.adminLogin;
        const adminSenha = adminCredentials.adminSenha;

        if(login == adminLogin){
            return checkLoginSignTokenAndSend(res, login, Roles.ADMIN, senha, adminSenha);

        } else{
            Medico.findOne({login})
                .then(medico => {
                    if(medico){
                        return checkLoginSignTokenAndSend(res, login, Roles.MEDICO, senha, medico.senha);
                    
                    } else{
                        Recepcionista.findOne({login})
                        .then(recepcionista => {
                            if(recepcionista){
                                return checkLoginSignTokenAndSend(res, login, Roles.RECEPCIONISTA, senha, recepcionista.senha);

                            } else{
                                return res.status(400).send({
                                    message : "Login ou senha incorretos"
                                });
                            }
                        })
        
                    }
                })
        }

    } catch (error) {
        return res.status(500).send({
            message: "Erro ao realizar login"
        });
    }
};

function checkLoginSignTokenAndSend(res, login, role, senha, validSenha){
    //TODO: decrypt validSenha
    if(senha == validSenha){
        const token = jwt.sign({ login, role }, jwtKey, { expiresIn : "24h" });
        return res.send({
            token,
            message : "Logado com sucesso"
        })

    } else{
        return res.status(400).send({
            message : "Login ou senha incorretos"
        });
    }
}

exports.getAdminCredentials = async (req, res) => {
    try {
        const fileName = path.join(__dirname, '../auth', 'AdminCredentials.json');
        const file = require(fileName);

        var login = file.adminLogin;
        //TODO: decrypt senha
        var senha = file.adminSenha;

        res.send({
            login,
            senha
        })
            
    } catch (error) {
        return res.status(500).send({
            message: "Erro ao obter credenciais de admin"
        });
    }
};

exports.editAdminCredentials = async (req, res) => {
    if(!req.body.login || !req.body.senha) return res.status(400).send({
        message: "Campos login e senha são obrigatórios"
    });

    if(await loginAlreadyExistsForMedicoOrRecepcionista(req.body.login)) return res.status(400).send({
        message: "Outro usuário do sistema já possui o login " + req.body.login
    });

    const fileName = path.join(__dirname, '../auth', 'AdminCredentials.json');
    const file = require(fileName);

    file.adminLogin = req.body.login;
    //TODO: encrypt senha
    file.adminSenha = req.body.senha;

    fs.writeFile(fileName, JSON.stringify(file, null, 2), function writeJSON(err) {
        if (err) return res.status(500).send({
            message: "Erro ao atualizar credenciais de admin"
        });

        return res.send({
            message: "Credencias de admin atualizadas com sucesso"
        });
    });
};