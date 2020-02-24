const Recepcionista = require('../models/Recepcionista');
const Medico = require('../models/Medico');

exports.loginAlreadyExistsForAdminOrRecepcionista = async (login) => {
    if(login === "admin") return true;

    var result = await Recepcionista.findOne({login : login});
    if(result) return true;
    return false;
};

exports.loginAlreadyExistsForAdminOrMedico = async (login) => {
    if(login === "admin") return true;

    var result = await Medico.findOne({login : login});
    if(result) return true;
    return false;
};