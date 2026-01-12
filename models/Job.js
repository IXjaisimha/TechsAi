const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Job = sequelize.define('Job', {
    job_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    admin_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'user_id'
      }
    },
    job_title: {
      type: DataTypes.STRING(150),
      allowNull: false
    },
    job_description: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    hidden_requirements: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    employment_type: {
      type: DataTypes.ENUM('FULL_TIME', 'PART_TIME', 'INTERNSHIP', 'CONTRACT'),
      allowNull: false
    },
    work_mode: {
      type: DataTypes.ENUM('ONSITE', 'REMOTE', 'HYBRID'),
      allowNull: false
    },
    experience_min: {
      type: DataTypes.INTEGER
    },
    experience_max: {
      type: DataTypes.INTEGER
    },
    job_location: {
      type: DataTypes.STRING(100)
    },
    department: {
      type: DataTypes.STRING(100)
    },
    openings: {
      type: DataTypes.INTEGER
    },
    application_deadline: {
      type: DataTypes.DATE
    },
    job_status: {
      type: DataTypes.ENUM('OPEN', 'CLOSED'),
      defaultValue: 'OPEN'
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  }, {
    tableName: 'jobs',
    timestamps: false
  });

  return Job;
};
