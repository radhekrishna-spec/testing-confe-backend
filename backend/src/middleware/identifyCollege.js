const College = require('../models/College');

const identifyCollege = async (req, res, next) => {
  try {
    const host = req.headers.host || '';

    // localhost ya direct testing ke liye fallback
    if (
      host.includes('localhost') ||
      host.includes('127.0.0.1') ||
      !host.includes('.')
    ) {
      req.college = {
        collegeId: 'miet',
        name: 'MIET Meerut',
      };
      return next();
    }

    const subdomain = host.split('.')[0];

    const college = await College.findOne({
      subdomain,
      isActive: true,
    });

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
