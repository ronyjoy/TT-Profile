// In your server.js or routes file
const express = require('express');
const mongoose = require('mongoose');
const path = require("path");
// In your server.js (or routes file)
const RankingHistory = require('./models/RankingHistory');
const PlayerProfile = require('./models/PlayerProfile');
const cors = require('cors');
const app = express();
require("dotenv").config();
const passport = require("passport");
const session = require("express-session");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const jwt = require("jsonwebtoken");
const User = require("./models/User"); // We'll create this model

app.use(session({ secret: "your-secret-key", resave: false, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());
app.use(cors());
const REACT_APP_FRONT_END_URL = process.env.REACT_APP_FRONT_END_URL || "http://localhost:5001";


// Enable CORS for all origins (or specify allowed origin)

const ALLOWED_EMAILS = ["ronyjoy@gmail.com", "admin@lonestartabletennis.com","rj@lonestartabletennis.com","offybee3@gmail.com","pada.tanv@gmail.com","edaythelion@gmail.com","sathish.sh@gmail.com","Siva.Subbiah@gmail.com"];
passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: "/auth/google/callback",
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const email = profile.emails[0].value;
  
          // Allow access only if the email is in the allowed list
          if (!ALLOWED_EMAILS.includes(email)) {
            return done(null, false, { message: "Unauthorized" });
          }
  
          let user = await User.findOne({ googleId: profile.id });
          if (!user) {
            user = new User({
              googleId: profile.id,
              name: profile.displayName,
              email: email,
            });
            await user.save();
          }
  
          return done(null, user);
        } catch (error) {
          return done(error, null);
        }
      }
    )
  );

  // Redirect to Google OAuth
app.get("/auth/google", passport.authenticate("google", { scope: ["profile", "email"] }));

// Google OAuth Callback
app.get(
  "/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "/login" }),
  (req, res) => {
    // Generate JWT token
    const token = jwt.sign(
      { id: req.user._id, email: req.user.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );
    
    // Use a relative path for redirection
    res.redirect(`${REACT_APP_FRONT_END_URL}/?token=${token}`);
  }
);


// Logout
app.get("/auth/logout", (req, res) => {
  req.logout(() => {
    res.redirect("/");
  });
});

  
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });
  
  passport.deserializeUser(async (id, done) => {
    const user = await User.findById(id);
    done(null, user);
  });
  

app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*"); // Or specify "http://localhost:3000"
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});
const verifyToken = (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ message: "Unauthorized" });
  
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) return res.status(403).json({ message: "Invalid token" });
      req.user = decoded;
      next();
    });
  };



// app.use(express.static(path.join(__dirname, "../frontend/build")));

// app.get("*", (req, res) => {
// res.sendFile(path.join(__dirname, "../frontend/build", "index.html"));
// });


app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
const PORT = process.env.PORT || 5001; // or 5001, as intended
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));




// Connect to MongoDB
const mongoURI = `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@${process.env.MONGO_CLUSTER}/${process.env.MONGO_DB}${process.env.MONGO_OPTIONS}`;

mongoose.connect(mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log("✅ MongoDB Connected Successfully"))
.catch(err => console.error("❌ MongoDB Connection Error:", err));

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
app.put('/api/playerProfiles/:id',verifyToken, async (req, res) => {
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
  
  
  
  
  
app.get('/api/playerProfiles',verifyToken, async (req, res) => {
try {
    const profiles = await PlayerProfile.find();
    res.json(profiles);
} catch (error) {
    res.status(400).json({ error: error.message });
}
});
  




app.put('/api/playerProfiles/:id',verifyToken, async (req, res) => {
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
  

app.get('/api/playerProfiles/:id/rankingHistory', verifyToken,async (req, res) => {
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
  

  // Only serve static assets if in production mode
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "public")));

  // Fallback to index.html for React SPA
  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
  });
} else {
  // For development, you might want to just log the route or set up a dummy handler.
  app.get("/", (req, res) => {
    res.send("Development mode: Frontend not served by Express.");
  });
}


  
  
