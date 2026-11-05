const db = require('../config/db');


// Get all cart items of the logged-in customer
exports.get = async (req, res) => {

    const [r] = await db.query(
        `SELECT
            ci.cart_item_id,
            ci.product_id,
            ci.quantity,
            ci.price,
            p.product_name,
            p.image,
            p.stock_quantity
        FROM cart c
        JOIN cart_items ci ON ci.cart_id = c.cart_id
        JOIN products p ON p.product_id = ci.product_id
        WHERE c.customer_id = ?`,
        [req.user.id]
    );

    res.json(r);
};


// Add a product to cart
exports.add = async (req, res) => {

    const {
        product_id,
        quantity = 1
    } = req.body;

    const conn = await db.getConnection();

    try {
        // Start database transaction
        await conn.beginTransaction();

        // Check product availability and lock the row
        const [[p]] = await conn.query(
            `SELECT price, stock_quantity
            FROM products
            WHERE product_id = ? AND status = 'active'
            FOR UPDATE`,
            [product_id]
        );

        if (!p || p.stock_quantity < quantity) {
            throw Error('Product unavailable or insufficient stock');
        }

        // Find customer's cart
        let [[c]] = await conn.query(
            'SELECT cart_id FROM cart WHERE customer_id = ?',
            [req.user.id]
        );

        // Create cart if it does not exist
        if (!c) {

            const [x] = await conn.query(
                'INSERT INTO cart(customer_id) VALUES(?)',
                [req.user.id]
            );

            c = {
                cart_id: x.insertId
            };
        }

        // Check whether product already exists in cart
        const [found] = await conn.query(
            `SELECT cart_item_id, quantity
            FROM cart_items
            WHERE cart_id = ? AND product_id = ?`,
            [c.cart_id, product_id]
        );

        if (found.length) {

            // Increase existing product quantity
            await conn.query(
                `UPDATE cart_items
                SET quantity = quantity + ?
                WHERE cart_item_id = ?`,
                [
                    quantity,
                    found[0].cart_item_id
                ]
            );

        } else {

            // Insert new product into cart
            await conn.query(
                `INSERT INTO cart_items
                (cart_id, product_id, quantity, price)
                VALUES (?, ?, ?, ?)`,
                [
                    c.cart_id,
                    product_id,
                    quantity,
                    p.price
                ]
            );
        }

        // Commit transaction
        await conn.commit();

        res.status(201).json({
            message: 'Added to cart'
        });

    } catch (e) {

        // Rollback if any error occurs
        await conn.rollback();

        res.status(400).json({
            message: e.message
        });

    } finally {

        // Release database connection
        conn.release();
    }
};


// Update cart item quantity
exports.update = async (req, res) => {

    const q = Number(req.body.quantity);

    // Validate quantity
    if (!Number.isInteger(q) || q < 1) {
        return res.status(400).json({
            message: 'Quantity must be at least 1'
        });
    }

    const [r] = await db.query(
        `UPDATE cart_items ci
        JOIN cart c ON c.cart_id = ci.cart_id
        SET ci.quantity = ?
        WHERE ci.cart_item_id = ? AND c.customer_id = ?`,
        [
            q,
            req.params.id,
            req.user.id
        ]
    );

    res.json({
        message: 'Cart updated'
    });
};


// Remove an item from cart
exports.remove = async (req, res) => {

    await db.query(
        `DELETE ci
        FROM cart_items ci
        JOIN cart c ON c.cart_id = ci.cart_id
        WHERE ci.cart_item_id = ? AND c.customer_id = ?`,
        [
            req.params.id,
            req.user.id
        ]
    );

    res.json({
        message: 'Item removed'
    });
};
