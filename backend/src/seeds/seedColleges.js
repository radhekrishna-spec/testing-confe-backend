const mongoose = require('mongoose');
const path = require('path');

require('dotenv').config({
  path: path.resolve(__dirname, '../../../.env'),
});

const connectDB = require('../config/db');
const College = require('../models/College');

const { setupCollegeFolders } = require('../services/collegeAutoSetupService');

async function seed() {
  try {
    await connectDB();

    console.log('🚀 Running auto setup for all colleges...\n');

    // 🔥 Step 1: DB se sab colleges lao
    const colleges = await College.find();

    if (!colleges.length) {
      console.log('⚠️ No colleges found in DB');
      process.exit();
    }

    // 🔥 Step 2: loop through ALL colleges
    for (const college of colleges) {
      console.log(`📌 Checking: ${college.name}`);

      try {
        const result = await setupCollegeFolders(
          college.collegeId,
          college.name,
        );

        if (result.skipped) {
          console.log(`⏭️ Already setup: ${college.name}`);
        } else {
          console.log(`✅ Created folders: ${college.name}`);
        }
      } catch (err) {
        console.error(`❌ Error for ${college.name}:`, err.message);
      }

      console.log('-----------------------------');
    }

    console.log('\n🎉 ALL DONE');
    process.exit();
  } catch (err) {
    console.error('🔥 Script failed:', err.message);
    process.exit(1);
  }
}

seed();
