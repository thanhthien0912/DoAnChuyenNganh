const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Connect to database
async function setupDatabase() {
  try {
    const MONGODB_URI = 'mongodb://localhost:27017/student_wallet';

    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('✅ Connected to MongoDB successfully!');

    const db = mongoose.connection.db;

    // Clear existing data
    console.log('Clearing existing data...');
    await db.collection('users').deleteMany({});
    await db.collection('wallets').deleteMany({});
    await db.collection('transactions').deleteMany({});

    // Create indexes
    console.log('Creating indexes...');
    await db.collection('users').createIndex({ email: 1 }, { unique: true });
    await db.collection('users').createIndex({ studentId: 1 }, { unique: true });
    await db.collection('wallets').createIndex({ userId: 1 }, { unique: true });
    await db.collection('transactions').createIndex({ referenceNumber: 1 }, { unique: true });

    // Hash passwords
    const adminPassword = await bcrypt.hash('admin123', 12);
    const studentPassword = await bcrypt.hash('student123', 12);

    // Insert admin user
    console.log('Creating admin user...');
    const admin = await db.collection('users').insertOne({
      studentId: "ADMIN001",
      email: "admin@hutech.edu.vn",
      password: adminPassword,
      role: "admin",
      profile: {
        firstName: "System",
        lastName: "Administrator",
        phone: "0900000000"
      },
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    // Insert sample student users
    console.log('Creating student users...');
    const students = await db.collection('users').insertMany([
      {
        studentId: "STU001",
        email: "student1@hutech.edu.vn",
        password: studentPassword,
        role: "student",
        profile: {
          firstName: "Nguyễn",
          lastName: "Văn A",
          phone: "0912345678",
          dateOfBirth: new Date("2000-01-15")
        },
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        studentId: "STU002",
        email: "student2@hutech.edu.vn",
        password: studentPassword,
        role: "student",
        profile: {
          firstName: "Trần",
          lastName: "Thị B",
          phone: "0923456789",
          dateOfBirth: new Date("2001-03-20")
        },
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);

    // Create wallets for all users
    console.log('Creating wallets...');
    const allUsers = await db.collection('users').find({}).toArray();

    for (const user of allUsers) {
      await db.collection('wallets').insertOne({
        userId: user._id,
        balance: user.role === "student" ? 1000000 : 0,
        currency: "VND",
        isActive: true,
        dailyLimit: 10000000,
        monthlyLimit: 100000000,
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }

    // Create sample transactions for students
    console.log('Creating sample transactions...');
    const studentUsers = await db.collection('users').find({ role: "student" }).toArray();

    for (const student of studentUsers) {
      const wallet = await db.collection('wallets').findOne({ userId: student._id });

      // Initial top-up transaction
      await db.collection('transactions').insertOne({
        userId: student._id,
        walletId: wallet._id,
        type: "TOPUP",
        amount: 1000000,
        status: "COMPLETED",
        description: "Initial balance top-up",
        referenceNumber: "TOPUP" + Date.now() + Math.random().toString(36).substr(2, 9),
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }

    console.log('✅ Database setup completed!');
    console.log('\n🔑 Test Credentials:');
    console.log('Admin - Email: admin@hutech.edu.vn, Password: admin123');
    console.log('Student 1 - Email: student1@hutech.edu.vn, Password: student123');
    console.log('Student 2 - Email: student2@hutech.edu.vn, Password: student123');

    // Show statistics
    const userCount = await db.collection('users').countDocuments();
    const walletCount = await db.collection('wallets').countDocuments();
    const transactionCount = await db.collection('transactions').countDocuments();

    console.log('\n📊 Database Statistics:');
    console.log(`Users: ${userCount}`);
    console.log(`Wallets: ${walletCount}`);
    console.log(`Transactions: ${transactionCount}`);

    // Close connection
    await mongoose.connection.close();
    console.log('\n🔌 Connection closed');

  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    console.error(error.stack);
  }
}

setupDatabase();