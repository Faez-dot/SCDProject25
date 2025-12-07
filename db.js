require('dotenv').config();
const mongoose = require('mongoose');

const mongoUri = process.env.MONGO_URI;

// Connect to MongoDB
mongoose.connect(mongoUri)
  .then(() => console.log('✅ MongoDB connected successfully'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// Define schema
const recordSchema = new mongoose.Schema({
  name: { type: String, required: true },
  value: { type: String, required: true },
  created: { type: Date, default: Date.now }
});

// Create model
const Record = mongoose.model('Record', recordSchema);

// Async CRUD operations
module.exports = {
  addRecord: async (data) => {
    try {
      const record = new Record(data);
      return await record.save();
    } catch (err) {
      console.error('❌ Error adding record:', err);
      throw err;
    }
  },

  listRecords: async () => {
    try {
      // .lean() returns plain JS objects instead of Mongoose documents
      return await Record.find().sort({ created: 1 }).lean();
    } catch (err) {
      console.error('❌ Error listing records:', err);
      throw err;
    }
  },

  updateRecord: async (id, data) => {
    try {
      // data can contain { name, value } or any partial update
      return await Record.findByIdAndUpdate(id, data, { new: true });
    } catch (err) {
      console.error('❌ Error updating record:', err);
      throw err;
    }
  },

  deleteRecord: async (id) => {
    try {
      return await Record.findByIdAndDelete(id);
    } catch (err) {
      console.error('❌ Error deleting record:', err);
      throw err;
    }
  }
};


