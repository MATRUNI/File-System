import re from "fs";
class Parser
{
    // constructor(data)
    // {
    //     this.data=data;
    // }
    icon(type,metadata)
    {
        let icons=require("../../icons.json");
        return icons[type][metadata]["icon"];
        // console.log(re);
    }
    check(x)
    {
        let obj={};
        x.forEach(e=>{
                if(re.statSync(e).isDirectory())
                {
                    obj+={name:e,icon:this.icon('folders', "default")}
                }
                else
                {
                    obj+={name:e,icon:this.icon('files', "txt")}
                }
        });
        return obj;
    }
}

// let cs=new Parser("folders","desktop");
// cs.icon();
export {Parser};
let te=document.getElementById("main-body");
console.log("Running!!");
te.addEventListener('click', e=>{
    let as=e.target.closest(".file-card");
    if(!as||!as.querySelector("p"))
        return
    console.log(as.querySelector("p").textContent);
})