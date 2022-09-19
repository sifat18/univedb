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
        const deletedCourseCollection = univeDb.collection('deletedCourses')

        // const reviewCollection = titanDB.collection('reviews')
        // const orderCollection = titanDB.collection('orders')
        const resumeCollection = univeDb.collection('resume')
        const userCollection = univeDb.collection('users')
        const recruitCollection = univeDb.collection('recruits')
        const demoCollection = univeDb.collection('demo')
        const employerCollection = univeDb.collection('employer')
        const enterpriceCollection = univeDb.collection('enterprice')
        const orgRecruitCollection = univeDb.collection('recruitOrg')
        const instructorApplyCollection = univeDb.collection('instructorAply')
        const scholarshipCollection = univeDb.collection('scholarships')
        const contributerApplyCollection = univeDb.collection('contributerAply')



        // registering users for the first time
        app.post('/api/user', async (req, res) => {
            const user = req.body;
            user.active = true
            let time = new Date().toJSON().slice(0, 10).replace(/-/g, '/');
            user.firstLogin = time
            console.log(user.firstLogin);
            user.date = time
            const result = await userCollection.insertOne(user);
            console.log('success');
            res.json(result);
        });
        // registering active status 
        app.put('/api/active', async (req, res) => {
            console.log('hit');
            const { email, status } = req.body
            const query = { email: email };
            let time = new Date().toJSON().slice(0, 10).replace(/-/g, '/');
            const updateDoc = { $set: { "active": status, "date": time } };
            console.log('daon');
            const result = await userCollection.updateOne(query, updateDoc);
            console.log(result);
            res.json(result);
        });
        // getting all users 
        app.get('/api/users', async (req, res) => {
            const userData = await userCollection.find({})
            const userDataArray = await userData.toArray()
            res.json(userDataArray)
        })
        //checking admin or not
        app.get('/api/user/:email', async (req, res) => {
            console.log('hitting admin/tutor check')
            const email = req.params.email;
            const query = { email: email };
            const result = await userCollection.findOne(query);
            let Isadmin = false;
            let Istutor = false;
            let IsEmployer = false;
            if (result?.role == 'admin') {
                Isadmin = true
                // res.json({ admin: Isadmin, tutor: false });
            }
            else if (result?.role == 'tutor') {
                Istutor = true
                // res.json({ admin: false, tutor: Istutor });
            }
            else if (result?.role == 'employer') {
                IsEmployer = true
                // res.json({ admin: false, tutor: Istutor });
            }
            console.log('success');
            res.json({ admin: Isadmin, tutor: Istutor, employer: IsEmployer });

        });
        app.put('/api/user', async (req, res) => {
            const user = req.body;
            let time = new Date().toJSON().slice(0, 10).replace(/-/g, '/');
            user.firstLogin = time
            const cursor = { email: user.email };
            const option = { upsert: true };
            const updateDoc = { $set: user };
            const result = await userCollection.updateOne(cursor, updateDoc, option);
            // res.json(result);
            console.log('success put')
        });
        app.put('/api/admin/:email', async (req, res) => {

            const email = req.params.email;
            const query = { email: email };
            // const result = await userCollection.findOne(query);
            const updateDoc = { $set: { role: 'admin' } };
            const result = await userCollection.updateOne(query, updateDoc);
            res.json(result);



        });
        // tutor
        app.put('/api/tutor/:email', async (req, res) => {

            const email = req.params.email;
            const query = { email: email };
            // const result = await userCollection.findOne(query);
            const updateDoc = { $set: { role: 'tutor' } };
            const result = await userCollection.updateOne(query, updateDoc);
            res.json(result);



        });
        // employer
        app.put('/api/employer/:email', async (req, res) => {
            console.log('hit employer');
            const email = req.params.email;
            const query = { email: email };
            // const result = await userCollection.findOne(query);
            const updateDoc = { $set: { role: 'employer' } };
            const result = await userCollection.updateOne(query, updateDoc);
            res.json(result);



        });
        // get courses
        app.get('/api/mycourse', async (req, res) => {
            const { _id, email } = req.query
            // console.log(_id, email);
            const filter = { email: email, 'course._id': _id }
            const courseData = await orderCollection.findOne(filter)
            const { course } = courseData
            res.json(course)
        })
        app.get('/api/courses', async (req, res) => {
            const courseData = await courseCollection.find({})
            const courseDataArray = await courseData.toArray()
            res.json(courseDataArray)
        })
        // course by id
        app.get('/api/course/:id', async (req, res) => {
            console.log('getting course by id')
            const cursor = req.params.id
            const filter = { coursename: cursor }
            const courseData = await courseCollection.findOne(filter)
            res.json(courseData)
        })
        // delete course by id
        app.delete('/api/course/:id', async (req, res) => {
            const cursor = req.params.id
            const filter = { coursename: cursor }
            const data = await courseCollection.deleteOne(filter)
            res.send(data)
        })
        // courses by tag
        app.get('/api/courses/:tag', async (req, res) => {
            const tag = req.params.tag;
            const query = { tag: tag };
            const result = await courseCollection.find(query);
            const courseDataArray = await result.toArray()
            res.json(courseDataArray)
        })
        // sending data to db
        app.post('/api/courses', async (req, res) => {
            const data = req.body
            const result = await courseCollection.insertOne(data);
            res.send(result.acknowledged)
        })
        app.post('/api/deletedcourses', async (req, res) => {
            const data = req.body
            const result = await deletedCourseCollection.insertOne(data);
            res.send(result.acknowledged)
        })
        app.put('/api/courses/edit/:id', async (req, res) => {
            const id = req.params.id;
            const data = req.body
            console.log('hit');
            // console.log(data);
            const filter = { coursename: id }
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
        app.post('/api/scholarship', async (req, res) => {
            const { FullName, email, PhoneNumber, edu_qualification, platform_learn, scholarship_need } = req.body
            const pdf = req.files.pdf
            const pdfData = pdf.data
            let status='pending'
            const encodedPdf = pdfData.toString('base64')
            const Pdfbuffer = Buffer.from(encodedPdf, 'base64')
            const data = {
                FullName, email, status, PhoneNumber, edu_qualification, platform_learn, scholarship_need, pdf: Pdfbuffer
            }
            const result = await scholarshipCollection.insertOne(data);
            res.json(result)
        });
         // getting scholarshi[] time
         app.get('/api/scholarship', async (req, res) => {
            const result = await scholarshipCollection.find({});
            const resultArray = await result.toArray()
            res.json(resultArray)
        });

        // data to db data of those want to talk with representative  
        app.post('/api/representative', async (req, res) => {
            const data = req.body
            data.status='pending'
            const result = await recruitCollection.insertOne(data);
            res.send(result.acknowledged)
        })
        // getting data of those want to talk with representative  

        app.get('/api/representative', async (req, res) => {
            const result = await recruitCollection.find({});
            const resultArray = await result.toArray()
            res.json(resultArray)
        })
        // sending demo request data to db
        app.post('/api/demo', async (req, res) => {
            const data = req.body
            data.status='pending'
            const result = await demoCollection.insertOne(data);
            res.send(result.acknowledged)
        })
        // getting demo request data to db
        app.get('/api/demo', async (req, res) => {
            const result = await demoCollection.find({});
            const resultArray = await result.toArray()
            res.json(resultArray)
        })
        // employer profile
        app.post('/api/employerProfile', async (req, res) => {
            const data = req.body
            console.log('inside profile');
            const result = await employerCollection.insertOne(data);
            res.send(result.acknowledged)
        })
        // sending price request data to db
        app.post('/api/enterprice', async (req, res) => {
            const data = req.body
            data.status='pending'
            const result = await enterpriceCollection.insertOne(data);
            res.send(result.acknowledged)
        })
        // getting price request data to db
        app.get('/api/enterprice', async (req, res) => {
            const result = await enterpriceCollection.find({});
            const resultArray = await result.toArray()
            res.json(resultArray)
        })
        // sending organization that want to try unive recruitment
        app.post('/api/unive_recruitement', async (req, res) => {
            const data = req.body
            data.status='pending'
            const result = await orgRecruitCollection.insertOne(data);
            res.send(result.acknowledged)
        })
        // getting organization data from db
        app.get('/api/unive_recruitement', async (req, res) => {
            const result = await orgRecruitCollection.find({});
            const resultArray = await result.toArray()
            res.json(resultArray)
        })
        // sending instructor data to db
        app.post('/api/instructor', async (req, res) => {
            const { FullName, email, PhoneNumber, subject } = req.body
            const pdf = req.files.pdf
            const pdfData = pdf.data
           let status='pending'
            const encodedPdf = pdfData.toString('base64')
            const Pdfbuffer = Buffer.from(encodedPdf, 'base64')
            const data = {
                FullName, email,status, PhoneNumber, subject, pdf: Pdfbuffer
            }
            const result = await instructorApplyCollection.insertOne(data);
            res.send(result)
        })
        // want to be unive instructor
        app.get('/api/instructor', async (req, res) => {
            const result = await instructorApplyCollection.find({});
            const resultArray = await result.toArray()

            res.json(resultArray)
        })

        // sending instructorForm2 data to db
        // app.post('/api/instructorForm2', async (req, res) => {
        //     const data = req.body
        //     const result = await instructorApplyCollection2.insertOne(data);
        //     res.send(result.acknowledged)
        // })
        app.post('/api/order', async (req, res) => {
            // console.log("posted")
            const query = req.body;
            const { course, email } = query
            console.log(course.coursename);
            const filter = { email: email, 'course.coursename': course.coursename }

            const check = await orderCollection.findOne(filter);
            if (check) {
                let insertedId = 0
                res.json({ insertedId })
            } else {
                query.course.progress = 0;
                query.course.modComplete = 0;
                const result = await orderCollection.insertOne(query);
                // console.log(result)
                res.json(result)
            };

        })
        app.get('/api/order/:mail', async (req, res) => {
            const filter = req.params.mail;
            const query = { email: filter }
            const data = await orderCollection.find(query).toArray();
            res.send(data)
        })
        app.put('/api/orderUpdate', async (req, res) => {
            console.log('orderupdate put');
            const { index, email, id, mod, progress } = req.body;
            // console.log(email, id, mod, progress);
            const filter = { email: email, 'course._id': id }
            const data = await orderCollection.updateOne(filter, {
                $set: {
                    'course.progress': progress,
                    'course.modComplete': mod,
                    "course.Module.$[element].mod_complete": true,
                }
            },
                {
                    arrayFilters: [{ "element.module_name": index }]
                }
            );
            console.log(data)
            res.send(data)
        })

        // sending contributer data to db
        app.post('/api/contributer', async (req, res) => {
            const { FullName, email, PhoneNumber, subject } = req.body
            const pdf = req.files.pdf
            const pdfData = pdf.data
           let status='pending'
           const encodedPdf = pdfData.toString('base64')
            const Pdfbuffer = Buffer.from(encodedPdf, 'base64')
            const data = {
                FullName, email,status, PhoneNumber, subject, pdf: Pdfbuffer
            }
            const result = await contributerApplyCollection.insertOne(data);
            res.send(result)
        })
        // geting contributer data 
        app.get('/api/contributer', async (req, res) => {
            const result = await contributerApplyCollection.find({});
            const resultArray = await result.toArray()

            res.json(resultArray)
        })

        // registering resumes 
        app.put('/api/resume/:email', async (req, res) => {
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
        app.get('/api/resume', async (req, res) => {
            const resumeData = await resumeCollection.find({})
            const resumeDataArray = await resumeData.toArray()
            res.json(resumeDataArray)


        });
        // get resumes by id
        app.get('/api/candidate/:id', async (req, res) => {
            const cursor = req.params.id
            const filter = { _id: ObjectID(cursor) }

            const resumeData = await resumeCollection.findOne(filter)
            res.json(resumeData)

        });

    } finally {
        // client.close()
    }
}
run().catch(console.dir)
app.get('/api', (req, res) => {
    res.send('connected')
})
app.listen(port, () => console.log('connected at ', port))