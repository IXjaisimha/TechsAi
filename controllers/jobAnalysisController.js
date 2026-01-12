const { Job, JobSkill } = require('../models');
const { analyzeJD } = require('../services/jdAnalysisService');

exports.analyzeAndSave = async (req, res) => {
  try {
    const { job_id } = req.params;
    let { job_description, hidden_requirements } = req.body;

    // If job_description not provided in body, fetch from MySQL
    if (!job_description) {
      const job = await Job.findByPk(job_id);
      if (!job) {
        return res.status(404).json({ 
          success: false, 
          message: `Job with ID ${job_id} not found` 
        });
      }
      job_description = job.job_description;
      hidden_requirements = job.hidden_requirements || hidden_requirements || '';
    }

    console.log(`🤖 Starting AI analysis for Job ID: ${job_id}`);
    
    const analysis = await analyzeJD(job_description, hidden_requirements || '');

    const doc = await JobSkill.findOneAndUpdate(
      { job_id: Number(job_id) },
      {
        job_id: Number(job_id),
        normal_skills: analysis.normal_skills,
        hidden_skills: analysis.hidden_skills,
        ai_generated: analysis.extraction_method === 'AI',
        generation_confidence: analysis.confidence_score,
        metadata: { 
          model: analysis.ai_model_version,
          analyzed_at: new Date()
        }
      },
      { upsert: true, new: true }
    );

    console.log(`✅ AI analysis complete: ${analysis.normal_skills.length} normal skills, ${analysis.hidden_skills.length} hidden skills`);

    res.status(200).json({ 
      success: true, 
      message: 'Job analyzed successfully using Gemini AI',
      data: doc,
      analysis_summary: {
        normal_skills_count: analysis.normal_skills.length,
        hidden_skills_count: analysis.hidden_skills.length,
        extraction_method: analysis.extraction_method,
        confidence_score: analysis.confidence_score,
        ai_model: analysis.ai_model_version
      }
    });
  } catch (err) {
    console.error('❌ JD analysis failed:', err);
    res.status(500).json({ success: false, message: 'JD analysis failed', error: err.message });
  }
};