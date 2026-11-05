const db = require('../config/db');

// Get seller dashboard statistics
exports.dashboard = async (req, res) => {

    const [[products]] = await db.query(
        `SELECT 
            COUNT(*) total_products,
            SUM(stock_quantity < 5) low_stock
        FROM products
        WHERE seller_id = ? AND status = 'active'`,
        [req.user.id]
    );

    const [[orders]] = await db.query(
        `SELECT 
            COUNT(DISTINCT o.order_id) total_orders,
            COALESCE(SUM(oi.subtotal), 0) revenue
        FROM orders o
        JOIN order_items oi ON oi.order_id = o.order_id
        WHERE oi.seller_id = ?`,
        [req.user.id]
    );

    res.json({
        ...products,
        ...orders
    });
};


// Get all products belonging to the seller
exports.products = async (req, res) => {

    const [r] = await db.query(
        `SELECT * FROM products
        WHERE seller_id = ?
        ORDER BY created_at DESC`,
        [req.user.id]
    );

    res.json(r);
};


// Get all orders containing the seller's products
exports.orders = async (req, res) => {

    const [r] = await db.query(
        `SELECT 
            o.order_id,
            o.order_date,
            o.order_status,
            oi.product_id,
            oi.quantity,
            oi.subtotal,
            p.product_name
        FROM orders o
        JOIN order_items oi ON oi.order_id = o.order_id
        JOIN products p ON p.product_id = oi.product_id
        WHERE oi.seller_id = ?
        ORDER BY o.order_date DESC`,
        [req.user.id]
    );

    res.json(r);
};


// Update order status
exports.status = async (req, res) => {

    const { status } = req.body;

    if (!['processing', 'shipped', 'delivered'].includes(status)) {
        return res.status(400).json({
            message: 'Invalid status'
        });
    }

    const [r] = await db.query(
        `UPDATE orders o
        JOIN order_items oi ON oi.order_id = o.order_id
        SET o.order_status = ?
        WHERE o.order_id = ? AND oi.seller_id = ?`,
        [
            status,
            req.params.id,
            req.user.id
        ]
    );

    res.json({
        message: r.affectedRows
            ? 'Order status updated'
            : 'Order not found'
    });
};


// Get seller revenue reports for the last 30 days
exports.reports = async (req, res) => {

    const [r] = await db.query(
        `SELECT 
            DATE(o.order_date) day,
            SUM(oi.subtotal) revenue,
            COUNT(DISTINCT o.order_id) orders_count
        FROM orders o
        JOIN order_items oi ON oi.order_id = o.order_id
        WHERE oi.seller_id = ?
        GROUP BY DATE(o.order_date)
        ORDER BY day DESC
        LIMIT 30`,
        [req.user.id]
    );

    res.json(r);
};