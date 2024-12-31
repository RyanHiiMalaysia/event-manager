"use client"
export default function Page(){
    const a = async () =>{
        const response = await fetch("api/checkDeadline");
        if(!response.ok){alert("something is wrong")}

        const data = await response.json()
        console.log(data);

    }

    return (<div><button onClick={a}>Click me to check database</button></div>)
}