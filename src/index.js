const express = require('express');
const app = express();
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const routes = require('./app/routes/index');
const fileUpload = require('express-fileupload');
const {port, dbUri} = require('./config.json');
const {createAdminCredentialsFile} = require('./app/auth/createAdminCredentialsFile');

app.listen(port, () =>{
    console.log("Server running on port: " + port);
    createAdminCredentialsFile();
});

mongoose.connect(dbUri, { useNewUrlParser: true }, (err) => {
    if(err){
        console.log("Error connecting to mongo");
    } else{
        console.log("Connected to mongo");
    }
});

app.use(fileUpload({
    createParentPath : true
}));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(routes);

module.exports = app;