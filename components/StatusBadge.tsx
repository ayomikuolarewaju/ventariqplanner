export default function StatusBadge({
status
}:{
status:string
}){


const colors:any={

awaiting_intake:
"bg-yellow-600",

intake_received:
"bg-blue-600",

processing:
"bg-purple-600",

delivered:
"bg-green-600",

fulfillment_failed:
"bg-red-600"

};


return(

<span
className={`
px-3
py-1
rounded-full
text-sm
${colors[status] || "bg-gray-600"}
`}
>

{status}

</span>

)

}