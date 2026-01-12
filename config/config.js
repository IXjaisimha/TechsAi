const dotenv = require('dotenv');

dotenv.config();

module.exports = {
  port: process.env.PORT || 5000,
  
  // MySQL Configuration (Structured Data)
  mysql: {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    name: process.env.DB_NAME || 'TechsAI',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    dialect: 'mysql'
  },
  
  // MongoDB Configuration (Unstructured/AI Data)
  mongodb: {
     uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/techsai'
  },
  
  jwtSecret: process.env.JWT_SECRET || 'default_secret_key',
  jwtExpire: process.env.JWT_EXPIRE || '7d',
};
