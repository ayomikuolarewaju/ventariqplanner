import Link from "next/link";


export default function OrderTable({
orders
}:any){


return(

<div
className="
overflow-x-auto
"
>

<table
className="
w-full
bg-[#142050]
rounded
"
>


<thead>

<tr>

<th className="p-4">
Customer
</th>

<th>
Product
</th>

<th>
Status
</th>

<th>
Action
</th>

</tr>

</thead>



<tbody>


{
orders.map((order:any)=>(


<tr
key={order.id}
className="
border-t
border-blue-900
"
>


<td className="p-4">

{order.customers?.full_name}

<br/>

<span className="text-blue-300">

{order.customers?.email}

</span>

</td>



<td>

{order.product_sku}

</td>



<td>

{order.fulfillment_status}

</td>



<td>

<Link

href={`/admin/orders/${order.id}`}

className="
text-yellow-400
"

>

View

</Link>


</td>



</tr>


))

}


</tbody>


</table>


</div>

)

}