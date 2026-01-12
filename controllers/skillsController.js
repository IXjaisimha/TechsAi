/**
 * Skills Controller
 * Demonstrates MongoDB operations for resume skills
 * Uses Mongoose for flexible, document-based storage
 */

const { ResumeSkill } = require('../models');

/**
 * Add skills to a resume (MongoDB)
 * POST /api/skills/resume/:resumeId
 */
exports.addResumeSkills = async (req, res) => {
  try {
    const { resumeId } = req.params;
    const { skills, extraction_method, confidence_score } = req.body;

    // Create or update resume skills in MongoDB
    const resumeSkill = await ResumeSkill.findOneAndUpdate(
      { resume_id: parseInt(resumeId) },
      {
        resume_id: parseInt(resumeId),
        skills,
        extraction_method: extraction_method || 'Manual',
        confidence_score,
        extracted_at: new Date()
      },
      {
        upsert: true, // Create if doesn't exist
        new: true,
        runValidators: true
      }
    );

    res.status(201).json({
      success: true,
      message: 'Resume skills saved successfully',
      data: resumeSkill
    });
  } catch (error) {
    console.error('Error adding resume skills:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add resume skills',
      error: error.message
    });
  }
};

/**
 * Get skills for a resume (MongoDB)
 * GET /api/skills/resume/:resumeId
 */
exports.getResumeSkills = async (req, res) => {
  try {
    const { resumeId } = req.params;

    const resumeSkill = await ResumeSkill.findOne({ 
      resume_id: parseInt(resumeId) 
    });

    if (!resumeSkill) {
      return res.status(404).json({
        success: false,
        message: 'Resume skills not found'
      });
    }

    res.status(200).json({
      success: true,
      data: resumeSkill
    });
  } catch (error) {
    console.error('Error fetching resume skills:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch resume skills',
      error: error.message
    });
  }
};

/**
 * Search resumes by skill (MongoDB)
 * GET /api/skills/search?skill=JavaScript&category=Technical
 */
exports.searchResumesBySkill = async (req, res) => {
  try {
    const { skill, category, min_proficiency } = req.query;

    let query = {};

    if (skill) {
      query['skills.skill_name'] = new RegExp(skill, 'i');
    }

    if (category) {
      query['skills.category'] = category;
    }

    if (min_proficiency) {
      query['skills.proficiency_level'] = { 
        $in: ['Advanced', 'Expert'] 
      };
    }

    const resumes = await ResumeSkill.find(query)
      .select('resume_id skills extracted_at')
      .limit(50);

    res.status(200).json({
      success: true,
      count: resumes.length,
      data: resumes
    });
  } catch (error) {
    console.error('Error searching resumes:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to search resumes',
      error: error.message
    });
  }
};

/**
 * Update specific skill in resume (MongoDB)
 * PATCH /api/skills/resume/:resumeId/skill/:skillName
 */
exports.updateResumeSkill = async (req, res) => {
  try {
    const { resumeId, skillName } = req.params;
    const updateData = req.body;

    const result = await ResumeSkill.findOneAndUpdate(
      { 
        resume_id: parseInt(resumeId),
        'skills.skill_name': skillName
      },
      {
        $set: {
          'skills.$': {
            skill_name: skillName,
            ...updateData
          }
        }
      },
      { new: true }
    );

    if (!result) {
      return res.status(404).json({
        success: false,
        message: 'Skill not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Skill updated successfully',
      data: result
    });
  } catch (error) {
    console.error('Error updating skill:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update skill',
      error: error.message
    });
  }
};

/**
 * Delete resume skills (MongoDB)
 * DELETE /api/skills/resume/:resumeId
 */
exports.deleteResumeSkills = async (req, res) => {
  try {
    const { resumeId } = req.params;

    const result = await ResumeSkill.findOneAndDelete({ 
      resume_id: parseInt(resumeId) 
    });

    if (!result) {
      return res.status(404).json({
        success: false,
        message: 'Resume skills not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Resume skills deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting resume skills:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete resume skills',
      error: error.message
    });
  }
};
