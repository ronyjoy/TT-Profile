const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// ✅ Define `coachRatingsSchema` First (Before Using It)
const coachRatingsSchema = new mongoose.Schema(
  {
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
    OverallAttitude: { type: Number, default: 0 },
  },
  { _id: false }
);

// ✅ Define `playerProfileSchema` After `coachRatingsSchema`
const playerProfileSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  phone: String,
  email: String,
  picture: String,
  profileType: { type: String, default: "Student" },

  // ✅ Each coach has their own ratings (stored in a Map)
  coachRankings: {
    type: Map,
    of: coachRatingsSchema,
    default: {},
  },

  // ✅ Compute the academy-wide average from all coaches
  averageRatings: {
    type: coachRatingsSchema, // Stores computed averages
    default: {},
  },

  comments: { type: String, default: "" },
});

// ✅ Middleware to Compute Averages Before Saving
playerProfileSchema.pre("save", function (next) {
  if (this.coachRankings && this.coachRankings.size > 0) {
    let totalRatings = {};
    let coachCount = 0;

    // ✅ Compute averages for all attributes
    for (const ratings of this.coachRankings.values()) {
      coachCount++;
      Object.keys(ratings).forEach((key) => {
        if (!totalRatings[key]) totalRatings[key] = 0;
        totalRatings[key] += ratings[key];
      });
    }

    if (coachCount > 0) {
      Object.keys(totalRatings).forEach(
        (key) => (totalRatings[key] = totalRatings[key] / coachCount)
      );
    }

    this.averageRatings = totalRatings;
  }

  next();
});

module.exports = mongoose.model("PlayerProfile", playerProfileSchema);
