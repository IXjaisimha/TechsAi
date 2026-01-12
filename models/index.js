const { Sequelize } = require('sequelize');
const mongoose = require('mongoose');
const config = require('../config/config');

// ============================================
// MySQL Connection (Structured Data)
// ============================================
// Initialize Sequelize with MySQL configuration
const sequelize = new Sequelize(
  config.mysql.name,
  config.mysql.user,
  config.mysql.password,
  {
    host: config.mysql.host,
    port: config.mysql.port,
    dialect: config.mysql.dialect,
    logging: false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  }
);

// Import MySQL models (Sequelize)
const User = require('./User')(sequelize);
const Resume = require('./Resume')(sequelize);
const Job = require('./Job')(sequelize);
const Application = require('./Application')(sequelize);

// Define MySQL model associations
User.hasMany(Resume, { foreignKey: 'user_id', onDelete: 'CASCADE' });
Resume.belongsTo(User, { foreignKey: 'user_id' });

User.hasMany(Job, { foreignKey: 'admin_id', onDelete: 'CASCADE' });
Job.belongsTo(User, { foreignKey: 'admin_id' });

User.hasMany(Application, { foreignKey: 'user_id', onDelete: 'CASCADE' });
Application.belongsTo(User, { foreignKey: 'user_id' });

Job.hasMany(Application, { foreignKey: 'job_id', onDelete: 'CASCADE' });
Application.belongsTo(Job, { foreignKey: 'job_id' });

Resume.hasMany(Application, { foreignKey: 'resume_id', onDelete: 'CASCADE' });
Application.belongsTo(Resume, { foreignKey: 'resume_id' });

// ============================================
// MongoDB Connection (Unstructured/AI Data)
// ============================================
const connectMongoDB = async () => {
  try {
    await mongoose.connect(config.mongodb.uri);
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    // Don't exit process, allow MySQL to continue working
  }
};

// Import MongoDB models (Mongoose)
const ResumeSkill = require('./ResumeSkill');
const JobSkill = require('./JobSkill');
const AIMatchResult = require('./AIMatchResult');

// ============================================
// Export both database connections and models
// ============================================
module.exports = {
  // MySQL (Sequelize)
  sequelize,
  User,
  Resume,
  Job,
  Application,
  
  // MongoDB (Mongoose)
  mongoose,
  connectMongoDB,
  ResumeSkill,
  JobSkill,
  AIMatchResult
};
