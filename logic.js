

const display=document.getElementById("display-area")
const head=document.getElementById("head");
const currentFolder=document.getElementById("current-folder");
const copiedBox=document.getElementById("copied-box");
const homePage=document.getElementById("home");
const newBtn=document.getElementById("create-New");

const xml= new XMLHttpRequest();

let dirArray;
let pwd=["home"];
let pushStack=[];
let toClipBoard;        //store the location for clipboard
callingAPI(pwd);

class CreateModal
{
    constructor()
    {
        this.modal=document.querySelector(".modal");
        this.name=document.getElementById('create-name');
        this.createCancel=document.querySelectorAll(".check");
        this.radios=document.querySelectorAll('input[name="check-Point"]');
        
        this.createBtn=document.getElementById("create");
        this.cancelBtn=document.getElementById("cancel");

        this.createCallBack=null;

        this.createBtn.addEventListener('click', ()=>{
            if(this.createCallBack)
            {
                let data=this.getData();
                this.createCallBack(data);
                this.close();
            }
        });

        this.cancelBtn.addEventListener('click', ()=>{
            this.onCancel();
        });

        document.querySelector(".modal-content").addEventListener('click', (event)=>{
            event.stopPropagation();
        })
        this.modal.addEventListener('click', ()=>{
            this.onCancel();
        });
    }

    open(type)
    {
        this.modal.classList.remove('hidden');
        this.name.textContent="";
        this.name.focus();
        if(type==="folder")
        {
            this.radios[0].checked=true;
        }
        else
            this.radios[1].checked=true;
    }
    close()
    {
        this.modal.classList.add("hidden");
    }

    getData()
    {
        return {
            name:this.name.value,
            type:document.querySelector("input[name='check-Point']:checked").value
        }
    }
    onCancel()
    {
        this.close();
    }
    onCreate(callback)
    {
        this.createCallBack=callback;
    }
    showErrorMessage()
    {
        return;
    }
}

// event Listener to copy the path to the clipBoard
currentFolder.addEventListener("dblclick", ()=>{
    // this should copy from toClipBoard variable to the clip board 
    console.log("ClipBoard Listner");
    navigator.clipboard.writeText(toClipBoard)
    .then(addClass)
    .catch(err=>{console.log(err)});
})

const modal= new CreateModal(); 
newBtn.addEventListener("click",()=>{
    modal.open("folder");
    modal.onCreate((data)=>{
        console.log(data);
        createFileAndFolder(data.name, data.type);
    });
})
// Eventlistener for the main files
display.addEventListener('dblclick', item=>{
    let clicked=item.target.closest(".file-card");
    if(!clicked || !clicked.querySelector("p"))
        return;
    pwd.push(pwd[lastof(pwd)]+"/"+clicked.querySelector("p").textContent);
    presentFolder(pwd[lastof(pwd)])
    fetcher(pwd[lastof(pwd)], true);
});
// EventListener for forward and backward
head.addEventListener("click", e=>{
    const child=Array.from(head.children).indexOf(e.target.closest("div"));
    console.log(child);
    if(child===0&&pwd.length>=2)
    {
        console.log("If condtion here")
        pushStack.push(pwd.pop());
        console.log("pwd:",pwd);
        console.log("pushStack",pushStack);
        // console.log("Sending False here")
        presentFolder(pwd[lastof(pwd)]);
        fetcher(pwd[pwd.length-1],false);
    }
    else if(pushStack.length!==0&&child===1)
    {
        console.log("Else if condition here")
        let x=pushStack.pop();
        pwd.push(x);
        console.log("pwd",pwd)
        console.log("pushStack",pushStack)
        presentFolder(x);
        fetcher(x, true);
    }
    limitStack(pushStack);
})
// EventListener for title
homePage.addEventListener('click', ()=>{
    callingAPI(["home"]);
    pushStack=[];
})

function fetcher(a, order)
{
    // console.log("Got here:", order,"&&&",a)
    fetch("http://localhost:3000/navigate",{
        method: "POST",
        headers: {"Content-Type":"application/json"},
        body: JSON.stringify({body:a, forward:order})
    })
    .then(res=>res.json())
    .then(result=>{
        //this one line took me hours to fix lol, why? because i put the get call function in .then directly, it was executing synchronously
        getCall();
    }).catch(err=> console.log(err));
}
function getCall()
{
    const xhr=new XMLHttpRequest();

    xhr.open("GET", "http://localhost:3000/to")

    xhr.onload=()=>{
        dirArray=JSON.parse(xhr.responseText);
        // console.log(dirArray.body);
        // console.log("Call renderData function!");
        renderData(dirArray.body);
    }
    xhr.send();
}

function callingAPI(s)
{
    xml.open("GET", `http://localhost:3000/${s.join("/")}`)
    xml.onload=()=>{
        dirArray=JSON.parse(xml.responseText);
        pwd=[];
        pwd.push(dirArray.folder);
        console.log(pwd,"in callingAPI function")
        presentFolder(pwd[lastof(pwd)]);
        renderData(dirArray.body);
    }
    
    xml.send();
}
// this function will create new file or folder
function createFileAndFolder(name,type)
{
    fetch("http://localhost:3000/create",{
        method: "POST",
        headers: {"Content-Type":"application/json"},
        body: JSON.stringify({name:name, type:type})
    })
    .then(res=>res.json())
    .then((response)=>{
        console.log(response.status);
        renderData(response.data);
    })
    .catch(err=>[console.log(err)]);
}

function limitStack(stack)
{
    return stack.length<10?stack:stack.shift();
}

function renderData(arr)
{
    display.innerText="";
    Object.keys(arr).forEach(a=>{
        let div=document.createElement("div");
        let child=document.createElement("div");
        let p=document.createElement("p");
        div.classList.add("file-card");
        child.classList.add("file-icon");
        p.classList.add("file-name");
        p.textContent=a;
        child.textContent=arr[a].icon;
        div.tabIndex=0;
        div.append(child);
        div.append(p);
        display.append(div)
    })
}

function presentFolder(a)
{
    toClipBoard=a;
    currentFolder.textContent="Current-Folder: "+a.substring(a.lastIndexOf("/")+1);
    currentFolder.title=a+" (Double click to Copy to the ClipBoard)";
}

function lastof(a)
{
    return a.length-1;
}

function addClass()
{
    copiedBox.classList.add("show");
    setTimeout(() => {
        copiedBox.classList.remove("show");
    }, 1000);
}


// this is for future, file size indexing
function hoverSize(str)
{
    console.log(str,"in hover size");
    fetch("http://localhost:3000/size",{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body: JSON.stringify({folder:pwd[lastof(pwd)]+"/"+str})
    })
    .then(res=>res.json())
    .then(result=>{
        console.log(result)
    })
    .catch(err=>console.log(err))
}

class Section
{
    constructor()
    {
        console.log("Class section initialised")
        this.section=document.getElementById("section");
        this.listener();
    }

    listener()
    {
        this.section.addEventListener('click', e=>{
            console.log("listener methid : ",e.target);
            if(e.target.classList.contains("nav-item"))
            {
                console.log(e.target.textContent.slice(3));
                this.callBackend(e.target.textContent.slice(3));
            }
        });
    }

    async callBackend(path)
    {
        let result=await fetch("http://localhost:3000/special",{
            method:"POST",
            headers:{"Content-Type":"application/json"},
            body:JSON.stringify({folder:path})
        });
        result=await result.json();
        pwd.push(result.path);
        renderData(result.data);
    }
}
new Section();