const r = require('express').Router(),
    c = require('../controllers/orderController'),
    a = require('../middleware/auth');

r.use(a);

r.post('/', c.create);
r.get('/mine', c.mine);
r.get('/:id', c.get);
r.put('/:id/cancel', c.cancel);

module.exports = r;