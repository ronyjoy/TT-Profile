// models/RankingHistory.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const rankingHistorySchema = new Schema({
  playerId: { type: Schema.Types.ObjectId, ref: 'PlayerProfile', required: true },
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
    Chopping: { type: Number, default: 0 },
    Gameplay: { type: Number, default: 0 },
    PracticeFocus: { type: Number, default: 0 },
    Sportsmanship: { type: Number, default: 0 },
    OverallAttitude: { type: Number, default: 0 }
  },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('RankingHistory', rankingHistorySchema);
