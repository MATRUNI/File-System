// const home=require("os").homedir();
// const fs=require("fs");

const display=document.getElementById("display-area")

const xml= new XMLHttpRequest();

let dirArray;
let pwd=["home"]

callingAPI(pwd)


display.addEventListener('click', item=>{
    pwd.push(item.target.textContent);

    fetch("http://localhost:3000",{
        method: "POST",
        headers: {"Content-Type":"application/json"},
        body: JSON.stringify({body:item.target.textContent, forward:true})
    })
    .then(res=>res.json())
    .then(result=>{
        console.log(result);
        getCall()
    }).catch(err=> console.log(err));
    // const xmr=new XMLHttpRequest();
    // xmr.open("POST", "http://localhost:3000");
    // xmr.setRequestHeader("Content-Type", "application/json");
    // xmr.send(JSON.stringify({body:(item.target).textContent,forward:true}));

    // getCall()
});

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