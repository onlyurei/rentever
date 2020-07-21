var facebookID = 'obfuscated';

module.exports = {
    private: {
        facebook: {
            clientID: facebookID,
            clientSecret: 'obfuscated',
            callbackURL: 'http://rentever.com/api/auth/facebookCallback'
        },
        google: {
            server: 'obfuscated'
        },
        prerender: {
            token: 'obfuscated'
        }
    },
    public: {
        facebook: {
            id: facebookID
        },
        google: {
            analytics: 'obfuscated',
            browser: 'obfuscated'
        }
    }
};
