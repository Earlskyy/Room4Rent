const pool = require('../db/connection');

// Get dashboard stats (admin)
const getDashboardStats = async (req, res) => {
  try {
    // Total monthly income
    const now = new Date();
    const month = now.getMonth() + 1;
    const year = now.getFullYear();

    const incomeResult = await pool.query(
      `SELECT SUM(total_amount) as total_income FROM bills WHERE month = $1 AND year = $2 AND status = 'paid'`,
      [month, year]
    );

    const totalIncome = parseFloat(incomeResult.rows[0].total_income) || 0;

    // Total unpaid bills
    const unpaidResult = await pool.query(
      'SELECT SUM(total_amount) as total_unpaid FROM bills WHERE status IN ($1, $2)',
      ['unpaid', 'overdue']
    );

    const totalUnpaid = parseFloat(unpaidResult.rows[0].total_unpaid) || 0;

    // Occupied rooms
    const occupiedResult = await pool.query(
      "SELECT COUNT(*) as count FROM rooms WHERE status = 'occupied'"
    );

    const occupiedRooms = parseInt(occupiedResult.rows[0].count);

    // Vacant rooms
    const vacantResult = await pool.query(
      "SELECT COUNT(*) as count FROM rooms WHERE status = 'vacant'"
    );

    const vacantRooms = parseInt(vacantResult.rows[0].count);

    res.json({
      totalIncome,
      totalUnpaid,
      occupiedRooms,
      vacantRooms,
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get monthly income report
const getIncomeReport = async (req, res) => {
  try {
    const { year } = req.query;
    const filterYear = year || new Date().getFullYear();

    const result = await pool.query(`
      SELECT 
        month, 
        SUM(total_amount) as total,
        COUNT(CASE WHEN status = 'paid' THEN 1 END) as paid_count,
        SUM(CASE WHEN status = 'paid' THEN total_amount ELSE 0 END) as paid_amount
      FROM bills
      WHERE year = $1
      GROUP BY month
      ORDER BY month
    `, [filterYear]);

    res.json(result.rows);
  } catch (error) {
    console.error('Get income report error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get unpaid bills report
const getUnpaidBillsReport = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        b.*,
        u.name,
        u.email,
        r.room_name,
        (b.total_amount - COALESCE(SUM(p.amount_paid), 0)) as remaining_balance
      FROM bills b
      JOIN tenants t ON b.tenant_id = t.id
      JOIN users u ON t.user_id = u.id
      JOIN rooms r ON t.room_id = r.id
      LEFT JOIN payments p ON b.id = p.bill_id
      WHERE b.status IN ('unpaid', 'overdue')
      GROUP BY b.id, u.name, u.email, r.room_name
      ORDER BY b.due_date DESC
    `);

    res.json(result.rows);
  } catch (error) {
    console.error('Get unpaid bills report error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get utility usage report
const getUtilityUsageReport = async (req, res) => {
  try {
    const { year } = req.query;
    const filterYear = year || new Date().getFullYear();

    const result = await pool.query(`
      SELECT
        mr.month,
        r.room_name,
        mr.previous_reading,
        mr.current_reading,
        (mr.current_reading - mr.previous_reading) as usage,
        mr.rate_per_kwh,
        ((mr.current_reading - mr.previous_reading) * mr.rate_per_kwh) as electricity_cost,
        b.water_fee
      FROM meter_readings mr
      JOIN rooms r ON mr.room_id = r.id
      LEFT JOIN bills b ON b.month = mr.month AND b.year = mr.year
      WHERE mr.year = $1
      ORDER BY mr.month DESC, r.room_name
    `, [filterYear]);

    res.json(result.rows);
  } catch (error) {
    console.error('Get utility usage report error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getDashboardStats,
  getIncomeReport,
  getUnpaidBillsReport,
  getUtilityUsageReport,
};
