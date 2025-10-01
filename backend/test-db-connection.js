const mongoose = require('mongoose');

// Test database connection
async function testConnection() {
  try {
    const MONGODB_URI = 'mongodb://localhost:27017/student_wallet';

    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('✅ Connected to MongoDB successfully!');

    // Test database operations
    const db = mongoose.connection.db;

    // List collections
    const collections = await db.listCollections().toArray();
    console.log('📁 Collections:', collections.map(c => c.name));

    // Test user count
    const userCount = await db.collection('users').countDocuments();
    console.log('👥 Users in database:', userCount);

    // Close connection
    await mongoose.connection.close();
    console.log('🔌 Connection closed');

  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Make sure MongoDB is running');
    console.log('2. Check if MongoDB service is started: net start MongoDB');
    console.log('3. Verify database name: student_wallet');
    console.log('4. Check MongoDB port: 27017');
  }
}

testConnection();