const { param } = require('express/lib/request');
const pg = require('pg');
const auth = require('../../auth/auth')

const connectParams = {
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
}

const client = new pg.Client(connectParams);
const duplicationErrorCode = '23505';
const notFoundMessage = { message : process.env.DB_ERROR_APP_NOT_FOUND };
const appAlreadyExistMessage = { message : process.env.DB_ERROR_APP_ALREADY_EXIST };
const userAlreadyExistMessage = { message : process.env.DB_ERROR_USER_ALREADY_EXIST };
const userOrPasswordIncorrectMessage = { message : process.env.DB_ERROR_USER_OR_PASSWORD_INCORRECT };
const userOrPasswordEmpty = { message : process.env.LOGIN_USER_AND_PASSWORD_MUST_HAVE_VALUES };

module.exports = {
    connect: async function () {
        client.connect(function(err) {
            if (err) throw err;
            console.log("Successfuly connected to PostgreSQL database")
        });

    },

    getAllApps : async function () {
        let results = await client.query("SELECT * FROM applications ORDER BY modified_on DESC");
        return results.rows;
    },

    getApp : async function (id) {
        let result = await client.query(`SELECT * FROM applications
                                        where app_id=$1;`,
                                        [id]);                                        
        return result.rowCount > 0 ? result.rows[0] : notFoundMessage;
    },

    updateApp : async function (id, appParams, token) {
        let result = null;
        
        try {
            result = await client.query(`UPDATE applications
                                        SET name = $1,
                                        description = $2,
                                        modified_on = CURRENT_TIMESTAMP
                                        WHERE "app_id" = $3
                                        RETURNING *;`,
                                        [appParams.name, appParams.description, id]);
        } catch (error) {
            if (error.code == duplicationErrorCode && error.detail == `Key (name)=(${appParams.name}) already exists.`) {
                return appAlreadyExistMessage;
            }
        }
        
        return  result.rowCount > 0 ? result.rows[0] : notFoundMessage;
    },

    insertApp : async function (appParams) {
        
        let result = null;
        
        try {
            console.log("aft");
            result = await client.query(`INSERT INTO applications
            (name, description, created_on, modified_on)
            VALUES ($1, $2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
            RETURNING *;`,
            [appParams.name, appParams.description]);
            console.log("aft");
        } catch (error) {
            console.log(error);
            if (error.code == duplicationErrorCode && error.detail == `Key (name)=(${appParams.name}) already exists.`) {
                return appAlreadyExistMessage;
            }
        }        
        console.log(result);
        return result.rows[0];
    },

    deleteApps : async function (ids) {    
        
        let results = await client.query(`DELETE FROM applications
                                        WHERE app_id = ANY($1::int[])
                                        RETURNING *;`,
                                        [ids]);
        return results.rows;
    },

    hasEmptyLoginFields : function (params) {
        if (params.username === undefined || params.password === undefined) {
            return true;
        } else if (params.username.length == 0 || params.password.length == 0) {
            return true;
        }
        return false;
    },

    createUser : async function (params) {
        if (this.hasEmptyLoginFields(params)) {
            return userOrPasswordEmpty;
        }
        let results = null;
        //todo hash the password
        try {
            results = await client.query(`INSERT INTO users
            (username, password, created_on)
            VALUES ($1, $2, CURRENT_TIMESTAMP)
            RETURNING *;`,
            [params.username, params.password]);
        } catch (error) {
            if (error.code == duplicationErrorCode && error.detail == `Key (username)=(${params.username}) already exists.`) {
                return userAlreadyExistMessage;
            }
        }
         
        if (results.rowCount > 0) {
            let session = results.rows[0];
            delete session["password"];
            session["token"] = auth.DEV_SESSION_TOKEN;
            return session;
        } else {
            return userOrPasswordIncorrectMessage;
        }        
    },

    checkUserLogin : async function (params) {
        if (this.hasEmptyLoginFields(params)) {
            return userOrPasswordEmpty;
        }
        let results = await client.query(`SELECT username, created_on FROM users
        WHERE username = $1 AND password = $2`,
        [params.username, params.password]);
        
        if (results.rowCount > 0) {
            let session = results.rows[0];
            session["token"] = auth.DEV_SESSION_TOKEN;
            return session;
        } else {
            return userOrPasswordIncorrectMessage;
        }        
    }
}