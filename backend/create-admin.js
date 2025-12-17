const bcrypt = require('bcryptjs');
const { query } = require('./config/db');

async function createAdmin() {
  console.log('🔧 Creating Admin User...\n');

  try {
    // Admin details
    const firstName = 'Yihune';
    const lastName = 'Belay';
    const email = 'yihunebelay@gmail.com';
    const password = 'Yihune@123';
    const roleId = 1; // Admin role

    // Check if user already exists
    console.log('1️⃣ Checking if user already exists...');
    const existingUsers = await query(
      'SELECT * FROM staff WHERE email = ?',
      [email]
    );

    if (existingUsers && existingUsers.length > 0) {
      console.log('⚠️  User already exists with this email!');
      console.log('   Updating password instead...\n');

      // Hash the new password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // Update existing user
      await query(
        'UPDATE staff SET password = ?, first_name = ?, last_name = ?, is_active = 1 WHERE email = ?',
        [hashedPassword, firstName, lastName, email]
      );

      console.log('✅ Admin user updated successfully!');
    } else {
      console.log('✅ No existing user found. Creating new admin...\n');

      // Hash the password
      console.log('2️⃣ Hashing password...');
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      console.log('✅ Password hashed successfully!\n');

      // Insert new admin user
      console.log('3️⃣ Inserting admin user into database...');
      await query(
        `INSERT INTO staff (first_name, last_name, email, password, role_id, is_active)
         VALUES (?, ?, ?, ?, ?, 1)`,
        [firstName, lastName, email, hashedPassword, roleId]
      );

      console.log('✅ Admin user created successfully!\n');
    }

    // Verify the user was created/updated
    console.log('4️⃣ Verifying user...');
    const users = await query(
      `SELECT s.staff_id, s.first_name, s.last_name, s.email, s.role_id, s.is_active,
              r.role_name
       FROM staff s
       JOIN roles r ON s.role_id = r.role_id
       WHERE s.email = ?`,
      [email]
    );

    if (users && users.length > 0) {
      const user = users[0];
      console.log('✅ User verified in database:');
      console.log(`   Staff ID: ${user.staff_id}`);
      console.log(`   Name: ${user.first_name} ${user.last_name}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Role: ${user.role_name} (ID: ${user.role_id})`);
      console.log(`   Active: ${user.is_active ? 'Yes' : 'No'}`);
      console.log('');

      // Test password
      console.log('5️⃣ Testing password...');
      const passwordTest = await query(
        'SELECT password FROM staff WHERE email = ?',
        [email]
      );
      
      const isMatch = await bcrypt.compare(password, passwordTest[0].password);
      if (isMatch) {
        console.log('✅ Password verification successful!\n');
      } else {
        console.log('❌ Password verification failed!\n');
      }

      console.log('✨ Admin user setup complete!\n');
      console.log('📝 Login Credentials:');
      console.log(`   Email: ${email}`);
      console.log(`   Password: ${password}`);
      console.log('');
      console.log('🌐 You can now login at: http://localhost:5173');
    } else {
      console.log('❌ Failed to verify user creation!');
    }

    process.exit(0);

  } catch (error) {
    console.error('❌ Error creating admin user:');
    console.error(error.message);
    console.error('\n💡 Troubleshooting:');
    console.error('   1. Make sure MySQL is running');
    console.error('   2. Verify database exists: University_Clinic_Management_System');
    console.error('   3. Check if staff and roles tables exist');
    console.error('   4. Run: mysql -u root -p < config/schema.sql\n');
    process.exit(1);
  }
}

createAdmin();
