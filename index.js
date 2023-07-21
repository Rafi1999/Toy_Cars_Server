const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()
//middleware
app.use(cors());
app.use(express.json());




const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.vw1cwl2.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
  useNewUrlParser: true,
  useUnifiedTopology: true,
  maxPoolSize: 10,
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    client.connect((err) => {
      if (err) {
        console.error(err);
        return;
      }
    });
    const toyCollection = client.db('toyStore').collection('toys');
    
    app.post('/addToy', async (req, res) => {
      const body = req.body;
      // console.log(body);
      const result = await toyCollection.insertOne(body);
      // console.log(result);
      res.send(result);
    })

    app.get('/allToys', async (req, res) => {
      const cursor = toyCollection.find({}).limit(20);
      const result = await cursor.toArray();
      res.send(result);
    }),
      app.get('/allToys/:text', async (req, res) => {
        if (req.params.text === 'Sports Car' || req.params.text === 'Regular Car' || req.params.text === 'Truck') {
          const result = await toyCollection.find({ subCategory: req.params.text }).toArray();
          return res.send(result)
        }
      })
    app.get('/allToyss/:id', async (req, res) => {
      const id = req.params.id;
      console.log(id);
      const query = { _id: new ObjectId(id) };
      const result = await toyCollection.findOne(query);
      res.send(result);
    });
    app.get("/getToysByText/:text", async (req, res) => {
      const text = req.params.text;
      const result = await toyCollection
        .find({
          $or: [
            { name: { $regex: text, $options: "i" } },

          ],
        })
        .toArray();
      res.send(result);
    });
    app.get("/myToys/:email", async (req, res) => {
      // console.log(req.params.email);
      const sort = req.query.sort; // Get the sort parameter from the query string

      let sortOption = {}; // Define an empty sort option object

      if (sort === 'high') {
        sortOption = { price: -1 }; // Sort by price in descending order (high to low)
      } else if (sort === 'low') {
        sortOption = { price: 1 }; // Sort by price in ascending order (low to high)
      }

      const toys = await toyCollection
        .find({
          sellerEmail: req.params.email,
        })
        .sort(sortOption) // Apply the sort option to the query
        .toArray();

      res.send(toys);
    });

    

    app.delete('/allToys/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await toyCollection.deleteOne(query);
      res.send({ result });

    });

    app.patch("/updateToy/:id", async (req, res) => {
      const id = req.params.id;
      const body = req.body;
      const filter = { _id: new ObjectId(id) };
      const updateDoc = {
        $set: {
          ...body
        },
      };
      const result = await toyCollection.updateOne(filter, updateDoc);
      res.send(result);
    });
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);



app.get('/', (req, res) => {
  res.send('Toy Car Server Running')
})


app.listen(port, () => {
  console.log(`Toy Store Server Running on ${port}`)
})