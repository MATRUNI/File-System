const express = require("express");
const cors= require("cors");
const path=require("path");
const app=express();
const icons=require("./icons.json");

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
        // console.log(path);
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
        res.json({
            // body:filterDot(fileNames),
            body:getIconByExtension(home,filterDot(fileNames)),
            folder:home
        });
    });
});

//call from fetcher function
app.post("/navigate",(req,res)=>{
    pwd=path.normalize(req.body.body);
    if(req.body.forward)
    {
        res.json({
            message:"Accepted",
            data:pwd
        });
    }
    else
    {
        res.json({
            message:"Accepted",
            data:pwd
        });
    }
});


//call from getCall function
app.get("/to",(req,res)=>{
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

function pathNormalise(add)
{
    return path.normalize(add);
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

app.post("/normalize",(req,res)=>{
    let arr=req.body.data;
    if(arr.length!=0)
    {
        arr.forEach(e=>{
            e=pathNormalise(e);
        });
        res.json({
            data:arr
        })
    }
})
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
                if(icon("folders", e))
                {
                    obj[e]={icon:icon('folders', e)};

                }
                else
                obj[e]={icon:icon('folders', "default")};
            }
            else
            {
                if(extension(e)==="music")
                {
                    obj[e] = { icon: icon('folders', "Music") };
                }
                else if (icon("files", extension(e)))
                {
                    obj[e] ={icon: icon('files', extension(e))};
                }
                else
                {
                    obj[e]={icon:icon('files', "doc")};
                }
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

class RecentFIles
{
    constructor()
    {
        this.recent=[];
        this.init();
        this.getAPI();
    }
    init()
    {
        app.post("/recent", async (req, res)=>{
            let newObj={};
            let fullPath=[];
            let s=req.body.data;
            s.forEach(element=>{
                newObj={...newObj,...getIconByExtension(path.dirname(element),[this.currentFileName(element)])};
                fullPath.push(element);
            });
            res.json({
                status:200,
                message: "Accepted",
                data:newObj,
                path:fullPath
            })
        })
    }
    currentFileName(filePath)
    {
        return path.basename(filePath);
    }
    getAPI()
    {
        app.post("/recent-file",(req,res)=>{
            new OpenFiles(req.body.data);
            res.json({
                status:200,
                message:"Success"
            })
        })
    }
}
new RecentFIles();

class Search
{
    constructor()
    {
        this.init();
    }
    init()
    {
        app.get("/search",async (req,res)=>{
            let query=Object.keys(req.query)[0];
            let path=req.query[query];
            let files=await this.search(path, query);
            let obj=this.getIcons(files);
            res.json({
                status:"200",
                message:"GHANTA!~",
                paths:files,
                dataObj:obj
            })
        })
    }
    search(address="",query)
    {
        //implement the search logic here
        if(this.stringCheck(query))
            return;
        let primaryCmd,cmd,fallBackCmd,cmd1;
        address=pathNormalise(address);
        switch(process.platform)
        {
            case "win32":
                cmd="powershell";
                address=address==""?"C:\\":address;
                primaryCmd=["Get-ChildItem","-Path",`"${address}"`,"-Filter",`"*${query}*"`,"-Recurse","-ErrorAction","SilentlyContinue","|","Select-Object","-ExpandProperty","FullName"].join(' ');
                primaryCmd=["-NoProfile","-Command",primaryCmd];
                cmd1="cmd.exe";
                fallBackCmd=["/c","dir",`"${address}\\*${query}*"`,"/s","/b"]
                break;
            case "darwin":
                cmd="mdfind";
                address=address==""?home:address;
                primaryCmd=["-onlyin",address,"-iname",`*${query}*`];
                cmd1="find";
                fallBackCmd=[address,"-iname",`*${query}*`];
                break;
            case "linux":
                cmd="locate";
                primaryCmd=[`*${query}*`];

                //this is the fallback logic, because my distro is so fucking modern that
                // mlocate doesn't comes for it yet
                cmd1="find";
                fallBackCmd=[address,"-iname",`*${query}*`]
                break;
            default:
                console.log("Error While searching... ",query)
                break;
        }
        return this.primarySearch(cmd, primaryCmd)
        .then(data=>{
            return data;
        })
        .catch(err=>{
            console.log("Primary Search failed!!")
            return this.primarySearch(cmd1, fallBackCmd)
            .then(data1=>{
                console.log("Secondary search complete:");
                return data1;
            })
            .catch(error=>{
                console.log(error);
            })
        });
    }
    primarySearch(cmd,command)
    {
        return new Promise((resolve,reject)=>{
            let child=spawn(cmd,command);
            let output="";
            child.stdout.on("data",(data)=>{
                output+=data.toString();
            });
            child.on("error",(err)=>{
                reject(err);
            });

            child.on("close", code=>{
                if(code!=0) return reject(new Error(`Exit Code ${code}`));
                resolve(output.trim().split(/\r?\n/));
            });
        })
    }
    stringCheck(str)
    {
        return str.trim().length ===0?true:false;
    }

    // following function is talking an array and giving out an Object
    // Array constains Absolute Paths of searched items,
    // returned object would have  names and icons for these items
    getIcons(arr)
    {
        let obj={};
        arr.forEach(item=>{
            let baseName=path.basename(item);
            if(this.stringCheck(item)&&fs.statSync(item).isDirectory())
            {
                if(icon("folders", baseName))
                {
                    obj[baseName]={icon:icon('folders', e)};

                }
                else
                obj[baseName]={icon:icon('folders', "default")};
            }
            else
            {
                if(extension(baseName)==="music")
                {
                    obj[baseName] = { icon: icon('folders', "Music") };
                }
                else if (icon("files", extension(baseName)))
                {
                    obj[baseName] ={icon: icon('files', extension(baseName))};
                }
                else
                {
                    obj[baseName]={icon:icon('files', "doc")};
                }
            }

        });
        return obj;
    }
}
new Search();