const mongoose = require('mongoose');
require('dotenv').config();

const FlashSale = require('./models/FlashSale');

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  try {
    let sale = await FlashSale.findOne();
    if (!sale) {
      console.log('creating sale...');
      sale = await FlashSale.create({
        title: 'EPIC STORE SALE',
        discountPercent: 10,
        endTime: new Date(Date.now() + 86400000),
        active: false
      });
    }
    console.log(sale);
  } catch(e) {
    console.error(e);
  }
  process.exit();
}

run();
