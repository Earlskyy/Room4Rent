const pool = require('../db/connection');
const { hashPassword } = require('../utils/auth');

// Get all tenants
const getTenants = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT t.*, u.name, u.email, r.room_name 
      FROM tenants t
      JOIN users u ON t.user_id = u.id
      JOIN rooms r ON t.room_id = r.id
      WHERE t.move_out_date IS NULL
      ORDER BY t.id
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Get tenants error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get tenant by ID
const getTenantById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(`
      SELECT t.*, u.name, u.email, r.room_name, r.base_rent, r.internet_fee
      FROM tenants t
      JOIN users u ON t.user_id = u.id
      JOIN rooms r ON t.room_id = r.id
      WHERE t.id = $1
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Tenant not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Get tenant error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get tenant by user ID
const getTenantByUserId = async (req, res) => {
  try {
    const { userId } = req.params;
    const result = await pool.query(`
      SELECT t.*, u.name, u.email, r.room_name, r.base_rent, r.internet_fee
      FROM tenants t
      JOIN users u ON t.user_id = u.id
      JOIN rooms r ON t.room_id = r.id
      WHERE t.user_id = $1
    `, [userId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Tenant not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Get tenant error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Create tenant
const createTenant = async (req, res) => {
  try {
    const { name, email, password, room_id, contact_number, number_of_occupants, move_in_date } = req.body;

    if (!name || !email || !password || !room_id || !move_in_date) {
      return res.status(400).json({ message: 'Missing required fields: name, email, password, room_id, move_in_date' });
    }

    // Check if email already exists
    const existingUser = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    // Check if room exists and is available
    const roomResult = await pool.query('SELECT * FROM rooms WHERE id = $1', [room_id]);
    if (roomResult.rows.length === 0) {
      return res.status(404).json({ message: 'Room not found' });
    }

    // Create user account first
    const hashedPassword = await hashPassword(password);
    const userResult = await pool.query(
      'INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING id, name, email',
      [name, email, hashedPassword, 'tenant']
    );
    const userId = userResult.rows[0].id;

    // Create tenant record linked to user
    const tenantResult = await pool.query(
      `INSERT INTO tenants (user_id, room_id, contact_number, number_of_occupants, move_in_date)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [userId, room_id, contact_number || null, number_of_occupants || 1, move_in_date]
    );

    // Update room status to occupied
    await pool.query('UPDATE rooms SET status = $1 WHERE id = $2', ['occupied', room_id]);

    res.status(201).json({
      message: 'Tenant created successfully',
      tenant: {
        ...tenantResult.rows[0],
        name: userResult.rows[0].name,
        email: userResult.rows[0].email,
      }
    });
  } catch (error) {
    console.error('Create tenant error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update tenant
const updateTenant = async (req, res) => {
  try {
    const { id } = req.params;
    const { contact_number, number_of_occupants, move_out_date } = req.body;

    const result = await pool.query(
      `UPDATE tenants SET 
        contact_number = COALESCE($1, contact_number),
        number_of_occupants = COALESCE($2, number_of_occupants),
        move_out_date = COALESCE($3, move_out_date)
       WHERE id = $4 RETURNING *`,
      [contact_number, number_of_occupants, move_out_date, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Tenant not found' });
    }

    // If move_out_date is set, mark room as vacant
    if (move_out_date) {
      await pool.query('UPDATE rooms SET status = $1 WHERE id = $2', [
        'vacant',
        result.rows[0].room_id,
      ]);
    }

    res.json({
      message: 'Tenant updated successfully',
      tenant: result.rows[0],
    });
  } catch (error) {
    console.error('Update tenant error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Remove tenant (soft delete by setting move_out_date)
const removeTenant = async (req, res) => {
  try {
    const { id } = req.params;

    const tenantResult = await pool.query('SELECT room_id FROM tenants WHERE id = $1', [id]);

    if (tenantResult.rows.length === 0) {
      return res.status(404).json({ message: 'Tenant not found' });
    }

    const roomId = tenantResult.rows[0].room_id;

    // Update tenant move_out_date
    await pool.query(
      'UPDATE tenants SET move_out_date = CURRENT_DATE WHERE id = $1',
      [id]
    );

    // Mark room as vacant
    await pool.query('UPDATE rooms SET status = $1 WHERE id = $2', ['vacant', roomId]);

    res.json({ message: 'Tenant removed successfully' });
  } catch (error) {
    console.error('Remove tenant error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getTenants,
  getTenantById,
  getTenantByUserId,
  createTenant,
  updateTenant,
  removeTenant,
};
