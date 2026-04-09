const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({
  path: require('path').resolve(__dirname, '../../../.env'),
});

const connectDB = require('../config/db');
const College = require('../models/College');

const colleges = [
  {
    collegeId: 'miet',
    name: 'Meerut Institute of Engineering and Technology',
    subdomain: 'miet',
  },
  {
    collegeId: 'niet',
    name: 'Noida Institute of Engineering and Technology',
    subdomain: 'niet',
  },
  { collegeId: 'du', name: 'Delhi University', subdomain: 'du' },
  {
    collegeId: 'ccsu',
    name: 'Chaudhary Charan Singh University',
    subdomain: 'ccsu',
  },
  { collegeId: 'amity', name: 'Amity University', subdomain: 'amity' },
  {
    collegeId: 'lpu',
    name: 'Lovely Professional University',
    subdomain: 'lpu',
  },
  { collegeId: 'cu', name: 'Chandigarh University', subdomain: 'cu' },
  { collegeId: 'bhu', name: 'Banaras Hindu University', subdomain: 'bhu' },
  { collegeId: 'mu', name: 'University of Mumbai', subdomain: 'mu' },
  {
    collegeId: 'sppu',
    name: 'Savitribai Phule Pune University',
    subdomain: 'sppu',
  },
  { collegeId: 'jmi', name: 'Jamia Millia Islamia', subdomain: 'jmi' },
  { collegeId: 'jnu', name: 'Jawaharlal Nehru University', subdomain: 'jnu' },
];

async function seed() {
  await connectDB();

  for (const college of colleges) {
    await College.updateOne(
      { collegeId: college.collegeId },
      { $set: college },
      { upsert: true },
    );
  }

  console.log('✅ All colleges inserted');
  process.exit();
}

seed();
