module.exports = {
    port: 80,
    appconfs: {
        url: 'http://rentever.com',
        isTest: false,
        s3Prefix: '//s3-us-west-2.amazonaws.com/rentever/'
    },
    http: {
        cache: 259200000 // 3d
    },
    models: {
        connection: 'prodMongoDB',
        migrate: 'safe',
        schema: true
    },
    connections: {
        prodMongoDB: {
            adapter: 'sails-mongo',
            host: 'localhost',
            port: 27017,
            user: 'obfuscated',
            password: 'obfuscated',
            database: 'rentever'
        }
    },
    session: {
        adapter: 'mongo',
        host: 'localhost',
        port: 27017,
        db: 'rentever',
        collection: 'sessions',
        autoReconnect: true,
        username: 'obfuscated',
        password: 'obfuscated'
    }
    //    ssl: {
    //        key: fs.readFileSync('ssl/key.pem'),
    //        cert: fs.readFileSync('ssl/cert.pem')
    //    }
};
