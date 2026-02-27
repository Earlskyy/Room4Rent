const pool = require('../db/connection');

// Get meter readings for a room
const getMeterReadings = async (req, res) => {
  try {
    const { room_id } = req.params;
    const result = await pool.query(
      'SELECT * FROM meter_readings WHERE room_id = $1 ORDER BY year DESC, month DESC',
      [room_id]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Get meter readings error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Create or update meter reading
const createMeterReading = async (req, res) => {
  try {
    const {
      room_id,
      previous_reading,
      current_reading,
      rate_per_kwh,
      water_number_of_people,
      water_fee_per_head,
      internet_number_of_devices,
      internet_fee_per_device,
      month,
      year,
    } = req.body;

    if (!room_id || !month || !year) {
      return res.status(400).json({ message: 'Missing required fields: room_id, month, year' });
    }

    // Validate electricity readings if provided
    if (previous_reading !== undefined && current_reading !== undefined) {
      if (current_reading < previous_reading) {
        return res.status(400).json({ message: 'Current reading cannot be less than previous reading' });
      }
    }

    if (!rate_per_kwh && (previous_reading !== undefined || current_reading !== undefined)) {
      return res.status(400).json({ message: 'Rate per kWh is required when providing meter readings' });
    }

    // Check if reading already exists for this period
    const existingReading = await pool.query(
      'SELECT id FROM meter_readings WHERE room_id = $1 AND month = $2 AND year = $3',
      [room_id, month, year]
    );

    let result;
    if (existingReading.rows.length > 0) {
      // Update existing reading
      result = await pool.query(
        `UPDATE meter_readings SET 
          previous_reading = COALESCE($1, previous_reading),
          current_reading = COALESCE($2, current_reading),
          rate_per_kwh = COALESCE($3, rate_per_kwh),
          water_number_of_people = COALESCE($4, water_number_of_people),
          water_fee_per_head = COALESCE($5, water_fee_per_head),
          internet_number_of_devices = COALESCE($6, internet_number_of_devices),
          internet_fee_per_device = COALESCE($7, internet_fee_per_device)
         WHERE room_id = $8 AND month = $9 AND year = $10 RETURNING *`,
        [
          previous_reading,
          current_reading,
          rate_per_kwh,
          water_number_of_people,
          water_fee_per_head,
          internet_number_of_devices,
          internet_fee_per_device,
          room_id,
          month,
          year,
        ]
      );
    } else {
      // Create new reading
      result = await pool.query(
        `INSERT INTO meter_readings (room_id, previous_reading, current_reading, rate_per_kwh, water_number_of_people, water_fee_per_head, internet_number_of_devices, internet_fee_per_device, month, year)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`,
        [
          room_id,
          previous_reading || null,
          current_reading || null,
          rate_per_kwh || null,
          water_number_of_people || null,
          water_fee_per_head || null,
          internet_number_of_devices || null,
          internet_fee_per_device || null,
          month,
          year,
        ]
      );
    }

    res.status(201).json({
      message: 'Meter reading recorded successfully',
      reading: result.rows[0],
    });
  } catch (error) {
    console.error('Create meter reading error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { getMeterReadings, createMeterReading };
