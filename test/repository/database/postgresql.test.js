require('dotenv').config()

var baseUrl = `http://localhost:${process.env.SERVER_PORT}`;

let auth = require('./../../../src/auth/auth')
let chai = require('chai');
let chaiHttp = require('chai-http');
let should = chai.should();
let util = require('./../../util')
chai.use(chaiHttp);

const testAppId = 1
const testAppName = "TikTok"
const inexistentAppId = 324941
const appsToDelete = []

const testLoginUsername = "layla";
const testLoginPassword = "password1";

const appNotFoundMessage = process.env.DB_ERROR_APP_NOT_FOUND;
const appAlreadyExistMessage = process.env.DB_ERROR_APP_ALREADY_EXIST;

const userAlreadyExistMessage = process.env.DB_ERROR_USER_ALREADY_EXIST;
const userOrPasswordIncorrectMessage = process.env.DB_ERROR_USER_OR_PASSWORD_INCORRECT;
const userOrPasswordEmptyMessage = process.env.LOGIN_USER_AND_PASSWORD_MUST_HAVE_VALUES;
const invalidTokenMessage = process.env.SERVER_INVALID_TOKEN_ERROR_MESSAGE;
const DEV_SESSION_TOKEN = auth.DEV_SESSION_TOKEN;

//APP DB Calls

describe('/GET all apps', () => {
    it('Should GET a list of apps', (done) => {
        chai.request(baseUrl)
            .get('/apps')
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.a('array');
                done();
            });
    });
});


describe(`/GET app of id=${testAppId}`, () => {
    it(`Should GET a single row of app_id=${testAppId} after first initialization of DB and server`, (done) => {
        chai.request(baseUrl)
            .get(`/apps/${testAppId}`)
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.a('object');
                res.body.app_id.should.be.eql(testAppId);
                done();
            });
    });
});


describe(`/GET try to get inexistent app`, () => {
    it(`Should return an error message saying that the app could not be found`, (done) => {
        chai.request(baseUrl)
            .get(`/apps/${inexistentAppId}`)
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.a('object');
                res.body.message.should.be.eql(appNotFoundMessage);
                done();
            });
    });
});

describe(`/GET try to get app by id using invalid integer`, () => {
    it(`Should return an message saying that the server couldn't process the request`, (done) => {
        chai.request(baseUrl)
            .get(`/apps/${util.generateRandomString(5)}`)
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.a('object');
                res.body.message.should.be.eql(process.env.SERVER_UNEXPECTED_ERROR_MESSAGE);
                done();
            });
    });
});


////////////
/* UPDATE */
////////////

describe(`/POST update app NOT USING authorization Token`, () => {
    it('Should return an error message saying that token was not provided or invalid', (done) => {
        const newName = `Update name of app of id=${testAppId}`;
        const newDescription = `Update description of app of id=${testAppId}`;
        chai.request(baseUrl)
            .post(`/apps/update/${testAppId}`)
            .send({ name: newName, description: newDescription})
            .end((err, res) => {
                res.should.have.status(403);
                res.body.should.be.a('object');
                res.body.message.should.be.eql(invalidTokenMessage);
                done();
            });
    });
});

describe(`/POST update app USING INVALID authorization Token`, () => {
    it('Should return an error message saying that token was not provided or invalid', (done) => {
        const newName = `Update name of app of id=${testAppId}`;
        const newDescription = `Update description of app of id=${testAppId}`;
        chai.request(baseUrl)
            .post(`/apps/update/${testAppId}`)
            .set('Authorization', util.generateRandomString(20))
            .send({ name: newName, description: newDescription})
            .end((err, res) => {
                res.should.have.status(403);
                res.body.should.be.a('object');
                res.body.message.should.be.eql(invalidTokenMessage);
                done();
            });
    });
});

describe(`/POST update app of id=${testAppId} using authorization Token`, () => {
    it('Should return an app with the same id and updated values passed as parameter in the body of the POST request', (done) => {
        const newName = `Update name of app of id=${testAppId}`;
        const newDescription = `Update description of app of id=${testAppId}`;
        chai.request(baseUrl)
            .post(`/apps/update/${testAppId}`)
            .set('Authorization', DEV_SESSION_TOKEN)
            .send({ name: newName, description: newDescription})
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.a('object');
                res.body.app_id.should.be.eql(testAppId);
                res.body.name.should.be.eql(newName);
                res.body.description.should.be.eql(newDescription);
                done();
            });
    });
});

describe(`/POST attempt to update an inexistent app using authorization Token`, () => {
    it('Should return an error message saying that the app could not be found', (done) => {
        chai.request(baseUrl)
            .post(`/apps/update/${inexistentAppId}`)
            .set('Authorization', DEV_SESSION_TOKEN)
            .send({ name: util.generateRandomString(10), description: util.generateRandomString(10)})
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.a('object');
                res.body.message.should.be.eql(appNotFoundMessage);
                done();
            });
    });
});

// describe(`/POST attempt to update an inexistent app NOT USING authorization Token`, () => {
//     it('Should return an error message saying that the app could not be found', (done) => {
//         chai.request(baseUrl)
//             .post(`/apps/update/${inexistentAppId}`)
//             .send({ name: util.generateRandomString(10), description: util.generateRandomString(10)})
//             .end((err, res) => {
//                 res.should.have.status(403);
//                 res.body.should.be.a('object');
//                 res.body.message.should.be.eql(invalidTokenMessage);
//                 done();
//             });
//     });
// });


describe(`/POST attempt to update an app and change the name to an already existing one using authorization Token`, () => {
    it('Should return an error message saying that the app already exists', (done) => {        
        chai.request(baseUrl)
            .post(`/apps/update/${testAppId}`)
            .set('Authorization', DEV_SESSION_TOKEN)
            .send({ name: testAppName, description: util.generateRandomString(10)})
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.a('object');
                res.body.message.should.be.eql(appAlreadyExistMessage);
                done();
            });
    });
});


describe(`/POST attempt to update an app using invalid integer using authorization Token`, () => {
    it('Should return an message saying that the server could not process the request', (done) => {        
        chai.request(baseUrl)
            .post(`/apps/update/${util.generateRandomString(10)}`)
            .set('Authorization', DEV_SESSION_TOKEN)
            .send({ name: util.generateRandomString(10), description: util.generateRandomString(10)})
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.a('object');
                res.body.message.should.be.eql(process.env.SERVER_UNEXPECTED_ERROR_MESSAGE);
                done();
            });
    });
});

////////////
/* CREATE */
////////////

describe(`/POST attempt create a new app with provided parameters NOT USING authorization Token`, () => {
    it('Should return an newly created app with values set as provided in parameters in the body of the POST request', (done) => {
        const newName = util.generateRandomString(15);
        const newDescription = util.generateRandomString(15);
        chai.request(baseUrl)
            .post(`/apps/create`)            
            .send({ name: newName, description: newDescription})
            .end((err, res) => {                
                res.should.have.status(403);
                res.body.should.be.a('object');
                res.body.message.should.be.eql(invalidTokenMessage);
                done();
            });
    });
});


describe(`/POST attempt create a new app with provided parameters USING INVALID authorization Token`, () => {
    it('Should return an newly created app with values set as provided in parameters in the body of the POST request', (done) => {
        const newName = util.generateRandomString(15);
        const newDescription = util.generateRandomString(15);
        chai.request(baseUrl)
            .post(`/apps/create`)
            .set('Authorization', util.generateRandomString(20))                        
            .send({ name: newName, description: newDescription})
            .end((err, res) => {                
                res.should.have.status(403);
                res.body.should.be.a('object');
                res.body.message.should.be.eql(invalidTokenMessage);
                done();
            });
    });
});


describe(`/POST create a new app with provided parameters [FIRST] using authorization Token`, () => {
    it('Should return an newly created app with values set as provided in parameters in the body of the POST request', (done) => {
        const newName = util.generateRandomString(15);
        const newDescription = util.generateRandomString(15);
        chai.request(baseUrl)
            .post(`/apps/create`)
            .set('Authorization', DEV_SESSION_TOKEN)
            .send({ name: newName, description: newDescription})
            .end((err, res) => {                
                res.should.have.status(200);
                res.body.should.be.a('object');
                res.body.name.should.be.eql(newName);
                res.body.description.should.be.eql(newDescription);
                appsToDelete.push(res.body.app_id);
                done();
            });
    });
});

describe(`/POST create a new app with provided parameters [SECOND] using authorization Token`, () => {
    it('Should return an newly created app with values set as provided in parameters in the body of the POST request', (done) => {
        const newName = util.generateRandomString(16);
        const newDescription = util.generateRandomString(16);
        chai.request(baseUrl)
            .post(`/apps/create`)
            .set('Authorization', DEV_SESSION_TOKEN)
            .send({ name: newName, description: newDescription})
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.a('object');
                res.body.name.should.be.eql(newName);
                res.body.description.should.be.eql(newDescription);
                appsToDelete.push(res.body.app_id);
                done();
            });
    });
});

describe(`/POST create a new app with provided parameters [THIRD] using authorization Token`, () => {
    it('Should return an newly created app with values set as provided in parameters in the body of the POST request', (done) => {
        const newName = util.generateRandomString(17);
        const newDescription = util.generateRandomString(17);
        chai.request(baseUrl)
            .post(`/apps/create`)
            .set('Authorization', DEV_SESSION_TOKEN)
            .send({ name: newName, description: newDescription})
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.a('object');
                res.body.name.should.be.eql(newName);
                res.body.description.should.be.eql(newDescription);
                appsToDelete.push(res.body.app_id);
                done();
            });
    });
});


describe(`/POST attempt create a an app that already exist using authorization Token`, () => {
    it('Should return an error message saying the app already exist', (done) => {        
        chai.request(baseUrl)
            .post(`/apps/create`)
            .set('Authorization', DEV_SESSION_TOKEN)
            .send({ name: testAppName, description: util.generateRandomString(15)})
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.a('object');
                res.body.message.should.be.eql(appAlreadyExistMessage);
                done();
            });
    });
});

////////////
/* DELETE */
////////////

describe(`/DELETE delete all created apps in this testing using their ids NOT USING authorization Token`, () => {
    it('Should return an array of objects with the deleted apps by this query', (done) => {         
        chai.request(baseUrl)
            .delete(`/apps/delete`)
            .send(appsToDelete)
            .end((err, res) => {
                res.should.have.status(403);
                res.body.should.be.a('object');
                res.body.message.should.be.eql(invalidTokenMessage);
                done();
            });
    });
});

describe(`/DELETE delete all created apps in this testing using their ids USING INVALID authorization Token`, () => {
    it('Should return an array of objects with the deleted apps by this query', (done) => {         
        chai.request(baseUrl)
            .delete(`/apps/delete`)
            .set('Authorization', util.generateRandomString(20))
            .send(appsToDelete)
            .end((err, res) => {
                res.should.have.status(403);
                res.body.should.be.a('object');
                res.body.message.should.be.eql(invalidTokenMessage);
                done();
            });
    });
});


describe(`/DELETE delete all created apps in this testing using their ids using authorization Token`, () => {
    it('Should return an array of objects with the deleted apps by this query', (done) => {         
        chai.request(baseUrl)
            .delete(`/apps/delete`)
            .set('Authorization', DEV_SESSION_TOKEN)
            .send(appsToDelete)
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.a('array');
                res.body.length.should.be.eql(appsToDelete.length);
                done();
            });
    });
});

describe(`/DELETE Attempt to delete apps using invalid integers using authorization Token`, () => {
    it('Should return an message saying that the server could not process the request', (done) => {         
        chai.request(baseUrl)
            .delete(`/apps/delete`)
            .set('Authorization', DEV_SESSION_TOKEN)
            .send(["","","invalid_int",1])
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.a('object');
                res.body.message.should.be.eql(process.env.SERVER_UNEXPECTED_ERROR_MESSAGE);
                done();
            });
    });
});

//USER DB Calls

describe(`/POST create user with parameters provided`, () => {
    it('Should return an object with the username provided as parameter and a token', (done) => {
        const username = `${util.generateRandomString(5)}`;
        const password = `${util.generateRandomString(5)}`;
        chai.request(baseUrl)
            .post(`/user/create`)
            .send({ username: username, password: password})
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.a('object');
                res.body.username.should.be.eql(username);
                res.body.token.should.be.a('string');
                done();
            });
    });
});

describe(`/POST attempt to create user that already exists`, () => {
    it('Should return an error message saying that the username already exists', (done) => {        
        chai.request(baseUrl)
            .post(`/user/create`)
            .send({ username: testLoginUsername, password: util.generateRandomString(10)})
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.a('object');
                res.body.message.should.be.eql(userAlreadyExistMessage);
                done();
            });
    });
});

describe(`/POST attempt to create user without providing username`, () => {
    it('Should return an error message saying that username and password must be provided.', (done) => {        
        chai.request(baseUrl)
            .post(`/user/create`)
            .send({ password: util.generateRandomString(10)})
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.a('object');
                res.body.message.should.be.eql(userOrPasswordEmptyMessage);
                done();
            });
    });
});

describe(`/POST attempt to create user without providing password`, () => {
    it('Should return an error message saying that username and password must be provided.', (done) => {        
        chai.request(baseUrl)
            .post(`/user/create`)
            .send({ username: testLoginUsername})
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.a('object');
                res.body.message.should.be.eql(userOrPasswordEmptyMessage);
                done();
            });
    });
});

describe(`/POST attempt to create user without providing username or password`, () => {
    it('Should return an error message saying that username and password must be provided.', (done) => {        
        chai.request(baseUrl)
            .post(`/user/create`)
            .send({ })
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.a('object');
                res.body.message.should.be.eql(userOrPasswordEmptyMessage);
                done();
            });
    });
});


describe(`/POST attempt to login with inexistent user`, () => {
    it('Should return an error message saying that the username or password are incorrect', (done) => {
        const username = `${util.generateRandomString(10)}`;
        const password = `${util.generateRandomString(10)}`;
        chai.request(baseUrl)
            .post(`/user/login`)
            .send({ username: username, password: password})
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.a('object');
                res.body.message.should.be.eql(userOrPasswordIncorrectMessage);
                done();
            });
    });
});


describe(`/POST attempt to login with existing user`, () => {
    it('Should return an object with the username of the logged user', (done) => {
        chai.request(baseUrl)
            .post(`/user/login`)
            .send({ username: testLoginUsername, password: testLoginPassword})
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.a('object');
                res.body.token.should.be.a('string');
                done();
            });
    });
});

describe(`/POST attempt to login without providing username`, () => {
    it('Should return an object an erro message saying that username and password must be provided', (done) => {
        chai.request(baseUrl)
            .post(`/user/login`)
            .send({ password: testLoginPassword})
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.a('object');
                res.body.message.should.be.eql(userOrPasswordEmptyMessage);
                done();
            });
    });
});

describe(`/POST attempt to login without providing password`, () => {
    it('Should return an object an erro message saying that username and password must be provided', (done) => {
        chai.request(baseUrl)
            .post(`/user/login`)
            .send({ username: testLoginUsername})
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.a('object');
                res.body.message.should.be.eql(userOrPasswordEmptyMessage);
                done();
            });
    });
});

describe(`/POST attempt to login without providing username or password`, () => {
    it('Should return an object an erro message saying that username and password must be provided', (done) => {
        chai.request(baseUrl)
            .post(`/user/login`)
            .send({ })
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.a('object');
                res.body.message.should.be.eql(userOrPasswordEmptyMessage);
                done();
            });
    });
});