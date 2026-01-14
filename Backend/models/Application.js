const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Application = sequelize.define('Application', {
    application_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'user_id'
      }
    },
    job_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'jobs',
        key: 'job_id'
      }
    },
    resume_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'resumes',
        key: 'resume_id'
      }
    },
    application_status: {
      type: DataTypes.ENUM('APPLIED', 'SHORTLISTED', 'REJECTED'),
      defaultValue: 'APPLIED'
    },
    applied_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  }, {
    tableName: 'applications',
    timestamps: false
  });

  return Application;
};
