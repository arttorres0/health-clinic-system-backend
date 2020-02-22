const express = require('express');
const app = express();
const db = require('./database/config');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const routes = require('./app/routes/index');

const port = 3000;

app.listen(port, () =>{
    console.log("Server running on port: " + port);
});

mongoose.connect(db.uri, { useNewUrlParser: true }, (err) => {
    if(err){
        console.log("Error connecting to mongo");
    } else{
        console.log("Connected to mongo");
    }
});

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(routes);

module.exports = app;