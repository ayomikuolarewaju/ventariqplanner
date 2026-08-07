export async function submitIntake(data:any){

const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/intake`,
{
method:"POST",
headers:{
"Content-Type":"application/json"
},
body:JSON.stringify(data)
});

return res.json();

}