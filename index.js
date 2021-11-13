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
        const appointmentCollection = database.collection('appointments');
        const reviewCollection = database.collection('reviews');
        const usersCollection = database.collection('users');

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
        //Get appointments
        app.get('/appointments', async (req, res) => {
            const email = req.query.email;
            let query = {}
            if (email) {
                query = { customerEmail: email };
            }
            const cursor = appointmentCollection.find(query);
            const result = await cursor.toArray();
            res.json(result);

        })
        //post service
        app.post('/service', async (req, res) => {
            const service = req.body;
            const result = await servicesCollection.insertOne(service);
            res.json(result);
        })
        //post appointment
        app.post('/appointment', async (req, res) => {
            const appointment = req.body;

            const result = await appointmentCollection.insertOne(appointment);
            res.json(result);
        })
        // post review
        app.post('/review', async (req, res) => {
            const review = req.body;
            const result = await reviewCollection.insertOne(review);
            res.json(result);
        })
        //make admin
        app.put('/users/admin', async (req, res) => {
            const user = req.body;
            const filter = { email: user.email };
            console.log(user);
            const updateDoc = {
                $set: {
                    role: 'admin'
                }
            }
            const result = await usersCollection.updateOne(filter, updateDoc);
            console.log(result);
            res.json(result);
        })
        app.post('/users', async (req, res) => {
            const doc = req.body;
            const result = await usersCollection.insertOne(doc);
            res.json(result);
        })
        //get review
        app.get('/reviews', async (req, res) => {
            const cursor = reviewCollection.find({});
            const result = await cursor.toArray();
            res.json(result);
        })
        app.get('/users/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email: email }
            const result = await usersCollection.findOne(query);
            let isAdmin = false;
            if (result?.role == 'admin') {
                isAdmin = true;
            }
            res.json({ admin: isAdmin });
        })
        //apointment status update
        app.put('/appointment/:id', async (req, res) => {
            const id = req.params.id;
            const status = req.body;
            console.log(status);
            const filter = { _id: ObjectID(id) };
            const options = { upsert: true };
            const updateDoc = {
                $set: {
                    status: status.status
                }
            }
            const result = await appointmentCollection.updateOne(filter, updateDoc, options);
            res.json(result);
        })

        //apointment delete
        app.delete('/appointment/:id', async (req, res) => {
            const id = req.params.id;

            const query = { _id: ObjectID(id) };
            const result = await appointmentCollection.deleteOne(query);
            console.log(result);
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