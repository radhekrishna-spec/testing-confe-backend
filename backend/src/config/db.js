const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 10000,
    });
    // console.log('🗄️ CONNECTED DB NAME:', mongoose.connection.name);
    // console.log('🌐 CONNECTED HOST:', mongoose.connection.host);
    // console.log('🔗 READY STATE:', mongoose.connection.readyState);
    // console.log(
    //   '📂 COLLECTIONS:',
    //   Object.keys(mongoose.connection.collections),
    // );
    // console.log('MongoDB Connected');
  } catch (error) {
    console.error('MongoDB Error:', error.message);
    throw error;
  }
};

module.exports = connectDB;
