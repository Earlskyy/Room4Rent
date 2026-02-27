const pool = require('../db/connection');

// Get bills for tenant
const getTenantBills = async (req, res) => {
  try {
    const { tenant_id } = req.params;
    const result = await pool.query(
      `SELECT * FROM bills WHERE tenant_id = $1 ORDER BY year DESC, month DESC`,
      [tenant_id]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Get tenant bills error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get current bill for tenant
const getCurrentBill = async (req, res) => {
  try {
    const { tenant_id } = req.params;
    const now = new Date();
    const month = now.getMonth() + 1;
    const year = now.getFullYear();

    const result = await pool.query(
      `SELECT * FROM bills WHERE tenant_id = $1 AND month = $2 AND year = $3`,
      [tenant_id, month, year]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'No bill found for current month' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Get current bill error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all bills (admin)
const getAllBills = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT b.*, t.user_id, u.name, u.email, r.room_name,
             COALESCE(SUM(p.amount_paid), 0) as amount_paid
      FROM bills b
      JOIN tenants t ON b.tenant_id = t.id
      JOIN users u ON t.user_id = u.id
      JOIN rooms r ON t.room_id = r.id
      LEFT JOIN payments p ON b.id = p.bill_id
      GROUP BY b.id, t.user_id, u.name, u.email, r.room_name
      ORDER BY b.year DESC, b.month DESC
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Get all bills error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Generate bill for tenant
const generateBill = async (req, res) => {
  try {
    const { tenant_id, month, year, due_date, billing_period_start, billing_period_end } = req.body;

    if (!tenant_id || !month || !year || !due_date) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Get tenant details
    const tenantResult = await pool.query(
      `SELECT t.*, r.base_rent 
       FROM tenants t
       JOIN rooms r ON t.room_id = r.id
       WHERE t.id = $1`,
      [tenant_id]
    );

    if (tenantResult.rows.length === 0) {
      return res.status(404).json({ message: 'Tenant not found' });
    }

    const tenant = tenantResult.rows[0];
    const room_fee = parseFloat(tenant.base_rent);

    // Get meter reading for the month to get all fees
    const meterResult = await pool.query(
      `SELECT * FROM meter_readings 
       WHERE room_id = $1 AND month = $2 AND year = $3`,
      [tenant.room_id, month, year]
    );

    let electricity_fee = 0;
    let water_fee = 0;
    let internet_fee = 0;

    if (meterResult.rows.length > 0) {
      const meter = meterResult.rows[0];

      // Calculate electricity fee
      if (meter.current_reading && meter.previous_reading && meter.rate_per_kwh) {
        const usage = parseFloat(meter.current_reading) - parseFloat(meter.previous_reading);
        electricity_fee = usage * parseFloat(meter.rate_per_kwh);
      }

      // Calculate water fee
      if (meter.water_number_of_people && meter.water_fee_per_head) {
        water_fee = parseFloat(meter.water_number_of_people) * parseFloat(meter.water_fee_per_head);
      }

      // Calculate internet fee
      if (meter.internet_number_of_devices && meter.internet_fee_per_device) {
        internet_fee =
          parseFloat(meter.internet_number_of_devices) * parseFloat(meter.internet_fee_per_device);
      }
    }

    const total_amount = room_fee + internet_fee + water_fee + electricity_fee;

    // Check if bill already exists
    const existingBill = await pool.query(
      `SELECT id FROM bills WHERE tenant_id = $1 AND month = $2 AND year = $3`,
      [tenant_id, month, year]
    );

    let result;
    if (existingBill.rows.length > 0) {
      // Update existing bill
      result = await pool.query(
        `UPDATE bills SET 
          room_fee = $1, internet_fee = $2, water_fee = $3, electricity_fee = $4,
          total_amount = $5, due_date = $6, billing_period_start = $7, billing_period_end = $8, status = 'unpaid'
         WHERE tenant_id = $9 AND month = $10 AND year = $11 RETURNING *`,
        [room_fee, internet_fee, water_fee, electricity_fee, total_amount, due_date, billing_period_start, billing_period_end, tenant_id, month, year]
      );
    } else {
      // Create new bill
      result = await pool.query(
        `INSERT INTO bills (tenant_id, room_fee, internet_fee, water_fee, electricity_fee, total_amount, due_date, billing_period_start, billing_period_end, month, year)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *`,
        [tenant_id, room_fee, internet_fee, water_fee, electricity_fee, total_amount, due_date, billing_period_start, billing_period_end, month, year]
      );
    }

    res.status(201).json({
      message: 'Bill generated successfully',
      bill: result.rows[0],
    });
  } catch (error) {
    console.error('Generate bill error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update bill status
const updateBillStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['paid', 'unpaid', 'overdue'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const result = await pool.query('UPDATE bills SET status = $1 WHERE id = $2 RETURNING *', [
      status,
      id,
    ]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Bill not found' });
    }

    res.json({
      message: 'Bill status updated successfully',
      bill: result.rows[0],
    });
  } catch (error) {
    console.error('Update bill status error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Record payment
const recordPayment = async (req, res) => {
  try {
    const { bill_id, amount_paid, payment_date, payment_method } = req.body;

    if (!bill_id || !amount_paid || !payment_method) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Get bill details
    const billResult = await pool.query('SELECT * FROM bills WHERE id = $1', [bill_id]);
    if (billResult.rows.length === 0) {
      return res.status(404).json({ message: 'Bill not found' });
    }

    const bill = billResult.rows[0];

    // Use current timestamp if payment_date not provided, otherwise use NOW() to capture full timestamp
    const finalPaymentDate = payment_date ? new Date(payment_date) : new Date();

    // Record payment
    const paymentResult = await pool.query(
      `INSERT INTO payments (bill_id, amount_paid, payment_date, payment_method)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [bill_id, amount_paid, finalPaymentDate, payment_method]
    );

    // Get total paid amount
    const totalPaidResult = await pool.query(
      'SELECT SUM(amount_paid) as total FROM payments WHERE bill_id = $1',
      [bill_id]
    );

    const totalPaid = parseFloat(totalPaidResult.rows[0].total) || 0;

    // Update bill status based on payment
    let newStatus = 'unpaid';
    if (totalPaid >= bill.total_amount) {
      newStatus = 'paid';
    } else if (totalPaid > 0) {
      newStatus = 'partially paid';
    }

    await pool.query('UPDATE bills SET status = $1 WHERE id = $2', [newStatus, bill_id]);

    res.status(201).json({
      message: 'Payment recorded successfully',
      payment: paymentResult.rows[0],
      bill_status: newStatus,
      total_paid: totalPaid,
    });
  } catch (error) {
    console.error('Record payment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get payment history for bill
const getPaymentHistory = async (req, res) => {
  try {
    const { bill_id } = req.params;
    const result = await pool.query(
      'SELECT * FROM payments WHERE bill_id = $1 ORDER BY payment_date DESC',
      [bill_id]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Get payment history error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getTenantBills,
  getCurrentBill,
  getAllBills,
  generateBill,
  updateBillStatus,
  recordPayment,
  getPaymentHistory,
};
