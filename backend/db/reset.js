const pool = require('./connection');
const { hashPassword } = require('../utils/auth');

const resetDatabase = async () => {
  try {
    console.log('🔄 Starting database reset...\n');

    // Drop tables in reverse order (due to foreign keys)
    const tablesToDrop = [
      'announcements',
      'payments',
      'bills',
      'meter_readings',
      'tenants',
      'rooms',
      'users'
    ];

    for (const table of tablesToDrop) {
      try {
        await pool.query(`DROP TABLE IF EXISTS ${table} CASCADE`);
        console.log(`✓ Dropped ${table} table`);
      } catch (err) {
        console.log(`⚠️ Could not drop ${table}:`, err.message);
      }
    }

    console.log('\n🔨 Creating fresh database schema...\n');

    // Create users table
    await pool.query(`
      CREATE TABLE users (
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
      CREATE TABLE rooms (
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
      CREATE TABLE tenants (
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
      CREATE TABLE meter_readings (
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

    // Create bills table
    await pool.query(`
      CREATE TABLE bills (
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

    // Create payments table
    await pool.query(`
      CREATE TABLE payments (
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
      CREATE TABLE announcements (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        content TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✓ Announcements table created');

    console.log('\n👤 Creating new admin account...\n');

    // Create the new admin user with specified credentials
    const adminEmail = 'Admin@gmail.com';
    const adminPassword = 'awdswadqe123';
    
    const hashedPassword = await hashPassword(adminPassword);
    await pool.query(
      'INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4)',
      ['Admin', adminEmail, hashedPassword, 'admin']
    );
    
    console.log('✅ Admin account created successfully!');
    console.log(`   📧 Email: ${adminEmail}`);
    console.log(`   🔐 Password: ${adminPassword}`);

    console.log('\n✨ Database reset complete! Ready to start fresh.\n');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error resetting database:', error);
    process.exit(1);
  }
};

resetDatabase();
