const College = require('../models/College');

const identifyCollege = async (req, res, next) => {
  try {
    let collegeId = '';

    // 1) route param se
    if (req.params?.collegeId) {
      collegeId = req.params.collegeId;
    }

    // 2) query se fallback
    if (!collegeId && req.query?.collegeId) {
      collegeId = req.query.collegeId;
    }

    // 3) host based subdomain
    if (!collegeId) {
      const host = req.headers.host || '';

      if (
        !host.includes('localhost') &&
        !host.includes('127.0.0.1') &&
        host.includes('.')
      ) {
        collegeId = host.split('.')[0];
      }
    }

    // 4) localhost default fallback
    if (!collegeId) {
      collegeId = 'miet';
    }
    console.log('🏫 MODEL COLLECTION:', College.collection.name);
    console.log('🏫 MODEL DB NAME:', College.db.name);

    console.log('🏫 LOOKING FOR COLLEGE:', collegeId);
    const college = await College.findOne({
      $or: [{ collegeId }, { subdomain: collegeId }],
      isActive: true,
    });
    console.log('🏫 DB RESULT:', college);

    if (!college) {
      return res.status(404).json({
        success: false,
        message: 'College not found',
      });
    }

    req.college = college;

    next();
  } catch (error) {
    console.error('identifyCollege error:', error);

    return res.status(500).json({
      success: false,
      message: 'College identification failed',
    });
  }
};

module.exports = identifyCollege;
