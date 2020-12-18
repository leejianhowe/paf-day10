const morgan = require('morgan')
const express = require('express')
const MongoClient = require('mongodb').MongoClient
const mysql = require('mysql2/promise')
const multer = require('multer')
const AWS = require('aws-sdk')
const sha1 = require('sha1')
const fs = require('fs')

const {makeQuery,checkSql} = require('./modules')


const PORT = parseInt(process.argv[2]) || parseInt(process.env.PORT) || 3000

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    connectionLimit:process.env.DB_CONNECTIONLIMIT,
    database: process.env.DB_NAME,
    timezone:'+08:00'
})

const SQL_AUTH_USER = 'SELECT * from user where user_id = ?'
const authUser = makeQuery(pool,SQL_AUTH_USER)
// multer
const DEST = 'uploads'
const upload = multer({ dest: DEST })

// AWS
const AWS_ENDPOINT = process.env.AWS_ENDPOINT || 'sfo2.digitaloceanspaces.com'
const AWS_BUCKET = process.env.BUCKET || 'storagedb'
const endpoint = new AWS.Endpoint(AWS_ENDPOINT)
const s3 = new AWS.S3({
    endpoint: endpoint,
})

// mongodb
const MONGO_URL = process.env.MONGO_URL || 'mongodb://localhost:27017'
const MONGO_DB = process.env.MONGO_DB || 'shared'
const MONGO_COL = process.env.MONGO_COL || 'thoughts'
const client = new MongoClient(MONGO_URL,{useNewUrlParser:true,useUnifiedTopology:true})

const app = express()

app.use(morgan('combined'))

// POST /login
app.post('/login',express.json(), async (req,res)=>{
	const userDetails = req.body
	// const conn = await pool.getConnection()
	const passwordSubmit = sha1(userDetails.password)
	console.log('passwordSubmit',passwordSubmit)
	try{
		// const result = await conn.query('SELECT * from user where user_id = ?',[userDetails.username])
		const result = await authUser(userDetails.username,passwordSubmit)
		// console.log('length',result[0].length)
		console.log(result)
		// if (result[0].length===0){
		// 	res.status(401).type('application/json').json({err:'user not incorrect'})
		// }else{
		// 	const passwordDB = result[0][0].password
		// 	console.log('passwordDB',passwordDB)
		// 	if(passwordDB==passwordSubmit){
		// 		res.status(200).type('application/json').json({user_id:userDetails.username,password:userDetails.password})
		// 	}
		// 	else{
		// 		res.status(401).type('application/json').json({err:'password incorrect'})
		// 	}
		// }
		if (result){
			res.status(200).type('application/json').json({user_id:userDetails.username,password:userDetails.password})
		}else{
			res.status(401).type('application/json').json({err:'invalid username/password'})
		}
	}catch(err){
		console.log(err)
	}
	
})

// POST /post
app.post('/post',upload.single('image'),async (req,res)=>{
	const file = req.file
	const body = req.body
	const userDetails = req.query
	console.log(file)
	console.log(body)
	console.log(userDetails)
	const passwordSubmit = sha1(userDetails.password)
	console.log('passwordSubmit',passwordSubmit)
	try{
		const result = await authUser(userDetails.username,passwordSubmit)
		if(!result){
			res.status(401).json({error:"invalid username/password"})
		}else{
			fs.readFile(req.file.path,(err,data)=>{
				if(err)
					return err
				const params = {
					Bucket: AWS_BUCKET,
					Key: req.file.filename,
					ACL:'public-read',
					Body: data,
					ContentType: req.file.mimetype,
					ContentLength: req.file.size,
				}
				s3.putObject(params,(err,data)=>{
					if(err)
						return res.status(500).json({error:err.message})
					console.log('sucessfully updated',data)
					const createdTime = new Date()
					client.db(MONGO_DB).collection(MONGO_COL).insertOne({
						title: req.body.title,
						comments: req.body.comments,
						createdTime: createdTime,
						imageRef: req.file.filename
						})
						.then(result=>{
							console.log('inserted id',result.insertedId)
							fs.unlink(req.file.path,(err)=>{
								if(err)
									console.log(err)
							})
							res.status(200).type('application/json').json({id:result.insertedId})
							
						})
						.catch(err=>{
							console.log(err)
							res.status(500).type('application/json').json({error:err.message})
						})
					
				})

			})

		}

	}catch(err){
		console.log(err)
		res.status(500).json({error:err.message})
	}
})

app.use(express.static('static'))

Promise.all([checkSql(pool),client.connect()])
	.then(()=>{
		app.listen(PORT, () => {
			console.info(`Application started on port ${PORT} at ${new Date()}`)
		})
	})
	.catch(err=>
		console.log(err)
	)

