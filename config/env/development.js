module.exports = {
    port: 1337,
    appconfs: {
        url: 'http://localhost:1337',
        isTest: false,
        s3Prefix: '//s3-us-west-2.amazonaws.com/rentever/'
    },
    models: {
        connection: 'localMongoDB',
        migrate: 'safe',
        schema: true
    },
    session: {
        adapter: 'mongo',
        host: 'localhost',
        port: 27017,
        db: 'rentever',
        collection: 'sessions',
        autoReconnect: true
    }
};
