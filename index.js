require('dotenv').config()
const express = require('express');
const app = express()
const cors = require('cors');
const { MongoClient } = require('mongodb');
const fileUpload = require('express-fileupload');
const ObjectID = require('mongodb').ObjectId;
const port = process.env.PORT || 7000

app.use(cors());
app.use(express.json())
app.use(fileUpload())

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.tmheq.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run() {
    try {
        await client.connect();
        const univeDb = client.db('unive')
        const courseCollection = univeDb.collection('courses')
        // const reviewCollection = titanDB.collection('reviews')
        // const orderCollection = titanDB.collection('orders')
        const userCollection = univeDb.collection('users')
        const recruitCollection = univeDb.collection('recruits')
        const scholarshipCollection = univeDb.collection('scholarships')



        // registering users for the first time
        app.post('/user', async (req, res) => {
            const user = req.body;
            const result = await userCollection.insertOne(user);
            console.log('success');
            // res.json(result);
        });
        //checking admin or not
        app.get('/user/:email', async (req, res) => {
            console.log('hitting admin/tutor check')
            const email = req.params.email;
            const query = { email: email };
            const result = await userCollection.findOne(query);
            let Isadmin = false;
            let Istutor = false;
            if (result?.role == 'admin') {
                Isadmin = true
                // res.json({ admin: Isadmin, tutor: false });
            }
            else if (result?.role == 'tutor') {
                Istutor = true
                // res.json({ admin: false, tutor: Istutor });
            }
            console.log('success');
            res.json({ admin: Isadmin, tutor: Istutor });

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
        app.put('/admin/:email', async (req, res) => {

            const email = req.params.email;
            const query = { email: email };
            // const result = await userCollection.findOne(query);
            const updateDoc = { $set: { role: 'admin' } };
            const result = await userCollection.updateOne(query, updateDoc);
            res.json(result);



        });
        // tutor
        app.put('/tutor/:email', async (req, res) => {

            const email = req.params.email;
            const query = { email: email };
            // const result = await userCollection.findOne(query);
            const updateDoc = { $set: { role: 'tutor' } };
            const result = await userCollection.updateOne(query, updateDoc);
            res.json(result);



        });
        // get courses
        app.get('/courses', async (req, res) => {
            const courseData = await courseCollection.find({})
            const courseDataArray = await courseData.toArray()
            res.json(courseDataArray)
        })
        // course by id
        app.get('/course/:id', async (req, res) => {
            console.log('getting course by id')
            const cursor = req.params.id
            const filter = { _id: ObjectID(cursor) }
            const courseData = await courseCollection.findOne(filter)
            res.json(courseData)
        })
        // courses by tag
        app.get('/courses/:tag', async (req, res) => {
            const tag = req.params.tag;
            const query = { tag: tag };
            const result = await courseCollection.find(query);
            const courseDataArray = await result.toArray()
            res.json(courseDataArray)
        })
        // sending data to db
        app.post('/courses', async (req, res) => {
            const data = req.body
            const result = await courseCollection.insertOne(data);
            res.send(result.acknowledged)
        })
        // registering users for the first time
        app.post('/scholarship', async (req, res) => {
            const { FullName, email, PhoneNumber, edu_qualification, platform_learn, scholarship_need } = req.body
            const pdf = req.files.pdf
            const pdfData = pdf.data
            const encodedPdf = pdfData.toString('base64')
            const Pdfbuffer = Buffer.from(encodedPdf, 'base64')
            const data = {
                FullName, email, PhoneNumber, edu_qualification, platform_learn, scholarship_need, pdf: Pdfbuffer
            }
            const result = await scholarshipCollection.insertOne(data);
            res.json(result)
        });

        // sending recruit data to db
        app.post('/recruit', async (req, res) => {
            const data = req.body
            const result = await recruitCollection.insertOne(data);
            res.send(result.acknowledged)
        })

    } finally {
        // client.close()
    }
}
run().catch(console.dir)
app.get('/', (req, res) => {
    res.send('connected')
})
app.listen(port, () => console.log('connected at ', port))