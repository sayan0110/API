// This will check the token and will verify it , it is present in the data base or not, if not then it won't give the permition to upload videos or to do any other operatoin.



const jwt = require("jsonwebtoken");

module.exports = async (req, res, next)=>{
    try{
        const token = req.headers.authorization.split(" ")[1];
        const decoded =await jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        // res.send ("check auth received");
        next();
    }
    catch(err){
        console.log(err);
        return res.status(401).json({
            error: "Auth Failed"
        });
    }
}