const express = require("express");
const app = express();
const jwt = require('jsonwebtoken');
const cors = require("cors");
require("dotenv").config();
const port = process.env.PORT || 5000;

// middlewares
app.use(cors());
app.use(express.json());

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.0fn8ke9.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();

    const userCollection = client.db("voxlyDB").collection("users");
    const surveyCollection = client.db("voxlyDB").collection("surveys");

    // send users to database
    app.post("/users", async (req, res) => {
      const user = req.body;
      const query = { email: user.email };
      const existingUser = await userCollection.findOne(query);
      if (existingUser) {
        return res.send({ message: "user already exists", insertedId: null });
      }
      const result = await userCollection.insertOne(user);
      res.send(result);
    });

    // add surveys to mongodb
    app.post('/surveys', async(req, res) => {
      const survey = req.body; 
      const result = await surveyCollection.insertOne(survey); 
      res.send(result); 
    })

    // getting surveys from the database
    app.get('/surveys', async(req, res) => {
      const result = await surveyCollection.find().toArray(); 
      res.send(result); 
    })

    app.get('/users', async(req, res) => {
      const result = await userCollection.find().toArray(); 
      res.send(result); 
    })

    // api for load a specific survey
    app.get('/surveys/:id', async(req, res) => {
      const id = req.params.id; 
      const query = {_id: new ObjectId(id)}; 
      const result = await surveyCollection.findOne(query); 
      // console.log(result)
      if (result) {
        res.send(result);
      } else {
        res.status(404).send('Survey not found');
      }
      // res.send(result)
    })

    // delete a specific survey
    app.delete('/surveys/:id', async(req, res) => {
      const id = req.params.id;  
      const query = {_id: new ObjectId(id)}; 
      const result = await surveyCollection.deleteOne(query); 
      res.send(result); 
    })

    // admin api 
    app.patch('/users/admin/:id', async(req, res) => {
      const id = req.params.id; 
      const filter = {_id: new ObjectId(id)};
      const updatedDoc = {
        $set: {
          role: 'admin'
        }
      }
      const result = await userCollection.updateOne(filter, updatedDoc); 
      res.send(result); 
    })

    // delete ad specific user
    app.delete('/users/:id', async(req, res) => {
      const id = req.params.id; 
      const query = {_id: new ObjectId(id)};
      const result = await userCollection.deleteOne(query); 
      res.send(result)
    })

    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
    // console.log(
    //   "Pinged your deployment. You successfully connected to MongoDB!"
    // );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("voxly is running");
});

app.listen(port, () => {
  console.log(`my voxly is running from port : ${port}`);
});
