const { createConfession } = require('../services/submitService');
const College = require('../models/College');
const Confession = require('../models/Confession');

exports.getAllColleges = async (req, res) => {
  try {
   // console.log('STEP 1: colleges fetch start');
    const colleges = await College.find({ isActive: true });
   // console.log('STEP 2: colleges =', colleges.length);

    const result = await Promise.all(
      colleges.map(async (college) => {
        // console.log('Processing:', college.collegeId);
        const pending = await Confession.countDocuments({
          collegeId: college.collegeId,
          status: 'PENDING',
        });

        const postedToday = await Confession.countDocuments({
          collegeId: college.collegeId,
          status: 'APPROVED',
          createdAt: {
            $gte: new Date(new Date().setHours(0, 0, 0, 0)),
          },
        });

        return {
          collegeId: college.collegeId,
          name: college.name,
          pending,
          postedToday,
        };
      }),
    );
    //console.log('STEP 3: result ready', result.length);
    res.status(200).json({
      success: true,
      data: result,
    });
  //  console.log('STEP 4: response sent');
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

exports.broadcastConfession = async (req, res) => {
  try {
    const { message, collegeIds } = req.body;

    if (!message || !collegeIds?.length) {
      return res.status(400).json({
        success: false,
        error: 'Message and collegeIds required',
      });
    }

    const results = [];

    for (const collegeId of collegeIds) {
      try {
        const result = await createConfession({
          message,
          collegeId: collegeId.toLowerCase(),
          fromAdminUI: true,
        });

        results.push({
          collegeId,
          confessionNo: result.confessionNo,
          status: 'SUCCESS',
        });
      } catch (error) {
        results.push({
          collegeId,
          status: 'FAILED',
          error: error.message,
        });
      }
    }

    res.status(201).json({
      success: true,
      message: 'Broadcast sent successfully',
      data: results,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

exports.getCollegeConfessions = async (req, res) => {
  try {
    const { collegeId } = req.params;

    const confessions = await Confession.find({
      collegeId: collegeId.toLowerCase(),
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: confessions,
    });
  } catch (error) {
    console.error('GET COLLEGE CONFESSIONS ERROR:', error);

    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};
