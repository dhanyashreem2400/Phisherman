
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import axios from "axios"; 

dotenv.config({ path: '../.env' }); 


const app = express();
app.use(express.json());
app.use(cors({
  origin: "*", 
  methods: "GET,POST",
  allowedHeaders: "Content-Type"
}));

app.use((req, res, next) => {
  res.setHeader("Content-Security-Policy", "connect-src 'self' http://localhost:5000 http://localhost:5001 https://phisherman-974c.onrender.com");
  next();
});

const mongoURI = process.env.MONGO_URI;


if (!mongoURI) {
  throw new Error("Missing MONGO_URI in environment variables");
}


const cachedDB = mongoose.createConnection(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
const scrapedDB = mongoose.createConnection(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function connectDB() {
    try {
      await cachedDB.asPromise();
      await scrapedDB.asPromise();
      console.log("✅ Databases connected successfully");
    } catch (error) {
      console.error("❌ MongoDB Connection Error:", error);
    }
}
connectDB();

const CachedURLSchema = new mongoose.Schema({
  url: { type: String, required: true, unique: true },
  isPhishing: { type: Boolean, required: true },  
  probability: { type: Number, required: true }
});

const ScrapedURLSchema = new mongoose.Schema({
  url: { type: String, required: true, unique: true },
  isPhishing: { type: Boolean, required: true },
  source: { type: String, required: true },
});

// Models
const CachedURL = cachedDB.model("cachedurls", CachedURLSchema);
const ScrapedURL = scrapedDB.model("scrapedurls", ScrapedURLSchema);


app.get("/", (req, res) => {
  res.send(" Node backend is live!");
});

app.post("/add-url", async (req, res) => {
  try {
    const { url, source } = req.body;
    if (!url) return res.status(400).json({ error: "URL is required" });

    console.log("🔍 Checking DB for:", url);

    const exists = await CachedURL.exists({ url });
    if (exists) {
      console.log("⚠️ URL already exists!");
      return res.status(409).json({ message: "URL already reported" });
    }

    const newUrl = new CachedURL({
      url,
      source: source || "user_report",
      isPhishing: true,
      probability: 1,
    });

    await newUrl.save();
    console.log("🎉 URL added to DB!");
    res.json({ message: "URL added successfully", url });

  } catch (error) {
    console.error("❌ Error adding URL:", error.stack || error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});


app.post("/check-url", async (req, res) => {
  const { url } = req.body;
  if (!url) return res.status(400).json({ error: "URL is required" });

  try {
      const cached = await CachedURL.findOne({ url });
      const scraped = await ScrapedURL.findOne({ url });

      if (cached || scraped) {
          return res.json({
              message: "This url was found in our Phishing Database!!",
              isPhishing: true
          });
      }

      const mlResponse = await axios.post("https://phisherman-974c.onrender.com/predict", { url });

      const { isPhishing, probability } = mlResponse.data;

      res.json({ source: "ml-response", isPhishing, probability });

      const existingEntry = await CachedURL.exists({ url });

      if (!existingEntry && isPhishing === true) {
          const newEntry = new CachedURL({ url, isPhishing, probability });
          await newEntry.save();
      }

  } catch (error) {
      console.error("❌ Error checking URL:", error.message);
      res.status(500).json({ error: "Internal Server Error" });
  }
});


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on ${PORT}`);
});
