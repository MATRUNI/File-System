

const display=document.getElementById("display-area")

const xml= new XMLHttpRequest();

let dirArray;
let pwd=["home"]
let pushStack=[];
const head=document.getElementById("head");
callingAPI(pwd);


display.addEventListener('click', item=>{
    pwd.push(pwd[pwd.length-1]+"/"+item.target.textContent);
    fetcher(pwd[pwd.length-1], true);
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
        fetcher(pwd[pwd.length-1],false);
    }
    else if(pushStack.length!==0&&child===1)
    {
        console.log("Else if condition here")
        let x=pushStack.pop();
        pwd.push(x);
        console.log("pwd",pwd)
        console.log("pushStack",pushStack)
        fetcher(x, true);
    }
    limitStack(pushStack);
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
        pwd.pop();
        pwd.push(dirArray.folder);
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
        display.appendChild(div);
    })
}