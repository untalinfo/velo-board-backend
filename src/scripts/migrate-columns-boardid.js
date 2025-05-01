const mongoose = require('mongoose');

async function migrateBoardId() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/veloboard');
    console.log('Connected to MongoDB');

    const columnsCollection = mongoose.connection.collection('columns');
    const columns = await columnsCollection.find({}).toArray();
    let updated = 0;
    for (const col of columns) {
      if (col.boardId && typeof col.boardId === 'string') {
        await columnsCollection.updateOne(
          { _id: col._id },
          { $set: { boardId: new mongoose.Types.ObjectId(col.boardId) } }
        );
        updated++;
      }
    }
    console.log(`Migrated ${updated} columns.`);
    await mongoose.connection.close();
    console.log('Connection closed');
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

migrateBoardId(); 