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
    fs.readdir(home, (err,fileNames)=>{
        if(err)
            throw err;
        // console.log(check(filterDot(fileNames)));
        res.json({
            // body:filterDot(fileNames),
            body:check(filterDot(fileNames)),
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
            body:check(filterDot(fileNames))
        });
    });
});

// call from hoverSize function
app.post("/size",(req,res)=>{
    console.log(req.body.folder)
    fs.stat(req.body.folder,(err,fileInfo)=>{
        if(err)
            console.log(err);
        console.log(fileInfo);
    });
    res.json({
        message:"Accepted"
    });
});

function icon(type,metadata)
{
    let icons=require("../icons.json");
    // console.log(icons[type][metadata]["icon"]);
    return icons[type][metadata]["icon"];
}
function check(x)
{
    let obj={};
    x.forEach(e=>{
            if(fs.statSync(pwd+"/"+e).isDirectory())
            {
                obj[e]={icon:icon('folders', "default")}
            }
            else
            {
                obj[e]={icon:icon('files', "txt")}
            }
    });
    return obj;
}

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