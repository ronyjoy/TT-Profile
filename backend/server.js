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
app.put('/api/playerProfiles/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const { coachName, rankings, comments } = req.body;
  
      const player = await PlayerProfile.findById(id);
      if (!player) {
        return res.status(404).json({ error: "Profile not found" });
      }
  
      // ✅ Store rankings under the respective coach
      if (coachName) {
        player.coachRankings.set(coachName, rankings);
      }
  
      // ✅ Update comments if provided
      if (comments) {
        player.comments = comments;
      }
  
      await player.save();
  
      // ✅ Save Ranking History for the Specific Coach
      if (coachName && rankings) {
        const historyEntry = new RankingHistory({
          playerId: id,
          coachRankings: { [coachName]: rankings }, // ✅ Only save the updated coach's rankings
          createdAt: new Date()
        });
        await historyEntry.save();
      }
  
      res.json(player);
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
      const { coachName, rankings } = req.body;
  
      const player = await PlayerProfile.findById(id);
      if (!player) return res.status(404).json({ error: "Profile not found" });
  
      // ✅ Update only the selected coach's rankings
      if (coachName) {
        player.coachRankings.set(coachName, rankings);
      }
  
      await player.save();
  
      res.json(player);
    } catch (error) {
      console.error("Error updating profile:", error);
      res.status(400).json({ error: error.message });
    }
  });
  

app.get('/api/playerProfiles/:id/rankingHistory', async (req, res) => {
    try {
      const { id } = req.params;
      
      // ✅ Find the ranking history for the specific player
      const history = await RankingHistory.find({ playerId: id }).sort({ createdAt: 1 });
  
      // ✅ Transform data to separate each coach’s ranking history
      const transformedHistory = history.map(entry => ({
        createdAt: entry.createdAt,
        coachRankings: entry.coachRankings // ✅ Ensure each coach’s history is preserved
      }));
  
      res.json(transformedHistory);
    } catch (error) {
      console.error("Error fetching ranking history:", error);
      res.status(400).json({ error: error.message });
    }
  });
  

  
  
