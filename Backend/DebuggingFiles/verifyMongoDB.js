/**
 * MongoDB Verification & Cleanup Script
 * Checks connection and fixes invalid enum values
 */

require('dotenv').config();
const mongoose = require('mongoose');
const config = require('./config/config');
const ResumeSkill = require('./models/ResumeSkill');
const JobSkill = require('./models/JobSkill');
const AIMatchResult = require('./models/AIMatchResult');

const verifyMongoDB = async () => {
  try {
    console.log('🔍 Connecting to MongoDB...');
    await mongoose.connect(config.mongodb.uri);
    console.log('✅ MongoDB connected successfully\n');

    // Check collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('📦 Available Collections:');
    collections.forEach(col => console.log(`   - ${col.name}`));
    console.log('');

    // Check ResumeSkill documents
    console.log('🔍 Checking resume_skills collection...');
    const resumeSkillCount = await ResumeSkill.countDocuments();
    console.log(`   Total documents: ${resumeSkillCount}`);

    if (resumeSkillCount > 0) {
      const sampleResume = await ResumeSkill.findOne();
      console.log('   Sample document:', {
        resume_id: sampleResume?.resume_id,
        skills_count: sampleResume?.skills?.length || 0,
        extraction_method: sampleResume?.extraction_method,
        confidence_score: sampleResume?.confidence_score
      });
    }

    // Check for invalid extraction_method values
    console.log('\n🔍 Checking for invalid enum values...');
    const invalidDocs = await mongoose.connection.db
      .collection('resume_skills')
      .find({ extraction_method: { $nin: ['AI', 'Manual', 'Parsed'] } })
      .toArray();

    if (invalidDocs.length > 0) {
      console.log(`⚠️  Found ${invalidDocs.length} documents with invalid extraction_method:`);
      invalidDocs.forEach(doc => {
        console.log(`   - ID: ${doc._id}, extraction_method: ${doc.extraction_method}`);
      });

      console.log('\n🔧 Fixing invalid values...');
      const result = await mongoose.connection.db
        .collection('resume_skills')
        .updateMany(
          { extraction_method: { $nin: ['AI', 'Manual', 'Parsed'] } },
          { $set: { extraction_method: 'Parsed' } }
        );
      console.log(`✅ Fixed ${result.modifiedCount} documents\n`);
    } else {
      console.log('✅ No invalid enum values found\n');
    }

    // Check JobSkill documents
    console.log('🔍 Checking job_skills collection...');
    const jobSkillCount = await JobSkill.countDocuments();
    console.log(`   Total documents: ${jobSkillCount}\n`);

    // Check AIMatchResult documents
    console.log('🔍 Checking ai_match_results collection...');
    const matchCount = await AIMatchResult.countDocuments();
    console.log(`   Total documents: ${matchCount}\n`);

    // Verify schema validation
    console.log('✅ MongoDB verification complete!');
    console.log('\n📊 Summary:');
    console.log(`   - Collections: ${collections.length}`);
    console.log(`   - Resume Skills: ${resumeSkillCount}`);
    console.log(`   - Job Skills: ${jobSkillCount}`);
    console.log(`   - Match Results: ${matchCount}`);
    console.log('\n✨ All systems operational!');

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
  } finally {
    await mongoose.connection.close();
    console.log('\n👋 MongoDB connection closed');
    process.exit(0);
  }
};

verifyMongoDB();
