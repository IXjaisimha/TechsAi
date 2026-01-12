const { ResumeSkill, JobSkill, AIMatchResult } = require('../models');
const { matchResumeToJob } = require('../services/matchingService');

exports.match = async (req, res) => {
  try {
    const { application_id, resume_id, job_id, user_id } = req.body;
    if (!application_id || !resume_id || !job_id || !user_id) {
      return res.status(400).json({ success: false, message: 'application_id, resume_id, job_id, user_id are required' });
    }

    const resumeDoc = await ResumeSkill.findOne({ resume_id: Number(resume_id) });
    const jobDoc = await JobSkill.findOne({ job_id: Number(job_id) });
    if (!resumeDoc || !jobDoc) {
      return res.status(404).json({ success: false, message: 'Resume or Job skills not found' });
    }

    const start = Date.now();
    const matched = await matchResumeToJob(
      {
        skills: (resumeDoc.skills || []).map(s => ({ skill_name: s.skill_name, proficiency_level: s.proficiency_level, years_of_experience: s.years_of_experience, category: s.category })),
        education: (resumeDoc.metadata?.education) || [],
        experience_years: resumeDoc.metadata?.experience_years || 0
      },
      jobDoc.normal_skills || [],
      jobDoc.hidden_skills || []
    );

    const overall_score = matched.overall_score || 0;
    const match_grade = overall_score >= 85 ? 'Excellent' : overall_score >= 70 ? 'Good' : overall_score >= 55 ? 'Fair' : 'Poor';

    const aiResult = await AIMatchResult.create({
      application_id: Number(application_id),
      resume_id: Number(resume_id),
      job_id: Number(job_id),
      user_id: Number(user_id),
      overall_score,
      match_grade,
      scoring_breakdown: {
        technical_skills_score: matched.normal_skill_score,
        soft_skills_score: 0,
        experience_score: matched.experience_score,
        education_score: 0,
        hidden_criteria_score: matched.hidden_skill_score
      },
      matched_skills: (matched.strengths || []).map(name => ({ skill_name: name, match_strength: 100 })),
      missing_skills: (matched.gaps || []).map(name => ({ skill_name: name, importance: 'Required', is_critical: true })),
      ai_insights: { strengths: matched.strengths || [], weaknesses: matched.gaps || [], recommendations: [], red_flags: [] },
      hidden_match_analysis: { cultural_fit_score: 0, strategic_alignment_score: matched.hidden_skill_score, internal_notes: [], flags: [] },
      confidence_score: matched.confidence_score || 80,
      ai_model_version: matched.ai_model_version || 'fallback',
      processing_time_ms: Date.now() - start,
      metadata: { extraction_method: matched.extraction_method }
    });

    res.status(201).json({ success: true, data: aiResult });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Matching failed', error: err.message });
  }
};