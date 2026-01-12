const { AIMatchResult } = require('../models');
const { rankCandidates } = require('../services/rankingService');

exports.rankByJob = async (req, res) => {
  try {
    const { job_id } = req.params;
    const results = await AIMatchResult.find({ job_id: Number(job_id) }).lean();
    const ranking = rankCandidates(results);
    res.status(200).json({ success: true, data: ranking });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Ranking failed', error: err.message });
  }
};