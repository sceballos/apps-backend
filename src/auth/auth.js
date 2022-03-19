const secret = "s9IsC7LZachiP6GkWysOiy0SXO14jbv9QqpMRsmjqUwUe"

module.exports = {
    hashPassword : async function (password) {
        const { createHmac } = await import('crypto');

        const hash = createHmac('sha256', secret)
               .update(password)
               .digest('hex');
        return hash;
    },

    authErroMessage : { message: process.env.SERVER_INVALID_TOKEN_ERROR_MESSAGE },
    DEV_SESSION_TOKEN : "rv5aJOVOLr72YzZEXAs8",
    isTokenValid: function(token) {
        return token === this.DEV_SESSION_TOKEN;
    }
}