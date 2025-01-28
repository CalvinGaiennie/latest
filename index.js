const express = require("express");
const { MongoClient } = require("mongodb");
require("dotenv").config();

const app = express();
app.use(express.json());

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
  res.json({ message: "Hello MongoDB!" });
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

// Start server
const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  connectToDb();
});
