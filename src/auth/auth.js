module.exports = {
    authErroMessage : { message: process.env.SERVER_INVALID_TOKEN_ERROR_MESSAGE },
    DEV_SESSION_TOKEN : "rv5aJOVOLr72YzZEXAs8",
    isTokenValid: function(token) {
        return token === this.DEV_SESSION_TOKEN;
    }
}