const r = require('express').Router(),
    c = require('../controllers/superAdminController'),
    a = require('../middleware/auth'),
    role = require('../middleware/roleCheck');

r.use(a, role('superadmin'));

r.get('/dashboard', c.dashboard);

r.get('/admins', c.admins);
r.post('/admins', c.createAdmin);
r.put('/admins/:id', c.updateAdmin);
r.delete('/admins/:id', c.deleteAdmin);

r.get('/logs', c.logs);

r.get('/settings', c.settings);
r.put('/settings', c.updateSettings);

module.exports = r;