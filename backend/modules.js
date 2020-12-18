const makeQuery = (pool,sql)=>{
    return async (values,password)=>{
        const conn = await pool.getConnection()
        try{
            const result = await conn.query(sql,[values])
            
            console.log('length',result[0].length)
		    // console.log(result)
            if (result[0].length===0){
                // res.status(401).type('application/json').json({err:'user not incorrect'})
                return false
            }else{
                const passwordDB = result[0][0].password
                console.log('passwordDB',passwordDB)
                if(passwordDB==password){
                    // res.status(200).type('application/json').json({user_id:userDetails.username,password:userDetails.password})
                    return true
                }
                else{
                    // res.status(401).type('application/json').json({err:'password incorrect'})
                    return false
                }
            }
        }catch(err){
            return err
        }finally{
            conn.release()
        }


    }

}

const checkSql = async(pool)=>{
	const conn = await pool.getConnection()
	try{
        await conn.ping()
        console.log('ping db')
		return true
	}catch(err){
		return err
	}finally{
		conn.release()
	}
}

const checkS3 = (s3)=>{
	new Promise((res,rej)=>{
    // checks for credentials from .aws file
    s3.config.getCredentials((err,data)=>{
		if(err)
			rej(err)
		res(true)
	})
})
}

const readFile = (fs,path)=>{
	return new Promise((res,rej)=>{
		fs.readFile(path,(err,data)=>{
			if(err)
				rej(err)
			res(data)
		})
	})
}

const putObject = (s3, file, data, bucket)=>{
	const params = {
		Bucket: bucket,
		Key: file.filename,
		ACL:'public-read',
		Body: data,
		ContentType: file.mimetype,
		ContentLength: file.size,
	}
	return new Promise((res,rej)=>{
		s3.putObject(params,(err,data)=>{
			if(err)
                rej(err)
            console.log('sucessfully updated',data)
			res(data)
		})
	})

}
const insertMongo = (body,file,client,MONGO_DB,MONGO_COL)=>{
	const createdTime = new Date()
	return client.db(MONGO_DB).collection(MONGO_COL).insertOne({
		title: body.title,
		comments: body.comments,
		createdTime: createdTime,
		imageRef: file.filename
		})
}


const deleteTempFiles = (fs,path)=>{
    fs.readdir(path.join(__dirname, 'uploads'),(err,files)=>{
        if(err)
            throw err
        if(files.length){
            console.log(`No of files in upload: ${files.length}`)
            console.log(files)
            files.forEach((ele)=>{
                fs.unlink(path.join(__dirname,'uploads',ele),()=>{
                })
            })
            console.log(`deleted ${files.length} files in uploads`) 
        }
    })
}

module.exports={makeQuery, checkSql, checkS3, readFile, putObject,insertMongo,deleteTempFiles}