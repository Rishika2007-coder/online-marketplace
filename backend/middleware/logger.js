const db=require('../config/db');

module.exports=async(req,res,next)=>{
    res.on('finish',()=>{
        if(req.user?.id){
            db.query(
                'INSERT INTO system_logs(user_id,action,description,ip_address) VALUES(?,?,?,?)',
                [
                    req.user.id,
                    req.method+' '+req.originalUrl,
                    `HTTP ${res.statusCode}`,
                    req.ip
                ]
            ).catch(()=>{});
        }
    });

    next();
};