// const home=require("os").homedir();
// const fs=require("fs");

const display=document.getElementById("display-area")

const xml= new XMLHttpRequest();

let dirArray;
let pwd=["home"]
let pushStack=[];
const head=document.getElementById("head");
callingAPI(pwd)


display.addEventListener('click', item=>{
    pwd.push(item.target.textContent);
    pushStack.push(item.target.textContent);
    fetcher(item.target.textContent, true);
    // const xmr=new XMLHttpRequest();
    // xmr.open("POST", "http://localhost:3000");
    // xmr.setRequestHeader("Content-Type", "application/json");
    // xmr.send(JSON.stringify({body:(item.target).textContent,forward:true}));

    // getCall()
});

head.addEventListener("click", e=>{
    if(e.target.textContent==="<-")
    {
        let x=pwd.pop();
        pushStack.push(x)
        fetcher(x,false)
    }
    else if(pushStack.length!==0&&e.target.textContent==="->")
    {
        let x=pushStack.pop();
        pwd.push(x);
        fetcher(x, true);
    }
})


function fetcher(a, order)
{
    fetch("http://localhost:3000",{
        method: "POST",
        headers: {"Content-Type":"application/json"},
        body: JSON.stringify({body:a, forward:order})
    })
    .then(res=>res.json())
    .then(result=>{
        // console.log(result);
        getCall()
    }).catch(err=> console.log(err));
}
function getCall()
{
    const xhr=new XMLHttpRequest();

    xhr.open("GET", "http://localhost:3000")

    xhr.onload=()=>{
        createDivs(JSON.parse(xhr.responseText))
    }
    xhr.send();
}

function callingAPI(s)
{
    xml.open("GET", `http://localhost:3000/${s.join("/")}`)
    xml.onload=()=>{
        dirArray=JSON.parse(xml.responseText);

        createDivs(dirArray);
    }
    
    xml.send();
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