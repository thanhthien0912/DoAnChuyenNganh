const mongoose = require('mongoose');
const Wallet = require('./src/models/Wallet');
const Transaction = require('./src/models/Transaction');

async function testTransaction() {
  try {
    await mongoose.connect('mongodb://localhost:27017/student_wallet', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    console.log('Connected to MongoDB');

    // Find a wallet with transactions
    const wallet = await Wallet.findOne({ 
      dailySpent: { $gt: 0 } 
    });

    if (!wallet) {
      console.log('No wallet with transactions found');
      await mongoose.disconnect();
      return;
    }

    console.log('\n=== Before Transaction ===');
    console.log('Wallet ID:', wallet._id);
    console.log('User ID:', wallet.userId);
    console.log('Balance:', wallet.balance);
    console.log('Daily Spent:', wallet.dailySpent);
    console.log('Monthly Spent:', wallet.monthlySpent);
    console.log('Last Transaction Date:', wallet.lastTransactionDate);

    // Simulate a transaction
    const testAmount = 15000;
    console.log(`\n=== Simulating transaction: ${testAmount} VND ===`);

    // Update wallet using processTransaction method
    wallet.processTransaction(testAmount, 'payment');
    await wallet.save();

    // Reload wallet to see the changes
    const updatedWallet = await Wallet.findById(wallet._id);

    console.log('\n=== After Transaction ===');
    console.log('Balance:', updatedWallet.balance);
    console.log('Daily Spent:', updatedWallet.dailySpent);
    console.log('Monthly Spent:', updatedWallet.monthlySpent);
    console.log('Last Transaction Date:', updatedWallet.lastTransactionDate);

    console.log('\n=== Verification ===');
    console.log('Daily Spent increased by:', parseFloat(updatedWallet.dailySpent) - parseFloat(wallet.dailySpent));
    console.log('Monthly Spent increased by:', parseFloat(updatedWallet.monthlySpent) - parseFloat(wallet.monthlySpent));
    console.log('Expected increase:', testAmount);

    await mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

testTransaction();
