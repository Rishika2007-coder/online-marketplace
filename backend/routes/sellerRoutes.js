const r = require('express').Router(),
    c = require('../controllers/sellerController'),
    a = require('../middleware/auth'),
    role = require('../middleware/roleCheck');

r.use(a, role('seller'));

r.get('/dashboard', c.dashboard);
r.get('/products', c.products);
r.get('/orders', c.orders);
r.put('/orders/:id/status', c.status);
r.get('/reports', c.reports);

module.exports = r;