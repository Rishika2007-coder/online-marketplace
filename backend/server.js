require('dotenv').config();

const express = require('express'),
    cors = require('cors'),
    path = require('path'),
    db = require('./config/db'),
    logger = require('./middleware/logger');

const app = express();

app.use(cors());
app.use(express.json());
app.use(logger);

app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/cart', require('./routes/cartRoutes'));
app.use('/api/orders', require('./routes/orderRoutes'));
app.use('/api/seller', require('./routes/sellerRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/superadmin', require('./routes/superAdminRoutes'));

app.use(express.static(path.join(__dirname, '../frontend')));

app.get('/api/health', async (req, res) => {
    try {
        await db.query('SELECT 1');
        res.json({
            status: 'ok',
            database: 'connected'
        });
    } catch (e) {
        res.status(500).json({
            status: 'error',
            database: 'disconnected'
        });
    }
});

app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).json({
        message: 'Internal server error'
    });
});

const port = process.env.PORT || 5000;

app.listen(port, () => console.log(`ShopSphere running at http://localhost:${port}`));