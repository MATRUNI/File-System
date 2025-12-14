const express = require("express");
const cors= require("cors");
const path=require("path");
const app=express();

const {spawn}=require("child_process");
app.use(cors({
    methods:["GET","POST"],
    allowedHeaders:["Content-Type"]
}));
app.use(express.json());

const home=require("os").homedir();
let pwd=home;
const fs=require("fs");

class OpenFiles
{
    constructor(path)
    {
        this.opener(path);
        console.log(path);
    }
    opener(path)
    {
        let cmd;
        switch(process.platform)
        {
            case "win32":
                cmd="cmd";
                path=["/c","start","",path];
                break;
            case "darwin":
                cmd="open";
                path=[path];
                break;
            case "linux":
                cmd="gio";
                path=["open",path];
                break;
            default:
                console.log("Error while opening the File:",path);
                return;
        }

        spawn(cmd,path,{
            detached:true,
            stdio:"ignore",
        }).unref();
    }
}

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
            body:getIconByExtension(home,filterDot(fileNames)),
            folder:home
        });
    });
});

//call from fetcher function
app.post("/navigate",(req,res)=>{
    // console.log(req.body.forward,"Forwards here")
    if(req.body.forward)
    {
        pwd=path.normalize(req.body.body);
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
    // console.log(readFolder(pwd),"line 66");
    if(fs.statSync(pwd).isDirectory())
    {
        readFolder(pwd)
        .then(data=>{
            res.json({
                status:"Accepted",
                message:"folder",
                body:data
            });
        })
        .catch(e=>{console.log(e)});
    }
    else
    {
        new OpenFiles(pwd);
        res.json({
            status:"Accepted",
            message:"file"
        });
    }
});

function readFolder(path)
{
    return new Promise((resolve,reject)=>{
        fs.readdir(path, (err,file)=>{
            if(err)
            {
                reject("Error Occured while Reading the folder line 80:");
            }
            resolve(getIconByExtension(path,filterDot(file)));
        });
    })
}

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

app.post("/create",(req,res)=>{
    if(req.body.type==="folder")
    {
        fs.mkdir(path.join(pwd,req.body.name), (error)=>{
            if(error)
                console.log("Error Occured while make Folder:",req.body.name);
            readFolder(pwd)
            .then(data=>{
                res.json({
                    message:"Folder Created",
                    status:"OK",
                    data:data
                });
            })
            .catch(e=>{console.log(e)});
        })
        console.log(pwd);
    }
    else
    {
        fs.writeFile(path.join(pwd,req.body.name), "", (error)=>{
            if(error)
                console.log("Errpr Occured while creating File: ", req.body.name);
            readFolder(pwd)
            .then(data=>{
                res.json({
                    message:"Folder Created",
                    status:"OK",
                    data:data
                });
            })
            .catch(e=>{console.log(e)});
        });
    }
    console.log(req.body);
})

function icon(type,metadata)
{
    let icons=require("./icons.json");
    if(icons[type][metadata]===undefined)
    return;
    return icons[type][metadata]["icon"];
}
function getIconByExtension(way,x)
{
    let obj={};
    x.forEach(e=>{
            if(fs.statSync(path.join(way,e)).isDirectory())
            {
                obj[e]={icon:icon('folders', "default")};
            }
            else
            {
                // console.log(icon("files", extension(e)),": line 109",e);
                if(extension(e))
                {
                    obj[e]=extension(e)==="music"?{icon:icon('folders', "music")}:{icon:icon('files', extension(e))};
                    // console.log(extension(e),"line 113");
                    return;
                }
                obj[e]={icon:icon('files', "txt")};
            }
    });
    return obj;
}

function extension(s)
{   
    let audio_extensions = [
        ".mp3", ".wav", ".aac", ".flac", ".ogg", ".m4a", ".wma",
        ".aiff", ".alac", ".amr", ".opus", ".ra", ".gsm",
        ".au", ".swa", ".ape", ".tta", ".wv"
    ]
    let index=s.lastIndexOf(".");
    if(index===-1)
        return "";
    else if(audio_extensions.includes(s.slice(index)))
        return "music";
    return s.slice(index+1);
}
app.listen(3000, "127.0.0.1", ()=>{
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

class Section
{
    constructor()
    {
        this.callListener();
    }

    callListener()
    {
        app.post("/special",async (req,res)=>{
            console.log(req.body.folder);
            let newPath=path.join(home,req.body.folder);
            console.log(newPath);
            let data= await readFolder(newPath);
            
            res.json({
                status:200,
                message:"Accepted",
                data:data,
                path:newPath
            });
        })
    }
}
new Section();