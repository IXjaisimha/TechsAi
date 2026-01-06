const { Sequelize } = require('sequelize');
const config = require('../config/config');

// Initialize Sequelize with MySQL configuration
const sequelize = new Sequelize(
  config.db.name,
  config.db.user,
  config.db.password,
  {
    host: config.db.host,
    port: config.db.port,
    dialect: config.db.dialect,
    logging: false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  }
);

// Import models
const User = require('./User')(sequelize);

// Export sequelize instance and models
module.exports = {
  sequelize,
  User
};
