// const home=require("os").homedir();
// const fs=require("fs");

const display=document.getElementById("display-area")

const xml= new XMLHttpRequest();

xml.open("GET", "http://localhost:3000/home")

xml.onload=()=>{
    let dataArray=JSON.parse(xml.responseText);

    dataArray.forEach(element => {
        display.textContent+="\t"+element;
    });
}

xml.send();

//for milisecond to date conversion
// function msToDate(str)
// {
//     return new Promise((resolve, rejects)=>{
//         fs.stat(str, (err, stat)=>{
//         if(err)
//             rejects(err);
//         resolve(new Date(stat.birthtimeMs));
//         });
//     });
// }
// msToDate(".")
// .then(time=>{
//     console.log(time.toLocaleString());
// }).catch(console.error());

// //to get the files and folders at home
// fs.readdir(home, (err, data)=>{
//     if(err)
//         throw err;
//     data=filterDot(data);
//     console.log(filterDot(data));
// });

// //filters the hidden file
// function filterDot(item)
// {
//     return item.filter(e=>{
//         if(e[0]!=".")
//             return e;
//     });
// }