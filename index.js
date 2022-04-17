require('dotenv').config()
const express = require('express');
const app = express()
const cors = require('cors');
const { MongoClient } = require('mongodb');
const ObjectID = require('mongodb').ObjectId;
const port = process.env.PORT || 7000

app.use(cors());
app.use(express.json())

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.tmheq.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run() {
    try {
        await client.connect();
        const univeDb = client.db('unive')
        // const watchCollection = titanDB.collection('watches')
        // const reviewCollection = titanDB.collection('reviews')
        // const orderCollection = titanDB.collection('orders')
        const userCollection = univeDb.collection('users')



        // registering users for the first time
        app.post('/user', async (req, res) => {
            const user = req.body;
            const result = await userCollection.insertOne(user);
            console.log('success');
            // res.json(result);
        });
        //checking admin or not
        app.get('/user/:email', async (req, res) => {
            console.log('hitting admin check')
            const email = req.params.email;
            const query = { email: email };
            const result = await userCollection.findOne(query);
            let Isadmin = false;
            if (result?.role == 'admin') {
                Isadmin = true
            }
            console.log('success');
            res.json({ admin: Isadmin });
        });
        app.put('/user', async (req, res) => {
            const user = req.body;
            const cursor = { email: user.email };
            const option = { upsert: true };
            const updateDoc = { $set: user };
            const result = await userCollection.updateOne(cursor, updateDoc, option);
            // res.json(result);
            console.log('success put')
        });
        app.put('/admin/email', async (req, res) => {

            const user = req.body;
            const requesterAccount = await userCollection.findOne({ email: requester });
            if (requesterAccount.role === 'admin') {
                const filter = { email: user.email };
                const updateDoc = { $set: { role: 'admin' } };
                const result = await userCollection.updateOne(filter, updateDoc);
                res.json(result);
            }
            else {
                res.status(403).json({ message: 'you do not have access to make admin' })
            }

        });




    } finally {
        // client.close()
    }
}
run().catch(console.dir)
app.get('/', (req, res) => {
    res.send('connected')
})
app.listen(port, () => console.log('connected at ', port))