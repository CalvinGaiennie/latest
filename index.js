const express = require("express");
const { MongoClient, ObjectId } = require("mongodb");
require("dotenv").config();
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri, {
  ssl: true,
  tls: true,
  tlsAllowInvalidCertificates: false,
  minPoolSize: 1,
  maxPoolSize: 10,
});

async function connectToDb() {
  try {
    await client.connect();
    console.log("Connected to MongoDB");

    // Test the connection by inserting a document
    const database = client.db("test");
    const collection = database.collection("test_collection");

    // Insert a test document
    await collection.insertOne({
      message: "Test document",
      timestamp: new Date(),
    });
    console.log("Successfully inserted test document");

    // Retrieve all documents
    const documents = await collection.find({}).toArray();
    console.log("Retrieved documents:", documents);
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
  }
}

// Basic route to test the API
app.get("/", (req, res) => {
  res.json({ message: "Hello MongoDB!!!!" });
});

// Add a new route to get all documents
app.get("/documents", async (req, res) => {
  try {
    const database = client.db("test");
    const collection = database.collection("test_collection");
    const documents = await collection.find({}).toArray();
    res.json(documents);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Serve static files from public directory
app.use(express.static("public"));
app.use(cors());
// Add a new route to create a document
app.post("/documents", async (req, res) => {
  try {
    const database = client.db("test");
    const collection = database.collection("test_collection");
    const document = {
      message: req.body.message,
      timestamp: new Date(),
    };
    await collection.insertOne(document);
    res.status(201).json(document);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add this after your other routes
app.delete("/documents/:id", async (req, res) => {
  try {
    const database = client.db("test");
    const collection = database.collection("test_collection");
    const result = await collection.deleteOne({
      _id: new ObjectId(req.params.id),
    });
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: "Document not found" });
    }
    res.status(200).json({ message: "Document deleted" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Start server
const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  connectToDb();
});
