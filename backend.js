const express = require("express");
const cors= require("cors");

const app=express();

app.use(cors({
    origin:"*",
    methods:["GET","POST"],
    allowedHeaders:["Content-Type"]
}));
app.use(express.json());

const home=require("os").homedir();
let pwd=home;
const fs=require("fs");


//this is to check what ##frontEnd is requesting##

app.use((req, res, next) => {
  console.log("REQUEST:", req.method, req.url);
  next();
});


//for the first call
app.get("/home",(req, res)=>{
    fs.readdir(pwd, (err,fileNames)=>{
        if(err)
            throw err;
        res.json({
            body:filterDot(fileNames),
            folder:home
        });
    });
});

//call from fetcher function
app.post("/navigate",(req,res)=>{
    // console.log(req.body.forward,"Forwards here")
    if(req.body.forward)
    {
        pwd=req.body.body;
        // console.log(pwd, "line 32")
        res.json({
            message:"Accepted",
            data:pwd
        });
    }
    else
    {
        pwd=req.body.body;
        // console.log(pwd,"line 41");
        res.json({
            message:"Accepted",
            data:pwd
        });
    }
});


//call from getCall function
app.get("/to",(req,res)=>{
    fs.readdir(pwd,(err, fileNames)=>{
        if(err)
            throw err;
        res.json({
            body:filterDot(fileNames)
        });
    });
});


app.listen(3000, ()=>{
    console.log("Server Running on port: 3000");
    console.log("http://localhost:3000");
})

function filterDot(item)
{
    return item.filter(e=>{
        if(e[0]!=".")
            return e;
    });
}