import mongoose from 'mongoose';

const attendeeSchema = new mongoose.Schema({
  email: String,
  firstName: String,
  lastName: String,
  phone: String,
  location: String,
  gender: String,
  source: String,
  sessionMinutes: Number,
  joinTime: Date,
  leaveTime: Date
});

export default mongoose.model('Attendee', attendeeSchema);
