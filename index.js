const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 3000;
require('dotenv').config()
const { MongoClient, ServerApiVersion } = require('mongodb');


// Middleware
app.use(cors());
app.use(express.json());






const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.v2vmn0v.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection


      const parcelCollections = client.db('parcelDB').collection("parcels");

      app.post('/parcels', async (req, res) => {

      const newParcel = req.body;
      const result = await parcelCollections.insertOne(newParcel);
      res.send(result);
    });

    // Find the all posts
    app.get('/parcels', async (req, res) => {
      const result = await parcelCollections.find().toArray();
      res.send(result);

    });


















    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

// Routes
app.get('/', (req, res) => {
  res.send('server is getting start 1');
});


app.listen(port, () => {
  console.log(`server start on port ${port}`);

})