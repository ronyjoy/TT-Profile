// In your server.js or routes file
const express = require('express');

const fs = require("fs");
const path = require("path");
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const cors = require('cors');
const app = express();
require("dotenv").config();
const jwt = require("jsonwebtoken");

app.use(passport.initialize());

app.use(cors());

const REACT_APP_FRONT_END_URL = process.env.REACT_APP_FRONT_END_URL || "http://localhost:5001";


const ALLOWED_EMAILS = [
  "ronyjoy@gmail.com",
  "admin@lonestartabletennis.com",
  "rj@lonestartabletennis.com",
  "offybee3@gmail.com",
  "pada.tanv@gmail.com",
  "edaythelion@gmail.com",
  "sathish.sh@gmail.com",
  "Siva.Subbiah@gmail.com"
];

// File path for users if you need to persist allowed users (optional)
const USERS_FILE = path.join(__dirname, "data", "users.json");


// Ensure the directory exists
const dir = path.dirname(USERS_FILE);
if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir, { recursive: true });
}

// Ensure the file exists
if (!fs.existsSync(USERS_FILE)) {
  fs.writeFileSync(USERS_FILE, "[]", "utf-8");
}

function loadUsers() {
  if (!fs.existsSync(USERS_FILE)) return [];
  return JSON.parse(fs.readFileSync(USERS_FILE, "utf-8"));
}

function saveUser(user) {
  const users = loadUsers();
  if (!users.find(u => u.googleId === user.googleId)) {
    users.push(user);
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
  }
}

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

        if (!ALLOWED_EMAILS.includes(email)) {
          return done(null, false, { message: "Unauthorized email." });
        }

        const user = {
          googleId: profile.id,
          name: profile.displayName,
          email: email,
        };

        // Optionally store user in file (not necessary unless you want it)
        saveUser(user);

        return done(null, user);
      } catch (error) {
        return done(error, null);
      }
    }
  )
);


  // Redirect to Google OAuth
app.get("/auth/google", passport.authenticate("google", { scope: ["profile", "email"] }));

const FRONTEND_URL = process.env.REACT_APP_FRONT_END_URL || "http://localhost:3000";

app.get("/auth/google/callback", (req, res, next) => {
  passport.authenticate("google", { session: false }, (err, user, info) => {
    if (err || !user) {
      return res.redirect("/login");
    }

    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.redirect(`${process.env.REACT_APP_FRONT_END_URL}/?token=${token}`);
  })(req, res, next);
});

// Logout
app.get("/auth/logout", (req, res) => {
  req.logout(() => {
    res.redirect("/");
  });
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


app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
const PORT = process.env.PORT || 5001; // or 5001, as intended
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));


app.use("/uploads", express.static(path.join(__dirname, "uploads")));

const playersPath = path.join(__dirname, "data", "players.json");
const historyPath = path.join(__dirname, "data", "rankingHistory.json");

function loadPlayers() {
  return JSON.parse(fs.readFileSync(playersPath, "utf-8") || "[]");
}

function savePlayers(players) {
  fs.writeFileSync(playersPath, JSON.stringify(players, null, 2));
}

function loadHistory() {
  return JSON.parse(fs.readFileSync(historyPath, "utf-8") || "[]");
}

function saveHistory(entries) {
  fs.writeFileSync(historyPath, JSON.stringify(entries, null, 2));
}

// POST: Create new profile
app.post("/api/playerProfiles", (req, res) => {
  const players = loadPlayers();
  const newProfile = { ...req.body, id: Date.now().toString(), coachRankings: {} };
  players.push(newProfile);
  savePlayers(players);
  res.status(201).json(newProfile);
});

app.put("/api/playerProfiles/:id", (req, res) => {
  const { id } = req.params;
  const { coachName, rankings, comments } = req.body;
  console.log("Incoming update payload:", req.body);

  const players = loadPlayers();
  const player = players.find(p => p.id === id);
  if (!player) return res.status(404).json({ error: "Profile not found" });

  if (coachName && rankings) {
    player.coachRankings[coachName] = rankings;
  }
  if (comments !== undefined) {
    player.comments = comments;
  }

  savePlayers(players);
  console.log("✅ Saved player data");

  if (coachName && rankings) {
    const history = loadHistory();
    history.push({
      playerId: id,
      coachRankings: { [coachName]: rankings },
      averageRatings: computeAverageRatings(player.coachRankings),
      createdAt: new Date()
    });
    saveHistory(history);
    console.log("✅ Saved ranking history");
  }

  res.json(player);
});


// GET: All profiles
app.get("/api/playerProfiles", (req, res) => {
  const players = loadPlayers();
  res.json(players);
});

// GET: Ranking history
app.get("/api/playerProfiles/:id/rankingHistory", (req, res) => {
  const { id } = req.params;
  const history = loadHistory();
  const filtered = history.filter(h => h.playerId === id);
  res.json(filtered);
});

// Helper to compute average ratings
function computeAverageRatings(coachRankings) {
  const allAttrs = Object.keys(Object.values(coachRankings)[0] || {});
  const result = {};
  allAttrs.forEach(attr => {
    let sum = 0, count = 0;
    for (const coach in coachRankings) {
      const val = coachRankings[coach][attr];
      if (val > 0) {
        sum += val;
        count++;
      }
    }
    result[attr] = count > 0 ? Math.round(sum / count) : 0;
  });
  return result;
}
