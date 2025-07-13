const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 3000;
require('dotenv').config()
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');


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



    // Create a new parcel
    app.post('/parcels', async (req, res) => {
      try {
        const newParcel = req.body;
        const result = await parcelCollections.insertOne(newParcel);
        res.status(201).send(result);
      } catch (error) {
        console.error('Error inserting parcel:', error);
        res.status(500).send({ message: 'Failed to create parcel' });
      }
    });


    // Get all parcels or parcels by user email
    app.get('/parcels', async (req, res) => {
      try {
        const userEmail = req.query.email;

        const query = userEmail ? { senderEmail: userEmail } : {};
        const options = {
          sort: { createdAt: -1 }, // Newest first
        };

        const parcels = await parcelCollections.find(query, options).toArray();
        res.send(parcels);
      } catch (error) {
        console.error('Error fetching parcels:', error);
        res.status(500).send({ message: 'Failed to get parcels' });
      }
    });
    //get a single parcel by id

    app.get('/parcels/:id', async (req, res) => {
      try {
        const parcelId = req.params.id;

        const parcel = await parcelCollections.findOne({ _id: new ObjectId(parcelId) });


        res.send(parcel);
      } catch (error) {
        console.error('Error fetching parcel by ID:', error);
        res.status(500).send({ message: 'Failed to get parcel by ID' });
      }
    });

    //Delete a parcel by id
    app.delete('/parcels/:id', async (req, res) => {
      try {
        const parcelId = req.params.id;
        const result = await parcelCollections.deleteOne({ _id: new ObjectId(parcelId) });
        res.send(result);
      } catch (error) {
        console.error('Error deleting parcel:', error);
        res.status(500).send({ message: 'Failed to delete parcel' });
      }
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