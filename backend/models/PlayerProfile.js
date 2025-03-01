const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const playerProfileSchema = new Schema({
  profileType: { type: String, default: 'Student' },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  phone: String,
  email: String,
  picture: String,
  rankings: {
    Footwork: { type: Number, default: 0 },
    ForehandDrive: { type: Number, default: 0 },
    BackhandDrive: { type: Number, default: 0 },
    ForehandLoop: { type: Number, default: 0 },
    BackhandLoop: { type: Number, default: 0 },
    ForehandBlock: { type: Number, default: 0 },
    BackhandBlock: { type: Number, default: 0 },
    BackhandPush: { type: Number, default: 0 },
    ForehandPush: { type: Number, default: 0 },
    ShortPushes: { type: Number, default: 0 },
    LongPushes: { type: Number, default: 0 },
    UnderspinLoop: { type: Number, default: 0 },
    CounterLooping: { type: Number, default: 0 },
    PlayAwayFromTheTable: { type: Number, default: 0 },
    ServingTechnics: { type: Number, default: 0 },
    ReceivingTechnics: { type: Number, default: 0 },
    Chopblock: { type: Number, default: 0 },
    Chopping: { type: Number, default: 0 }
  },
  comments: { type: String, default: "" } // Ensure this field exists
});

module.exports = mongoose.model('PlayerProfile', playerProfileSchema);
