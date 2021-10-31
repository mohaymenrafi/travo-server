const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { MongoClient } = require('mongodb');
const { ObjectId } = require('mongodb');

const app = express();
const port = process.env.PORT || 5000;

// using middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.y5cda.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function run() {
  try {
    await client.connect();
    const database = client.db('travo');
    const packagesCollection = database.collection('tour-packages');
    const ordersCollection = database.collection('orders');

    // Get API
    app.get('/packages', async (req, res) => {
      const result = await packagesCollection.find({}).toArray();
      res.send(result);
    });

    // Get API for homepage
    app.get('/packages/home', async (req, res) => {
      const result = await packagesCollection.find({}).limit(6).toArray();
      res.send(result);
    });

    // Get single pack details
    app.get('/packages/:id', async (req, res) => {
      const { id } = req.params;
      const query = { _id: ObjectId(id) };
      const result = await packagesCollection.find(query).toArray();
      res.send(result);
    });

    // Post api for orders
    app.post('/orders', async (req, res) => {
      const newOrder = req.body;
      console.log(newOrder);
      const result = await ordersCollection.insertOne(newOrder);
      res.json(result);
    });
    // Get for orders
    app.get('/orders', async (req, res) => {
      const userEmail = req.query.email;
      const result = await ordersCollection.find({}).toArray();
      if (userEmail) {
        const newResult = result.filter((odr) => odr.email === userEmail);
        res.send(newResult);
      } else {
        console.log('working');
        res.send(result);
      }
    });

    // Post for adding a new service
    app.post('/packages', async (req, res) => {
      const newTourPack = req.body;
      const result = await packagesCollection.insertOne(newTourPack);
      res.json(result);
    });

    // order delete
    app.delete('/orders/:id', async (req, res) => {
      const { id } = req.params;
      console.log(id);
      const query = { _id: ObjectId(id) };
      const result = await ordersCollection.deleteOne(query);
      console.log(result);
      res.send(result);
    });

    // update status
    app.put('/orders/:id', async (req, res) => {
      const { id } = req.params;
      const status = req.body;
      const filter = { _id: ObjectId(id) };
      const options = { upsert: true };
      const updatedStatus = {
        $set: {
          status,
        },
      };
      const result = await ordersCollection.updateOne(
        filter,
        updatedStatus,
        options
      );
      res.json(result);
    });
  } finally {
    // await client.close();
  }
}

run().catch(console.dir);

app.get('/', (req, res) => {
  res.send('initial server setup is done for travo');
});

app.listen(port, () => {
  console.log('travo server is running at: ', port);
});
