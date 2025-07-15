const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 3000;
require('dotenv').config()
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const stripe = require('stripe')(process.env.PAYMENT_GATEWAY_KEY);

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


        const db = client.db('parcelDB'); // database name
        const parcelCollections = db.collection('parcels');
        const paymentsCollection = db.collection('payments');




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

     // get payment history
     app.get('/payments', async (req, res) => {
            try {
                const userEmail = req.query.email;

                const query = userEmail ? { email: userEmail } : {};
                const options = { sort: { paid_at: -1 } }; // Latest first

                const payments = await paymentsCollection.find(query, options).toArray();
                res.send(payments);
            } catch (error) {
                console.error('Error fetching payment history:', error);
                res.status(500).send({ message: 'Failed to get payments' });
            }
        });

        // POST: Record payment and update parcel status
        app.post('/payments', async (req, res) => {
            try {
                const { parcelId, email, amount, paymentMethod, transactionId } = req.body;

                // 1. Update parcel's payment_status
                const updateResult = await parcelCollections.updateOne(
                    { _id: new ObjectId(parcelId) },
                    {
                        $set: {
                            paymentStatus: 'paid'
                        }
                    }
                );

                if (updateResult.modifiedCount === 0) {
                    return res.status(404).send({ message: 'Parcel not found or already paid' });
                }

                // 2. Insert payment record
                const paymentDoc = {
                    parcelId,
                    email,
                    amount,
                    paymentMethod,
                    transactionId,
                    paid_at_string: new Date().toISOString(),
                    paid_at: new Date(),
                };

                const paymentResult = await paymentsCollection.insertOne(paymentDoc);

                res.status(201).send({
                    message: 'Payment recorded and parcel marked as paid',
                    insertedId: paymentResult.insertedId,
                });

            } catch (error) {
                console.error('Payment processing failed:', error);
                res.status(500).send({ message: 'Failed to record payment' });
            }
        });



     app.post('/create-payment-intent', async (req, res) => {
            const amountInCents = req.body.amountInCents
            try {
                const paymentIntent = await stripe.paymentIntents.create({
                    amount: amountInCents, // Amount in cents
                    currency: 'usd',
                    payment_method_types: ['card'],
                });

                res.json({ clientSecret: paymentIntent.client_secret });
            } catch (error) {
                res.status(500).json({ error: error.message });
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