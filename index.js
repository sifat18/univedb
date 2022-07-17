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
        const orderCollection = univeDb.collection('orders')

        // const reviewCollection = titanDB.collection('reviews')
        // const orderCollection = titanDB.collection('orders')
        const resumeCollection = univeDb.collection('resume')
        const userCollection = univeDb.collection('users')
        const recruitCollection = univeDb.collection('recruits')
        const orgRecruitCollection = univeDb.collection('recruitOrg')
        const instructorApplyCollection = univeDb.collection('instructorAply')
        const instructorApplyCollection2 = univeDb.collection('instructorAply2')
        const scholarshipCollection = univeDb.collection('scholarships')
        const contributerApplyCollection = univeDb.collection('contributerAply')



        // registering users for the first time
        app.post('/user', async (req, res) => {
            const user = req.body;
            const result = await userCollection.insertOne(user);
            console.log('success');
            // res.json(result);
        });
        // getting all users 
        app.get('/users', async (req, res) => {
            const userData = await userCollection.find({})
            const userDataArray = await userData.toArray()
            res.json(userDataArray)
        })
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
        app.get('/mycourse', async (req, res) => {
            const { _id, email } = req.query
            // console.log(_id, email);
            const filter = { email: email, 'course._id': _id }
            const courseData = await orderCollection.findOne(filter)
            const { course } = courseData
            res.json(course)
        })
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
        app.put('/courses/edit/:id', async (req, res) => {
            const id = req.params.id;
            const data = req.body
            console.log('hit');
            // console.log(data);
            const filter = { _id: ObjectID(id) };
            const { _id, ...rest } = { ...data }
            // dont need the commented lines 
            // const option = { upsert: true };
            // console.log(rest);
            const updateDoc = { ...rest }
            const result = await courseCollection.replaceOne(filter, updateDoc);
            //   edit trials
            // let resp = await courseCollection.find(filter);
            // let entry = await courseCollection.insertOne(data);
            // let resp = await courseCollection.findOneAndReplace(filter, updateDoc, { upsert: true });

            // console.log(result)

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
        // sending organization data to db
        app.post('/orgFrom', async (req, res) => {
            const data = req.body
            const result = await orgRecruitCollection.insertOne(data);
            res.send(result.acknowledged)
        })
        // sending instructor data to db
        app.post('/instructor', async (req, res) => {
            const { FullName, email, PhoneNumber, subject } = req.body
            const pdf = req.files.pdf
            const pdfData = pdf.data
            const encodedPdf = pdfData.toString('base64')
            const Pdfbuffer = Buffer.from(encodedPdf, 'base64')
            const data = {
                FullName, email, PhoneNumber, subject, pdf: Pdfbuffer
            }
            const result = await instructorApplyCollection.insertOne(data);
            res.send(result)
        })

        // sending instructorForm2 data to db
        app.post('/instructorForm2', async (req, res) => {
            const data = req.body
            const result = await instructorApplyCollection2.insertOne(data);
            res.send(result.acknowledged)
        })
        app.post('/order', async (req, res) => {
            // console.log("posted")
            const query = req.body;
            query.course.progress = 0;
            query.course.modComplete = 0;
            const result = await orderCollection.insertOne(query);
            // console.log(result)
            res.json(result)
        })
        app.get('/order/:mail', async (req, res) => {
            const filter = req.params.mail;
            const query = { email: filter }
            const data = await orderCollection.find(query).toArray();
            res.send(data)
        })
        app.put('/orderUpdate', async (req, res) => {
            console.log('orderupdate put');
            const {index,email, id, mod, progress } = req.body;
            // console.log(email, id, mod, progress);
            const filter = { email: email, 'course._id': id }
            const data = await orderCollection.updateOne(filter, {
                $set: {
                    'course.progress': progress,
                    'course.modComplete': mod,
                    "course.Module.$[element].mod_complete": true,
                }},
                { 
                   arrayFilters: [ { "element.module_name": index } ] }
            );
            console.log(data)
            res.send(data)
        })

        // sending contributer data to db
        app.post('/contributer', async (req, res) => {
            const { FullName, email, PhoneNumber, subject } = req.body
            const pdf = req.files.pdf
            const pdfData = pdf.data
            const encodedPdf = pdfData.toString('base64')
            const Pdfbuffer = Buffer.from(encodedPdf, 'base64')
            const data = {
                FullName, email, PhoneNumber, subject, pdf: Pdfbuffer
            }
            const result = await contributerApplyCollection.insertOne(data);
            res.send(result)
        })

        // registering resumes 
        app.put('/resume/:email', async (req, res) => {
            // console.log('hit', req.params.email);
            const data = req.body
            // console.log(data);
            const filter = { "basics.email": req.params.email };
            const option = { upsert: true };
            const updateDoc = { ...data }
            const result = await resumeCollection.replaceOne(filter, updateDoc, option);
            console.log(result);
            res.send(result.acknowledged);


        });
        // get resumes 
        app.get('/resume', async (req, res) => {
            const resumeData = await resumeCollection.find({})
            const resumeDataArray = await resumeData.toArray()
            res.json(resumeDataArray)


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