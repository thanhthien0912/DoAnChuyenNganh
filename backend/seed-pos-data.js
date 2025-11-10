require('dotenv').config();
const mongoose = require('mongoose');
const POSCategory = require('./src/models/POSCategory');
const POSItem = require('./src/models/POSItem');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connected');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

const categories = [
  {
    key: 'BUS',
    name: 'Xe buýt',
    icon: '🚍',
    description: 'Dịch vụ xe buýt trường',
    displayOrder: 1
  },
  {
    key: 'CANTEEN',
    name: 'Căn tin',
    icon: '🍱',
    description: 'Thực phẩm và đồ uống tại căn tin',
    displayOrder: 2
  },
  {
    key: 'VENDING_MACHINE',
    name: 'Máy bán nước',
    icon: '🥤',
    description: 'Đồ uống từ máy bán hàng tự động',
    displayOrder: 3
  }
];

const items = [
  // Bus items
  {
    categoryKey: 'BUS',
    name: 'Vé xe buýt sinh viên',
    description: 'Vé xe buýt ưu đãi dành cho sinh viên',
    price: 3000,
    displayOrder: 1,
    metadata: {
      route: 'Trường - Trung tâm',
      studentOnly: true
    }
  },
  {
    categoryKey: 'BUS',
    name: 'Vé xe buýt 1 lượt',
    description: 'Vé xe buýt đơn từ trường đi trung tâm',
    price: 7000,
    displayOrder: 2,
    metadata: {
      route: 'Trường - Trung tâm'
    }
  },
  {
    categoryKey: 'BUS',
    name: 'Vé xe buýt tuần',
    description: 'Vé xe buýt không giới hạn trong 1 tuần',
    price: 70000,
    displayOrder: 3,
    metadata: {
      route: 'Tất cả tuyến'
    }
  },
  {
    categoryKey: 'BUS',
    name: 'Vé xe buýt tháng',
    description: 'Vé xe buýt không giới hạn trong 1 tháng',
    price: 200000,
    displayOrder: 4,
    metadata: {
      route: 'Tất cả tuyến'
    }
  },
  
  // Canteen items
  {
    categoryKey: 'CANTEEN',
    name: 'Cơm sườn',
    description: 'Cơm trắng với sườn nướng, rau củ',
    price: 35000,
    displayOrder: 1,
    metadata: {
      location: 'Căn tin tầng 1',
      ingredients: ['Cơm', 'Sườn', 'Rau']
    }
  },
  {
    categoryKey: 'CANTEEN',
    name: 'Phở bò',
    description: 'Phở bò truyền thống',
    price: 40000,
    displayOrder: 2,
    metadata: {
      location: 'Căn tin tầng 1',
      ingredients: ['Phở', 'Bò', 'Hành']
    }
  },
  {
    categoryKey: 'CANTEEN',
    name: 'Bánh mì thịt',
    description: 'Bánh mì với thịt nguội, pate, rau',
    price: 20000,
    displayOrder: 3,
    metadata: {
      location: 'Quầy bánh mì',
      ingredients: ['Bánh mì', 'Thịt', 'Pate', 'Rau']
    }
  },
  {
    categoryKey: 'CANTEEN',
    name: 'Cơm gà',
    description: 'Cơm trắng với gà chiên giòn',
    price: 38000,
    displayOrder: 4,
    metadata: {
      location: 'Căn tin tầng 2',
      ingredients: ['Cơm', 'Gà', 'Rau']
    }
  },
  {
    categoryKey: 'CANTEEN',
    name: 'Hủ tiếu',
    description: 'Hủ tiếu Nam Vang',
    price: 35000,
    displayOrder: 5,
    metadata: {
      location: 'Căn tin tầng 1',
      ingredients: ['Hủ tiếu', 'Tôm', 'Thịt']
    }
  },
  {
    categoryKey: 'CANTEEN',
    name: 'Bún bò Huế',
    description: 'Bún bò Huế đặc biệt',
    price: 42000,
    displayOrder: 6,
    metadata: {
      location: 'Căn tin tầng 2',
      ingredients: ['Bún', 'Bò', 'Chả']
    }
  },

  // Vending Machine items
  {
    categoryKey: 'VENDING_MACHINE',
    name: 'Nước suối',
    description: 'Nước khoáng tinh khiết 500ml',
    price: 5000,
    displayOrder: 1,
    metadata: {
      capacity: 500
    }
  },
  {
    categoryKey: 'VENDING_MACHINE',
    name: 'Coca Cola',
    description: 'Coca Cola lon 330ml',
    price: 10000,
    displayOrder: 2,
    metadata: {
      capacity: 330
    }
  },
  {
    categoryKey: 'VENDING_MACHINE',
    name: 'Pepsi',
    description: 'Pepsi lon 330ml',
    price: 10000,
    displayOrder: 3,
    metadata: {
      capacity: 330
    }
  },
  {
    categoryKey: 'VENDING_MACHINE',
    name: 'Trà xanh không độ',
    description: 'Trà xanh 0 độ chai 450ml',
    price: 8000,
    displayOrder: 4,
    metadata: {
      capacity: 450
    }
  },
  {
    categoryKey: 'VENDING_MACHINE',
    name: 'Sting',
    description: 'Nước tăng lực Sting lon 330ml',
    price: 12000,
    displayOrder: 5,
    metadata: {
      capacity: 330
    }
  },
  {
    categoryKey: 'VENDING_MACHINE',
    name: 'Number 1',
    description: 'Nước tăng lực Number 1 chai 330ml',
    price: 10000,
    displayOrder: 6,
    metadata: {
      capacity: 330
    }
  },
  {
    categoryKey: 'VENDING_MACHINE',
    name: 'Cà phê sữa',
    description: 'Cà phê sữa Highland lon 235ml',
    price: 12000,
    displayOrder: 7,
    metadata: {
      capacity: 235
    }
  },
  {
    categoryKey: 'VENDING_MACHINE',
    name: 'Sữa tươi',
    description: 'Sữa tươi Vinamilk hộp 180ml',
    price: 8000,
    displayOrder: 8,
    metadata: {
      capacity: 180
    }
  }
];

const seedData = async () => {
  try {
    await connectDB();

    console.log('Clearing existing data...');
    await POSCategory.deleteMany({});
    await POSItem.deleteMany({});

    console.log('Seeding categories...');
    await POSCategory.insertMany(categories);
    console.log(`✓ ${categories.length} categories created`);

    console.log('Seeding items...');
    await POSItem.insertMany(items);
    console.log(`✓ ${items.length} items created`);

    console.log('Seed data completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
};

seedData();
