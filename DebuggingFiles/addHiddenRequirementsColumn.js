/**
 * Migration script to add hidden_requirements column to jobs table
 * Run this once: node addHiddenRequirementsColumn.js
 */

require('dotenv').config();
const mysql = require('mysql2/promise');

async function addHiddenRequirementsColumn() {
  let connection;
  
  try {
    // Create connection
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'techsai'
    });

    console.log('✅ Connected to MySQL database');

    // Check if column already exists
    const [columns] = await connection.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = ? 
      AND TABLE_NAME = 'jobs' 
      AND COLUMN_NAME = 'hidden_requirements'
    `, [process.env.DB_NAME || 'techsai']);

    if (columns.length > 0) {
      console.log('⚠️  Column hidden_requirements already exists in jobs table');
      return;
    }

    // Add the column
    await connection.query(`
      ALTER TABLE jobs 
      ADD COLUMN hidden_requirements TEXT NULL 
      AFTER job_description
    `);

    console.log('✅ Successfully added hidden_requirements column to jobs table');

    // Verify the column was added
    const [verifyColumns] = await connection.query(`
      SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = ? 
      AND TABLE_NAME = 'jobs' 
      AND COLUMN_NAME = 'hidden_requirements'
    `, [process.env.DB_NAME || 'techsai']);

    console.log('✅ Column verification:', verifyColumns[0]);

  } catch (error) {
    console.error('❌ Error adding hidden_requirements column:', error.message);
    throw error;
  } finally {
    if (connection) {
      await connection.end();
      console.log('✅ Database connection closed');
    }
  }
}

// Run the migration
addHiddenRequirementsColumn()
  .then(() => {
    console.log('\n✅ Migration completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Migration failed:', error);
    process.exit(1);
  });
