const r = require('express').Router(),
    c = require('../controllers/productController'),
    a = require('../middleware/auth'),
    role = require('../middleware/roleCheck');

r.get('/', c.list);
r.get('/:id', c.get);

r.post('/', a, role('seller', 'admin'), c.create);
r.put('/:id', a, role('seller', 'admin'), c.update);
r.delete('/:id', a, role('seller', 'admin'), c.remove);

module.exports = r;