

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

class LocalStack
{
    getter(key)
    {
        return JSON.parse(localStorage.getItem(key))||[];
    }

    setStack(key, value)
    {
        let data=this.getter(key);
        limitStack(data);
        data.push(value);
        localStorage.setItem(key, JSON.stringify(data));
        console.log("Data Saved!");
    }
    setter(key, value)
    {
        localStorage.setItem(key, JSON.stringify(value));
        console.log("Setter Saved!");
    }
}
let localStorageInstance=new LocalStack();
document.getElementById('mode').addEventListener('click', (e)=>{
    document.body.classList.toggle("toogle-bg");
    e.currentTarget.classList.toggle("toogle-bg");
    document.getElementById("popup-item").classList.toggle("toogle-bg");
    const currentTheme=document.body.classList.contains("toogle-bg")?"dark":"light";
    localStorageInstance.setter("theme", currentTheme);
})


window.addEventListener("DOMContentLoaded", ()=>{
    let theme=localStorageInstance.getter("theme")||"light";
    if(theme==="light")
        return;
    document.body.classList.add("toogle-bg");
    document.getElementById("mode").classList.add("toogle-bg");
})

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
    // presentFolder(pwd[lastof(pwd)]);
    fetcher(pwd[lastof(pwd)], true);
});
// EventListener for forward and backward
head.addEventListener("click", e=>{
    const child=Array.from(head.children).indexOf(e.target.closest("div"));
    if(child===0&&pwd.length>=2)
    {
        pushStack.push(pwd.pop());
        presentFolder(pwd[lastof(pwd)]);
        fetcher(pwd[pwd.length-1],false);
    }
    else if(pushStack.length!==0&&child===1)
    {
        let x=pushStack.pop();
        pwd.push(x);
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
        if(dirArray.message==="folder")
        {
            if(Object.keys(dirArray.body).length!=0)
            {
                renderData(dirArray.body);
                console.log(dirArray.body)
            }
            else
            emptyFolder();
        }
        else
        {
            localStorageInstance.setStack("Recent", pwd[lastof(pwd)]);
            pwd.pop();
            presentFolder(pwd[lastof(pwd)]);
            console.log(dirArray);
        }
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
    display.innerHTML="";
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
        // console.log("Class section initialised")
        this.section=document.getElementById("section");
        this.listener();
    }

    listener()
    {
        this.section.addEventListener('click', e=>{
            // console.log("listener methid : ",e.target);
            if(e.target.classList.contains("nav-item"))
            {
                // console.log(e.target.textContent.slice(3));
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

function emptyFolder()
{
    display.innerHTML="";
    let element=document.createElement("div");
    element.id="sub";
    element.innerHTML=`
        <div class="circle">?!</div>
        <div class="top"></div>
        <div class="back"></div>
        <div class="front">
            <div id="transp"></div>
        </div>
        <p>Khali Hai Salle!!</p>
    `;
    display.appendChild(element);
    element.querySelector(".front").addEventListener("mouseenter", ()=>{
        let circle=element.querySelector(".circle");
        circle.classList.remove('animation');
        void circle.offsetWidth;
        circle.classList.add('animation');
    })
}
class RecentFIles
{
    constructor()
    {
        this.timeout=null;
        this.recent=document.getElementById("recent");
        this.item=document.getElementById("popup-item");
        this.recentItem=document.getElementById("recent-item");
        this.recentHeader=document.getElementById("recent-header");
        this.init();
    }
    async init()
    {
        this.dataObject=await this.initiateAPI();
        this.renderRecent();
        this.eventListeners();

    }
    async initiateAPI()
    {
        let recentArray=localStorageInstance.getter("Recent");
        let response=await fetch("http://localhost:3000/recent",{
            method:"POST",
            headers:{"Content-Type":"application/json"},
            body:JSON.stringify({data:recentArray})
        });
        response=await response.json();
        // console.log(response.status,": Status");
        return response;
    }
    eventListeners()
    {
        this.recent.addEventListener("mouseenter",()=>{
        //   this.removeTimeout(this.timeout);
          this.item.classList.remove("hidden");
          this.init();
        });
        this.recent.addEventListener("mouseleave",(e)=>{
            this.mouseLeave();
        });
        this.item.addEventListener("mouseenter", ()=>{
            this.removeTimeout(this.timeout);
        });
        this.item.addEventListener("mouseleave", ()=>{
            this.mouseLeave();
        });

        this.recentItem.addEventListener('click', async(e)=>{
            let index=Array.from(this.recentItem.children).indexOf(e.target.closest(".recent-children"));
            console.log(this.dataObject.path[index]);
            let response=await fetch("http://localhost:3000/recent-file",{
                method:"POST",
                headers:{"Content-Type":"application/json"},
                body:JSON.stringify({data:this.dataObject.path[index]})
            });
            this.instantFade();
            let result= await response;
            console.log(result.status);
        });

        document.getElementById("clear-recent").addEventListener('click', ()=>{
            console.log("Clear local Storage Clicked!!!");
            this.clearLocalStack();
            this.init();
        })
    }
    mouseLeave()
    {
        this.timeout=setTimeout(()=>{
          this.item.classList.add("hidden");
        },500)
    }
    instantFade()
    {
        this.item.classList.add("hidden");
    }
    removeTimeout(time)
    {
        clearTimeout(time);
    }
    renderRecent()
    {
        let recentItems=document.getElementById("recent-item");
        recentItems.textContent="";
        recentItems.innerHTML="";
        let count=0;
        for(let key in this.dataObject.data)
            {
            let divmain=document.createElement('div');
            divmain.classList.add("recent-children")
            let divSub=document.createElement('div');
            divSub.classList.add("recent-grand-children")
            let divIcon=document.createElement('div');
            divIcon.classList.add("file-icon");
            let divSubName=document.createElement('div');
            divSubName.classList.add("file-name")
            let divPath=document.createElement('div');
            divPath.classList.add("path");

            divSubName.textContent=key;
            divIcon.textContent=this.dataObject.data[key].icon;
            divPath.textContent=this.dataObject.path[count];

            divSub.append(divIcon,divSubName);

            divmain.append(divSub, divPath)

            recentItems.append(divmain)
            console.log(count)
            count++;
        }
    }
    clearLocalStack()
    {
        localStorage.removeItem("Recent");
    }
}
new RecentFIles();