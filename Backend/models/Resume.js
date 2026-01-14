const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Resume = sequelize.define('Resume', {
    resume_id: {
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
      },
      validate: {
        notEmpty: {
          msg: 'User ID is required'
        }
      }
    },
    file_name: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'File name is required'
        }
      }
    },
    file_path: {
      type: DataTypes.STRING(500),
      allowNull: false,
      comment: 'Local file system path for admin access',
      validate: {
        notEmpty: {
          msg: 'File path is required'
        }
      }
    },
    file_size_kb: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      allowNull: false
    },
    uploaded_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      allowNull: false
    }
  }, {
    tableName: 'resumes',
    timestamps: false,
    indexes: [
      {
        fields: ['user_id']
      },
      {
        fields: ['uploaded_at']
      }
    ]
  });

  return Resume;
};
