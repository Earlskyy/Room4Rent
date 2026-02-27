const pool = require('./connection');
const { hashPassword } = require('../utils/auth');

const initializeDatabase = async () => {
  try {
    console.log('Initializing database schema...');

    // Create users table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(50) NOT NULL DEFAULT 'tenant',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✓ Users table created');

    // Create rooms table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS rooms (
        id SERIAL PRIMARY KEY,
        room_name VARCHAR(255) NOT NULL UNIQUE,
        base_rent DECIMAL(10, 2) NOT NULL,
        internet_fee DECIMAL(10, 2) NOT NULL DEFAULT 0,
        status VARCHAR(50) NOT NULL DEFAULT 'vacant',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✓ Rooms table created');

    // Create tenants table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS tenants (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        room_id INTEGER NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
        contact_number VARCHAR(20),
        number_of_occupants INTEGER NOT NULL DEFAULT 1,
        move_in_date DATE NOT NULL,
        move_out_date DATE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✓ Tenants table created');

    // Create meter_readings table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS meter_readings (
        id SERIAL PRIMARY KEY,
        room_id INTEGER NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
        previous_reading DECIMAL(10, 2),
        current_reading DECIMAL(10, 2),
        rate_per_kwh DECIMAL(10, 4),
        water_number_of_people INTEGER,
        water_fee_per_head DECIMAL(10, 2),
        internet_number_of_devices INTEGER,
        internet_fee_per_device DECIMAL(10, 2),
        month INTEGER NOT NULL,
        year INTEGER NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(room_id, month, year)
      )
    `);
    console.log('✓ Meter readings table created');

    // Add columns to meter_readings if they don't exist
    try {
      await pool.query(`
        ALTER TABLE meter_readings ADD COLUMN IF NOT EXISTS water_number_of_people INTEGER
      `);
      await pool.query(`
        ALTER TABLE meter_readings ADD COLUMN IF NOT EXISTS water_fee_per_head DECIMAL(10, 2)
      `);
      await pool.query(`
        ALTER TABLE meter_readings ADD COLUMN IF NOT EXISTS internet_number_of_devices INTEGER
      `);
      await pool.query(`
        ALTER TABLE meter_readings ADD COLUMN IF NOT EXISTS internet_fee_per_device DECIMAL(10, 2)
      `);
    } catch (e) {
      // Columns might already exist
    }

    // Create bills table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS bills (
        id SERIAL PRIMARY KEY,
        tenant_id INTEGER NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
        room_fee DECIMAL(10, 2) NOT NULL,
        internet_fee DECIMAL(10, 2) NOT NULL DEFAULT 0,
        water_fee DECIMAL(10, 2) NOT NULL DEFAULT 0,
        electricity_fee DECIMAL(10, 2) NOT NULL DEFAULT 0,
        total_amount DECIMAL(10, 2) NOT NULL,
        due_date DATE NOT NULL,
        billing_period_start DATE,
        billing_period_end DATE,
        status VARCHAR(50) NOT NULL DEFAULT 'unpaid',
        month INTEGER NOT NULL,
        year INTEGER NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(tenant_id, month, year)
      )
    `);
    console.log('✓ Bills table created');

    // Add billing period columns to bills if they don't exist
    try {
      await pool.query(`
        ALTER TABLE bills ADD COLUMN IF NOT EXISTS billing_period_start DATE
      `);
      await pool.query(`
        ALTER TABLE bills ADD COLUMN IF NOT EXISTS billing_period_end DATE
      `);
    } catch (e) {
      // Columns might already exist
    }

    // Create payments table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS payments (
        id SERIAL PRIMARY KEY,
        bill_id INTEGER NOT NULL REFERENCES bills(id) ON DELETE CASCADE,
        amount_paid DECIMAL(10, 2) NOT NULL,
        payment_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        payment_method VARCHAR(50) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✓ Payments table created');

    // Create announcements table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS announcements (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        content TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✓ Announcements table created');

    // Create default admin user
    console.log('\nCreating default admin user...');
    const adminEmail = 'admin@room4rent.com';
    const adminPassword = 'admin123';
    
    const existingAdmin = await pool.query('SELECT id FROM users WHERE email = $1', [adminEmail]);
    
    if (existingAdmin.rows.length === 0) {
      const hashedPassword = await hashPassword(adminPassword);
      await pool.query(
        'INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4)',
        ['Admin User', adminEmail, hashedPassword, 'admin']
      );
      console.log('✓ Admin user created');
      console.log(`  Email: ${adminEmail}`);
      console.log(`  Password: ${adminPassword}`);
    } else {
      console.log('✓ Admin user already exists');
    }

    // Create default room and tenant user
    console.log('\nCreating default room and tenant...');
    
    // Check if default room exists
    const existingRoom = await pool.query('SELECT id FROM rooms WHERE room_name = $1', ['Room 1']);
    let roomId;
    
    if (existingRoom.rows.length === 0) {
      const roomResult = await pool.query(
        'INSERT INTO rooms (room_name, base_rent, internet_fee, status) VALUES ($1, $2, $3, $4) RETURNING id',
        ['Room 1', 5000, 500, 'occupied']
      );
      roomId = roomResult.rows[0].id;
      console.log('✓ Default room created (Room 1)');
    } else {
      roomId = existingRoom.rows[0].id;
      console.log('✓ Default room already exists');
    }

    // Check if tenant user exists
    const tenantEmail = 'tenant@room4rent.com';
    const tenantPassword = 'tenant123';
    
    const existingTenant = await pool.query('SELECT id FROM users WHERE email = $1', [tenantEmail]);
    let tenantUserId;
    
    if (existingTenant.rows.length === 0) {
      const hashedPassword = await hashPassword(tenantPassword);
      const tenantResult = await pool.query(
        'INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING id',
        ['Sample Tenant', tenantEmail, hashedPassword, 'tenant']
      );
      tenantUserId = tenantResult.rows[0].id;
      console.log('✓ Tenant user created');
      console.log(`  Email: ${tenantEmail}`);
      console.log(`  Password: ${tenantPassword}`);
    } else {
      tenantUserId = existingTenant.rows[0].id;
      console.log('✓ Tenant user already exists');
    }

    // Check if tenant assignment exists
    const existingAssignment = await pool.query('SELECT id FROM tenants WHERE user_id = $1 AND room_id = $2', [tenantUserId, roomId]);
    
    if (existingAssignment.rows.length === 0) {
      const today = new Date().toISOString().split('T')[0];
      await pool.query(
        'INSERT INTO tenants (user_id, room_id, contact_number, number_of_occupants, move_in_date) VALUES ($1, $2, $3, $4, $5)',
        [tenantUserId, roomId, '09123456789', 1, today]
      );
      console.log('✓ Tenant assigned to Room 1');
    } else {
      console.log('✓ Tenant already assigned to room');
    }

    console.log('\n✅ Database schema initialized successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error initializing database:', error);
    process.exit(1);
  }
};

initializeDatabase();
