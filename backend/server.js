// In your server.js or routes file
const express = require('express');
const mongoose = require('mongoose');
// In your server.js (or routes file)
const RankingHistory = require('./models/RankingHistory');
const PlayerProfile = require('./models/PlayerProfile');
const cors = require('cors');
const app = express();

// Enable CORS for all origins (or specify allowed origin)
app.use(cors());


app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*"); // Or specify "http://localhost:3000"
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});
  
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
const PORT = process.env.PORT || 5001; // or 5001, as intended
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));




// Connect to MongoDB
mongoose
  .connect('mongodb://localhost:27017/tableTennisAcademy', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.error(err));

// Create a new player profile (profile + initial rankings)
app.post('/api/playerProfiles', async (req, res) => {
  try {
    const newProfile = new PlayerProfile(req.body);
    const savedProfile = await newProfile.save();
    res.status(201).json(savedProfile);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});
// Update ranking fields of an existing player profile
app.put('/api/playerProfiles/:id/rankings', async (req, res) => {
    console.log("Request Body:", req.body); // prints { ratings: { ... } }
    try {
      const { id } = req.params;
      console.log("Updating profile with id:", id);
      const { ratings } = req.body; // using the key "ratings"
      // Update the document's "rankings" field with the value from "ratings"
      const updatedProfile = await PlayerProfile.findByIdAndUpdate(
        id,
        { $set: { rankings: ratings } },
        { new: true, runValidators: true }
      );
      console.log("Updated Profile:", updatedProfile);
      if (!updatedProfile) {
        return res.status(404).json({ error: "Profile not found" });
      }
      res.json(updatedProfile);
    } catch (error) {
      console.error("Error updating profile:", error);
      res.status(400).json({ error: error.message });
    }
  });
  
  
app.get('/api/playerProfiles', async (req, res) => {
try {
    const profiles = await PlayerProfile.find();
    res.json(profiles);
} catch (error) {
    res.status(400).json({ error: error.message });
}
});
  




app.put('/api/playerProfiles/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { rankings, comments } = req.body;
    const updatedProfile = await PlayerProfile.findByIdAndUpdate(
      id,
      { $set: { rankings: rankings, comments: comments } },
      { new: true, runValidators: true }
    );
    if (!updatedProfile) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    // Record the ranking history (only for rankings)
    if (rankings) {
      const historyEntry = new RankingHistory({
        playerId: id,
        rankings: rankings
      });
      await historyEntry.save();
    }

    res.json(updatedProfile);
  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(400).json({ error: error.message });
  }
});

app.get('/api/playerProfiles/:id/rankingHistory', async (req, res) => {
    try {
      const { id } = req.params;
      const history = await RankingHistory.find({ playerId: id }).sort({ createdAt: 1 });
      res.json(history);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });
  

  
  
