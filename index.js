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



const generateAccessToken = (user) =>{
    return jwt.sign({id:user.id,isAdmin:user.isAdmin},"accesstoken",{
        expiresIn:"5m",
    });
}

const generateRefreshToken = (user) =>{
    return jwt.sign({id:user.id,isAdmin:user.isAdmin},"refreshtoken");
}

let refreshTokens = ["eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjEiLCJpc0FkbWluIjpmYWxzZSwiaWF0IjoxNjQyMzYwMTM5fQ.QkpudV0vtKJr-LSk0uNsmmyg8R6FhuF1j5romI3w6FM"];


app.post("/api/login",(req,res)=>{
    const {username, password} = req.body;
    const user = users.find((u)=>{
        return u.username === username && u.password === password;
    });
    if(user)
    {
        const accessToken = generateAccessToken(user);
        const refreshToken = generateRefreshToken(user);
        refreshTokens.push(refreshToken);
        res.status(200).json({user,accessToken,refreshToken,refreshTokens});
    }
    else{
        res.status(500).json("Invalid credentials");
    }
})


const verify = (req, res, next)=>{
    const authHeader = req.headers.authorization;
    if(authHeader){
        const token = authHeader.split(" ")[1];
        jwt.verify(token,"accesstoken",(err,user)=>{
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


app.post("/api/refresh",(req,res)=>{
    const refToken = req.body.token;
    // res.json(refreshTokens);
    //send err if there is no token or its invalid
        if(!refToken) return res.status(401).json("You are not authenticated");
        if(!refreshTokens.includes(refToken)){
            return res.status(403).json("Refresh token is invalid");
        }
        jwt.verify(refToken,"refreshtoken",(err,user)=>{
            err && console.log(err);
            refreshTokens = refreshTokens.filter((token)=> token !== refToken);
            const newAccessToken = generateAccessToken(user);
            const newRefreshToken = generateRefreshToken(user);
            refreshTokens.push(newAccessToken);
            res.status(200).json({
                accessToken:newAccessToken,
                refreshToken:newRefreshToken,
            });

        });
    // //if OK, create new token
})


app.post("/api/logout",verify,(req,res)=>{
    const refToken = req.body.token;
    refreshTokens = refreshTokens.filter((token)=>token!==refToken);
    res.status(200).json("Logout Successfully");
})

app.post("/api/delete",verify,(req,res)=>{
    res.status(200).json("OK");
})

app.listen(5000,()=>{
    console.log("Application started...");
})