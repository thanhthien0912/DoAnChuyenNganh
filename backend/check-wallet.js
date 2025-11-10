const mongoose = require('mongoose');
const Wallet = require('./src/models/Wallet');

async function checkWallets() {
  try {
    await mongoose.connect('mongodb://localhost:27017/student_wallet', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    console.log('Connected to MongoDB');

    const wallets = await Wallet.find({}).limit(5);
    
    console.log('\n=== First 5 Wallets ===');
    wallets.forEach((wallet, index) => {
      console.log(`\nWallet ${index + 1}:`);
      console.log('  User ID:', wallet.userId);
      console.log('  Balance:', wallet.balance);
      console.log('  Daily Spent:', wallet.dailySpent);
      console.log('  Monthly Spent:', wallet.monthlySpent);
      console.log('  Last Transaction Date:', wallet.lastTransactionDate);
      console.log('  Last Reset Date:', wallet.lastResetDate);
    });

    await mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkWallets();
