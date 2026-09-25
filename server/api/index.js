const app = require('../app');

module.exports = (req, res) => {
    if (!req.url.startsWith('/api')) {
        req.url = '/api' + (req.url || '/');
    }

    return app(req, res);
};