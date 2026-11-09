const r = require('express').Router(),
    c = require('../controllers/cartController'),
    a = require('../middleware/auth'),
    role = require('../middleware/roleCheck');

r.use(a, role('customer'));

r.get('/', c.get);
r.post('/', c.add);
r.put('/:id', c.update);
r.delete('/:id', c.remove);

module.exports = r;