const db = require('../config/db');

// Get all active products with search, category, price filters and sorting
exports.list = async (req, res) => {
    try {
        let sql = `
            SELECT 
                p.*,
                c.category_name,
                s.name AS seller_name
            FROM products p
            JOIN categories c ON c.category_id = p.category_id
            JOIN users s ON s.user_id = p.seller_id
            WHERE p.status = 'active'
            AND s.status = 'active'
        `;

        let v = [];

        // Search by product name
        if (req.query.search) {
            sql += ' AND p.product_name LIKE ?';
            v.push('%' + req.query.search + '%');
        }

        // Filter by category
        if (req.query.category) {
            sql += ' AND p.category_id = ?';
            v.push(req.query.category);
        }

        // Minimum price filter
        if (req.query.min) {
            sql += ' AND p.price >= ?';
            v.push(Number(req.query.min));
        }

        // Maximum price filter
        if (req.query.max) {
            sql += ' AND p.price <= ?';
            v.push(Number(req.query.max));
        }

        // Sorting
        const sort = {
            price_asc: 'p.price ASC',
            price_desc: 'p.price DESC',
            newest: 'p.created_at DESC'
        }[req.query.sort] || 'p.created_at DESC';

        sql += ' ORDER BY ' + sort;

        const [rows] = await db.query(sql, v);

        res.json(rows);

    } catch (e) {
        res.status(500).json({
            message: 'Could not load products'
        });
    }
};


// Get a single product by ID
exports.get = async (req, res) => {

    const [r] = await db.query(
        `SELECT 
            p.*,
            c.category_name,
            s.name AS seller_name
        FROM products p
        JOIN categories c ON c.category_id = p.category_id
        JOIN users s ON s.user_id = p.seller_id
        WHERE p.product_id = ?`,
        [req.params.id]
    );

    if (!r.length) {
        return res.status(404).json({
            message: 'Product not found'
        });
    }

    res.json(r[0]);
};


// Create a new product
exports.create = async (req, res) => {

    const {
        category_id,
        product_name,
        description,
        price,
        stock_quantity,
        image
    } = req.body;

    if (
        !category_id ||
        !product_name ||
        Number(price) <= 0 ||
        Number(stock_quantity) < 0
    ) {
        return res.status(400).json({
            message: 'Valid category, name, positive price and non-negative stock are required'
        });
    }

    const [r] = await db.query(
        `INSERT INTO products
        (seller_id, category_id, product_name, description, price, stock_quantity, image)
        VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
            req.user.id,
            category_id,
            product_name,
            description || '',
            price,
            stock_quantity,
            image || ''
        ]
    );

    res.status(201).json({
        message: 'Product created',
        product_id: r.insertId
    });
};


// Update an existing product
exports.update = async (req, res) => {

    const [r] = await db.query(
        'SELECT seller_id FROM products WHERE product_id = ?',
        [req.params.id]
    );

    if (!r.length) {
        return res.status(404).json({
            message: 'Product not found'
        });
    }

    // Check whether the seller owns the product
    if (
        req.user.role === 'seller' &&
        r[0].seller_id !== req.user.id
    ) {
        return res.status(403).json({
            message: 'Not your product'
        });
    }

    const {
        category_id,
        product_name,
        description,
        price,
        stock_quantity,
        image,
        status
    } = req.body;

    await db.query(
        `UPDATE products
        SET 
            category_id = ?,
            product_name = ?,
            description = ?,
            price = ?,
            stock_quantity = ?,
            image = ?,
            status = COALESCE(?, status)
        WHERE product_id = ?`,
        [
            category_id,
            product_name,
            description,
            price,
            stock_quantity,
            image,
            status || null,
            req.params.id
        ]
    );

    res.json({
        message: 'Product updated'
    });
};


// Delete (deactivate) a product
exports.remove = async (req, res) => {

    const [r] = await db.query(
        'SELECT seller_id FROM products WHERE product_id = ?',
        [req.params.id]
    );

    if (!r.length) {
        return res.status(404).json({
            message: 'Product not found'
        });
    }

    // Check whether the seller owns the product
    if (
        req.user.role === 'seller' &&
        r[0].seller_id !== req.user.id
    ) {
        return res.status(403).json({
            message: 'Not your product'
        });
    }

    await db.query(
        "UPDATE products SET status = 'inactive' WHERE product_id = ?",
        [req.params.id]
    );

    res.json({
        message: 'Product deactivated'
    });
};