

const display=document.getElementById("display-area")
const head=document.getElementById("head");
const currentFolder=document.getElementById("current-folder");
const copiedBox=document.getElementById("copied-box");
const homePage=document.getElementById("home");

const xml= new XMLHttpRequest();

let dirArray;
let pwd=["home"];
let pushStack=[];
let toClipBoard;        //store the location for clipboard
callingAPI(pwd);


display.addEventListener('dblclick', item=>{
    pwd.push(pwd[lastof(pwd)]+"/"+item.target.textContent);
    presentFolder(pwd[lastof(pwd)])
    fetcher(pwd[lastof(pwd)], true);
});

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

homePage.addEventListener('click', ()=>{
    callingAPI(["home"]);
    pushStack=[];
})

// display.addEventListener("mouseover", (e)=>{
//     let str=e.target;
//     hoverSize(str.textContent);
// },true);
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
        // console.log("Call createDivs function!");
        createDivs(dirArray.body);
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
        createDivs(dirArray.body);
    }
    
    xml.send();
}

function limitStack(stack)
{
    return stack.length<10?stack:stack.shift();
}

function createDivs(arr)
{
    display.innerText="";
    arr.forEach(a=>{
        let div=document.createElement("div");
        div.textContent=a;
        div.tabIndex=0;
        display.appendChild(div);
    })
}

function presentFolder(a)
{
    toClipBoard=a;
    currentFolder.textContent="Current-Folder: "+a.substring(a.lastIndexOf("/")+1);
    currentFolder.title=a+" (Double click to Copy to the ClipBoard)";
}

currentFolder.addEventListener("dblclick", ()=>{
    // this should copy from toClipBoard variable to the clicp board 
    navigator.clipboard.writeText(toClipBoard)
    .then(addClass)
    .catch(err=>{console.log(err)});
})
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