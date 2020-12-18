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

module.exports={makeQuery, checkSql}