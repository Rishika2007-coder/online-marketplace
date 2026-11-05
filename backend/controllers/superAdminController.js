const db = require('../config/db');
const bcrypt = require('bcryptjs');


// Get admin dashboard statistics
exports.dashboard = async (req, res) => {

    const [[r]] = await db.query(
        `SELECT
            (SELECT COUNT(*) FROM users WHERE role = 'admin') admins,
            (SELECT COUNT(*) FROM users) users,
            (SELECT COALESCE(SUM(total_amount), 0) FROM orders) sales`
    );

    res.json(r);
};


// Get all admins
exports.admins = async (req, res) => {

    const [r] = await db.query(
        `SELECT
            user_id,
            name,
            email,
            status,
            created_at
        FROM users
        WHERE role = 'admin'`
    );

    res.json(r);
};


// Create a new admin
exports.createAdmin = async (req, res) => {

    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({
            message: 'Name, email and password required'
        });
    }

    // Hash the password before storing it
    const hash = await bcrypt.hash(password, 12);

    const [r] = await db.query(
        `INSERT INTO users(name, email, password, role, status)
        VALUES (?, ?, ?, 'admin', 'active')`,
        [name, email, hash]
    );

    // Assign permissions to the new admin
    for (const p of (req.body.permissions || [])) {

        await db.query(
            `INSERT INTO admin_permissions(admin_id, permission_name)
            VALUES (?, ?)`,
            [r.insertId, p]
        );
    }

    res.status(201).json({
        message: 'Admin created'
    });
};


// Update an existing admin
exports.updateAdmin = async (req, res) => {

    const { name, status, permissions } = req.body;

    await db.query(
        `UPDATE users
        SET name = ?, status = ?
        WHERE user_id = ? AND role = 'admin'`,
        [name, status, req.params.id]
    );

    // Update permissions if an array is provided
    if (Array.isArray(permissions)) {

        // Delete existing permissions
        await db.query(
            'DELETE FROM admin_permissions WHERE admin_id = ?',
            [req.params.id]
        );

        // Insert updated permissions
        for (const p of permissions) {

            await db.query(
                `INSERT INTO admin_permissions(admin_id, permission_name)
                VALUES (?, ?)`,
                [req.params.id, p]
            );
        }
    }

    res.json({
        message: 'Admin updated'
    });
};


// Delete an admin
exports.deleteAdmin = async (req, res) => {

    await db.query(
        `DELETE FROM users
        WHERE user_id = ? AND role = 'admin'`,
        [req.params.id]
    );

    res.json({
        message: 'Admin deleted'
    });
};


// Get system activity logs
exports.logs = async (req, res) => {

    const [r] = await db.query(
        `SELECT
            l.*,
            u.name,
            u.email
        FROM system_logs l
        LEFT JOIN users u ON u.user_id = l.user_id
        ORDER BY l.created_at DESC
        LIMIT 500`
    );

    res.json(r);
};


// Get all system settings
exports.settings = async (req, res) => {

    const [r] = await db.query(
        `SELECT setting_key, setting_value
        FROM system_settings`
    );

    res.json(
        Object.fromEntries(
            r.map(x => [x.setting_key, x.setting_value])
        )
    );
};


// Update system settings
exports.updateSettings = async (req, res) => {

    for (const [k, v] of Object.entries(req.body)) {

        await db.query(
            `INSERT INTO system_settings(setting_key, setting_value)
            VALUES (?, ?)
            ON DUPLICATE KEY UPDATE
            setting_value = VALUES(setting_value)`,
            [k, String(v)]
        );
    }

    res.json({
        message: 'Settings saved'
    });
};