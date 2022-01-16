const express = require("express");
const jwt = require("jsonwebtoken");
const app = express();
app.use(express.json());

const users = [
    {
        id:"1",
        username:"absami",
        password:"absami1212",
        isAdmin:false,
    },
    {
        id:"2",
        username:"john",
        password:"john1212",
        isAdmin:true,
    }
];


app.post("/api/login",(req,res)=>{
    const {username, password} = req.body;
    const user = users.find((u)=>{
        return u.username === username && u.password === password;
    });
    if(user)
    {
        const token = jwt.sign({id:user.id,isAdmin:user.isAdmin,},"authToken");
        res.status(200).json({user,token});
    }
    else{
        res.status(500).json("Invalid credentials");
    }
})


const verify = (req, res, next)=>{
    const authHeader = req.headers.authorization;
    if(authHeader){
        const token = authHeader.split(" ")[1];
        jwt.verify(token,"authToken",(err,user)=>{
            if(err)
            {
                return res.status(403).json("Token is invalid");
            }
            req.user = user;
            next();
        });
    }
    else{
        res.status(401).json("You are not authenticated");
    }
}


app.post("/api/delete",verify,(req,res)=>{
    res.status(200).json("OK");
})

app.listen(5000,()=>{
    console.log("Application started...");
})