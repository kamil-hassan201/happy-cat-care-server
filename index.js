const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { MongoClient } = require('mongodb');
const ObjectID = require("mongodb").ObjectId;

const app = express();
const port = process.env.PORT || 4000;
//middlewire
app.use(express.json());
app.use(cors());

//connection string
const uri = `mongodb+srv://${process.env.DB_KEY}:${process.env.DB_PASS}@cluster0.egzwo.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run() {
    try {
        await client.connect();

        const database = client.db("happycatDB");
        const servicesCollection = database.collection('services');

        //service get
        app.get('/services', async (req, res) => {
            const cursor = servicesCollection.find({});
            const result = await cursor.toArray();
            res.json(result);
        })
        app.get('/services/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectID(id) };

            const result = await servicesCollection.findOne(query);
            res.json(result);
        })
    }
    finally {

    }
}
run().catch(console.dir);

app.get('/', (req, res) => {
    res.json("Welcome to happy pet server");
})

app.listen(port, () => {
    console.log("listening to port ", port);
})