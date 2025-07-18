const mongoose = require('mongoose');
require('dotenv').config();

async function dropAdminIndex() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/autism-support');
    console.log('Connected to MongoDB');

    // Get the database instance
    const db = mongoose.connection.db;
    
    // Drop the problematic index
    try {
      await db.collection('users').dropIndex('isAdmin_1');
      console.log('Successfully dropped isAdmin_1 index');
    } catch (indexError) {
      if (indexError.code === 26) {
        console.log('Index isAdmin_1 does not exist, nothing to drop');
      } else {
        console.error('Error dropping index:', indexError);
      }
    }

    // List all indexes to verify
    const indexes = await db.collection('users').indexes();
    console.log('Current indexes on users collection:');
    indexes.forEach(index => {
      console.log('-', index.name, ':', JSON.stringify(index.key));
    });

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
    process.exit(0);
  }
}

dropAdminIndex(); 