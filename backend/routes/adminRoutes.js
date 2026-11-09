const r = require('express').Router(),
    c = require('../controllers/adminController'),
    a = require('../middleware/auth'),
    role = require('../middleware/roleCheck');

r.use(a, role('admin', 'superadmin'));

r.get('/dashboard', c.dashboard);

r.get('/customers', c.customers);
r.put('/customers/:id/status', c.customerStatus);

r.get('/sellers', c.sellers);
r.put('/sellers/:id/status', c.sellerStatus);

r.get('/products', c.products);

r.get('/categories', c.categories);
r.post('/categories', c.addCategory);
r.put('/categories/:id', c.updateCategory);
r.delete('/categories/:id', c.deleteCategory);

r.get('/orders', c.orders);

r.get('/reports', c.reports);

module.exports = r;