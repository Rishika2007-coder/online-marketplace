const r = require('express').Router(),
    c = require('../controllers/authController'),
    a = require('../middleware/auth');

r.post('/register', c.register);
r.post('/login', c.login);

r.get('/me', a, c.me);
r.put('/profile', a, c.profile);

module.exports = r;