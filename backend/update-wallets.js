const mongoose = require('mongoose');
const Wallet = require('./src/models/Wallet');
const Transaction = require('./src/models/Transaction');

async function updateWallets() {
  try {
    await mongoose.connect('mongodb://localhost:27017/student_wallet', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    console.log('Connected to MongoDB');

    // Get all wallets
    const wallets = await Wallet.find({});
    console.log(`Found ${wallets.length} wallets`);

    // Update each wallet
    for (const wallet of wallets) {
      console.log(`\nUpdating wallet for user: ${wallet.userId}`);
      
      // Find last payment transaction for this wallet
      const lastTransaction = await Transaction.findOne({
        walletId: wallet._id,
        type: { $in: ['PAYMENT', 'payment'] },
        status: 'COMPLETED'
      }).sort({ createdAt: -1 });

      if (lastTransaction) {
        console.log(`  Last transaction: ${lastTransaction.createdAt}`);
        wallet.lastTransactionDate = lastTransaction.createdAt;
      } else {
        console.log(`  No payment transactions found`);
      }

      // Calculate daily and monthly spent
      const now = new Date();
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

      // Get today's transactions
      const todayTransactions = await Transaction.find({
        walletId: wallet._id,
        type: { $in: ['PAYMENT', 'payment'] },
        status: 'COMPLETED',
        createdAt: { $gte: todayStart }
      });

      const dailySpent = todayTransactions.reduce((sum, tx) => 
        sum + parseFloat(tx.amount.toString()), 0
      );

      // Get this month's transactions
      const monthTransactions = await Transaction.find({
        walletId: wallet._id,
        type: { $in: ['PAYMENT', 'payment'] },
        status: 'COMPLETED',
        createdAt: { $gte: monthStart }
      });

      const monthlySpent = monthTransactions.reduce((sum, tx) => 
        sum + parseFloat(tx.amount.toString()), 0
      );

      console.log(`  Daily spent: ${wallet.dailySpent} -> ${dailySpent}`);
      console.log(`  Monthly spent: ${wallet.monthlySpent} -> ${monthlySpent}`);

      wallet.dailySpent = dailySpent;
      wallet.monthlySpent = monthlySpent;

      await wallet.save();
      console.log(`  ✓ Updated successfully`);
    }

    console.log('\n=== All wallets updated ===');
    await mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

updateWallets();
