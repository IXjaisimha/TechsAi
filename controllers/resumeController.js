/**
 * Resume Controller
 * Handles resume uploads and AI extraction of skills
 * Integrates MySQL (resume metadata) + MongoDB (extracted skills)
 */

const fs = require('fs');
const path = require('path');
const { Resume, ResumeSkill } = require('../models');
const { extractFromResume } = require('../services/aiExtractionService');

/**
 * Upload resume and extract skills
 * POST /api/resumes/upload
 * 
 * Body: multipart/form-data
 * - file: PDF/DOC/DOCX resume file
 * - user_id: User ID (from JWT or body)
 */
exports.uploadAndExtract = async (req, res) => {
  try {
    // Handle upload.any() - file can be in req.files array
    const uploadedFile = req.file || (req.files && req.files[0]);
    
    if (!uploadedFile) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    // Prefer authenticated user; fallback to provided user_id for backward compatibility
    const user_id = (req.user && req.user.user_id) || req.body.user_id;
    const filePath = uploadedFile.path;
    const fileName = uploadedFile.originalname;
    const fileSize = Math.round(uploadedFile.size / 1024); // KB

    if (!user_id) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }

    console.log(`Uploaded: ${fileName} (${fileSize}KB) for User ID: ${user_id}`);
    console.log(`Extracting AI features...`);

    // Step 1: Save file metadata to MySQL (Local file path only)
    const resume = await Resume.create({
      user_id,
      file_name: fileName,
      file_path: filePath, // Store local file system path
      file_size_kb: fileSize,
      is_active: true
    });

    const resume_id = resume.resume_id;
    console.log(`✅ Resume saved to MySQL with ID: ${resume_id}`);

    // Step 2: Extract skills using AI service (Gemini)
    const extractedData = await extractFromResume(filePath);

    // Step 3: Save extracted skills to MongoDB (AI-powered data)
    const resumeSkill = await ResumeSkill.findOneAndUpdate(
      { resume_id },
      {
        resume_id,
        skills: extractedData.skills,
        extraction_method: extractedData.extraction_method,
        confidence_score: extractedData.confidence_score,
        extracted_at: new Date(),
        metadata: {
          education: extractedData.education,
          experience_years: extractedData.experience_years,
          file_name: fileName,
          file_size_kb: fileSize
        }
      },
      {
        upsert: true,
        new: true,
        runValidators: true
      }
    );

    console.log(`✅ AI Extraction complete! Found ${extractedData.skills.length} skills`);

    res.status(201).json({
      success: true,
      message: 'Resume uploaded successfully (MySQL) and AI-extracted skills saved (MongoDB)',
      data: {
        resume_id,
        mysql_resume: {
          id: resume.resume_id,
          file_name: resume.file_name,
          file_path: resume.file_path, // Admin can access via this path
          uploaded_at: resume.uploaded_at
        },
        ai_extracted_data: {
          skills_count: extractedData.skills.length,
          education: extractedData.education,
          experience_years: extractedData.experience_years,
          confidence_score: extractedData.confidence_score,
          extraction_method: extractedData.extraction_method
        },
        mongodb_skills_id: resumeSkill._id
      }
    });
  } catch (error) {
    console.error('Resume upload error:', error);

    // Clean up uploaded file if extraction failed
    const uploadedFile = req.file || (req.files && req.files[0]);
    if (uploadedFile && fs.existsSync(uploadedFile.path)) {
      fs.unlinkSync(uploadedFile.path);
    }

    res.status(500).json({
      success: false,
      message: 'Failed to upload and extract resume',
      error: error.message
    });
  }
};

/**
 * Get extracted skills from a resume
 * GET /api/resumes/:resumeId/skills
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
      data: {
        resume_id: resumeSkill.resume_id,
        skills: resumeSkill.skills,
        extraction_method: resumeSkill.extraction_method,
        confidence_score: resumeSkill.confidence_score,
        extracted_at: resumeSkill.extracted_at,
        metadata: resumeSkill.metadata
      }
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
 * Re-extract skills from existing resume file
 * POST /api/resumes/:resumeId/re-extract
 */
exports.reExtractSkills = async (req, res) => {
  try {
    const { resumeId } = req.params;
    const uploadsDir = path.join(__dirname, '..', 'uploads', 'resumes');

    // Find resume file matching this ID (demo - in real app, look up from DB)
    const files = fs.readdirSync(uploadsDir);
    const resumeFiles = files.filter(f => f.includes(resumeId));

    if (resumeFiles.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Resume file not found'
      });
    }

    const filePath = path.join(uploadsDir, resumeFiles[0]);

    // Extract skills again
    const extractedData = await extractFromResume(filePath);

    // Update MongoDB
    const resumeSkill = await ResumeSkill.findOneAndUpdate(
      { resume_id: parseInt(resumeId) },
      {
        skills: extractedData.skills,
        extracted_at: new Date(),
        confidence_score: extractedData.confidence_score
      },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: 'Skills re-extracted successfully',
      data: {
        skills: extractedData.skills,
        education: extractedData.education,
        experience_years: extractedData.experience_years,
        confidence_score: extractedData.confidence_score
      }
    });
  } catch (error) {
    console.error('Error re-extracting skills:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to re-extract skills',
      error: error.message
    });
  }
};

/**
 * Bulk extract skills from multiple resume files
 * POST /api/resumes/bulk-extract
 */
exports.bulkExtract = async (req, res) => {
  try {
    const uploadsDir = path.join(__dirname, '..', 'uploads', 'resumes');
    const files = fs.readdirSync(uploadsDir);

    const results = [];

    for (const file of files) {
      try {
        const filePath = path.join(uploadsDir, file);
        const extractedData = await extractFromResume(filePath);

        results.push({
          file,
          status: 'success',
          skills_count: extractedData.skills.length,
          confidence_score: extractedData.confidence_score
        });
      } catch (error) {
        results.push({
          file,
          status: 'failed',
          error: error.message
        });
      }
    }

    res.status(200).json({
      success: true,
      message: `Processed ${files.length} resumes`,
      results
    });
  } catch (error) {
    console.error('Bulk extraction error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to perform bulk extraction',
      error: error.message
    });
  }
};

/**
 * Delete resume and its extracted skills
 * DELETE /api/resumes/:resumeId
 */
exports.deleteResume = async (req, res) => {
  try {
    const { resumeId } = req.params;
    const uploadsDir = path.join(__dirname, '..', 'uploads', 'resumes');

    // Delete file from disk
    const files = fs.readdirSync(uploadsDir);
    const resumeFiles = files.filter(f => f.includes(resumeId));

    for (const file of resumeFiles) {
      const filePath = path.join(uploadsDir, file);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    // Delete from MongoDB
    const result = await ResumeSkill.findOneAndDelete({ 
      resume_id: parseInt(resumeId) 
    });

    if (!result) {
      return res.status(404).json({
        success: false,
        message: 'Resume not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Resume deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting resume:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete resume',
      error: error.message
    });
  }
};
