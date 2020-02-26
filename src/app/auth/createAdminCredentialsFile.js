const path = require('path');
const fs = require('fs');
const {loginAlreadyExistsForMedicoOrRecepcionista} = require('../controllers/HelperFunctions');

exports.createAdminCredentialsFile = () => {
    console.log("Creating Admin credentials file");
    const adminCredentialsFilePath = path.join(__dirname, 'AdminCredentials.json');

    fs.access(adminCredentialsFilePath, fs.F_OK, async (err) => {
        if(err){
            if(err.code === "ENOENT") {
                const adminCredentials = {
                    adminLogin : "admin",
                    adminSenha : "admin"
                }

                var auxAppend = 0;
                while(await loginAlreadyExistsForMedicoOrRecepcionista(adminCredentials.adminLogin)){
                    console.log("Another user already has login " + adminCredentials.adminLogin);
                    auxAppend++;
                    adminCredentials.adminLogin = adminCredentials.adminLogin + auxAppend;
                }

                //TODO: encrypt password
    
                fs.writeFile(adminCredentialsFilePath, JSON.stringify(adminCredentials, null, 2), function writeJSON(err) {
                    if (err) {
                        console.log("Error creating admin credentials file");
                        throw err;
                    }
            
                    console.log("Admin credentials file created successfully");
                    return;
                });

            } else{
                console.log("Error creating admin credentials file");
                throw err;
            }

        } else{
            console.log("Admin credentials file already exists");
            return;
        }
    });
}