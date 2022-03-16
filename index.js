require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.SERVER_PORT;
const database = require('./src/repository/database/postgresql');
const auth = require('./src/auth/auth');
const unexpectedError = { message : process.env.SERVER_UNEXPECTED_ERROR_MESSAGE};

app.use(express.urlencoded({
    extended: true
}));

app.use(express.json({limit: '50mb'}));

app.use(cors())
app.options('*', cors());

database.connect();

app.get('/', function(req, res) {    
    var result = { setup : "done"}
    res.send(result);
});

app.get('/apps', async function(req, res) {    
    var result = await database.getAllApps();
    res.json(result);
});

app.get('/apps/:id', async function(req, res) {
    try {
        const { id } = req.params;
        var result = await database.getApp(id);
        res.json(result);
    } catch (error) {
        res.json(unexpectedError);
    }
});

app.post('/apps/create', async function(req, res) {
    const token = req.headers.authorization;
    if (!auth.isTokenValid(token)) {
        return res.status(403).json(auth.authErroMessage);
    }
    try {
        const appData = req.body;
        var result = await database.insertApp(appData, token);
        res.json(result);
    } catch (error) {
        res.json(unexpectedError);
    }
});

app.post('/apps/update/:id', async function(req, res) {
    const token = req.headers.authorization;
    if (!auth.isTokenValid(token)) {
        return res.status(403).json(auth.authErroMessage);
    }
    try {
        const { id } = req.params;
        const newAppData = req.body;
        var result = await database.updateApp(id, newAppData, token);
        res.json(result);
    } catch (error) {
        res.json(unexpectedError);
    }
});

app.delete('/apps/delete', async function(req, res) {
    const token = req.headers.authorization;
    if (!auth.isTokenValid(token)) {
        return res.status(403).json(auth.authErroMessage);
    }
    try {
        const idList = req.body;
        var result = await database.deleteApps(idList, token);
        res.json(result);
    } catch (error) {
        res.json(unexpectedError);
    }
});


app.post('/user/create', async function(req, res) {
    try {
        const userData = req.body;
        var result = await database.createUser(userData);
        res.json(result);
    } catch (error) {
        res.json(unexpectedError);
    }
});

app.post('/user/login', async function(req, res) {
    try {
        const userData = req.body;
        var result = await database.checkUserLogin(userData);
        res.json(result);
    } catch (error) {
        res.json(unexpectedError);
    }
});

app.listen(port, () => console.log(`listening at ${port}`));
