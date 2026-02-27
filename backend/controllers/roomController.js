const pool = require('../db/connection');

// Get all rooms
const getRooms = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM rooms ORDER BY room_name');
    res.json(result.rows);
  } catch (error) {
    console.error('Get rooms error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get room by ID
const getRoomById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM rooms WHERE id = $1', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Room not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Get room error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Create room
const createRoom = async (req, res) => {
  try {
    const { room_name, base_rent, internet_fee = 0 } = req.body;

    if (!room_name || typeof base_rent !== 'number') {
      return res.status(400).json({ message: 'Invalid room data' });
    }

    const result = await pool.query(
      'INSERT INTO rooms (room_name, base_rent, internet_fee) VALUES ($1, $2, $3) RETURNING *',
      [room_name, base_rent, internet_fee]
    );

    res.status(201).json({
      message: 'Room created successfully',
      room: result.rows[0],
    });
  } catch (error) {
    console.error('Create room error:', error);
    if (error.code === '23505') {
      return res.status(400).json({ message: 'Room name already exists' });
    }
    res.status(500).json({ message: 'Server error' });
  }
};

// Update room
const updateRoom = async (req, res) => {
  try {
    const { id } = req.params;
    const { room_name, base_rent, internet_fee, status } = req.body;

    let query = 'UPDATE rooms SET ';
    const values = [];
    let paramCount = 1;

    if (room_name !== undefined) {
      query += `room_name = $${paramCount++}, `;
      values.push(room_name);
    }
    if (base_rent !== undefined) {
      query += `base_rent = $${paramCount++}, `;
      values.push(base_rent);
    }
    if (internet_fee !== undefined) {
      query += `internet_fee = $${paramCount++}, `;
      values.push(internet_fee);
    }
    if (status !== undefined) {
      query += `status = $${paramCount++}, `;
      values.push(status);
    }

    query = query.slice(0, -2); // Remove last comma
    query += ` WHERE id = $${paramCount} RETURNING *`;
    values.push(id);

    const result = await pool.query(query, values);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Room not found' });
    }

    res.json({
      message: 'Room updated successfully',
      room: result.rows[0],
    });
  } catch (error) {
    console.error('Update room error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete room
const deleteRoom = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if room has tenants
    const tenantCheck = await pool.query('SELECT id FROM tenants WHERE room_id = $1', [id]);
    if (tenantCheck.rows.length > 0) {
      return res.status(400).json({ message: 'Cannot delete room with active tenants' });
    }

    const result = await pool.query('DELETE FROM rooms WHERE id = $1 RETURNING *', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Room not found' });
    }

    res.json({ message: 'Room deleted successfully' });
  } catch (error) {
    console.error('Delete room error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { getRooms, getRoomById, createRoom, updateRoom, deleteRoom };
