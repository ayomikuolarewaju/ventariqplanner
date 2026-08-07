"use client";

import { useState } from "react";
import { submitIntake } from "@/lib/api";
import { Input, Select, TextArea } from "./FormField";


export default function IntakeForm() {

const [loading,setLoading]=useState(false);
const [message,setMessage]=useState("");

const [form,setForm]=useState({
 order_id:"",
 arrival_airport:"",
 arrival_date:"",
 departure_date:"",
 host_city:"",
 hotel_area:"",
 match_details:"",
 group_size:1,
 traveler_type:"Individual",
 budget_level:"Moderate",
 transport_preference:"Not sure",
 food_needs:"",
 prayer_mosque_needs:false,
 accessibility_needs:"",
 languages_needed:"",
 special_requests:""
});


function update(
e:React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
){

const {name,value}=e.target;

setForm(prev=>({
 ...prev,
 [name]:
 name==="group_size"
 ? Number(value)
 : value
}));

}


async function submit(e:React.FormEvent){

e.preventDefault();

setLoading(true);

const payload={
 ...form,
 languages_needed:
 form.languages_needed
 .split(",")
 .map(x=>x.trim())
 .filter(Boolean)
};


try{

const result=await submitIntake(payload);

if(result.ok){

setMessage(
"Submitted successfully. Your travel plan is being prepared."
);

}

else{

setMessage("Submission failed.");

}


}catch(error){

setMessage(
"Unable to submit. Please fill form properly."
);

}


setLoading(false);

}



return (

<div className ="max-w-3xl mx-auto bg-[#142050] rounded-xl shadow-xl border border-yellow-500/30 p-8 text-white">


<h1 className="
text-3xl
font-bold
text-center
mb-3
">

Tell Us About Your World Cup Trip

</h1>


<p className="
text-blue-200
text-center
mb-8
">

Complete this after payment.
Your answers help us prepare your match-day or city plan.

</p>



<form 
onSubmit={submit}
className="space-y-5"
>


<Input
label="Order ID"
name="order_id"
value={form.order_id}
update={update}
/>


<Input
label="Arrival Airport"
name="arrival_airport"
placeholder="JFK, LAX, DFW, YYZ"
value={form.arrival_airport}
update={update}
/>


<Input
label="Arrival Date"
type="date"
name="arrival_date"
value={form.arrival_date}
update={update}
/>


<Input
label="Departure Date"
type="date"
name="departure_date"
value={form.departure_date}
update={update}
/>


<Input
label="Host City"
name="host_city"
placeholder="Dallas, Toronto..."
value={form.host_city}
update={update}
/>


<TextArea
label="Match Details"
name="match_details"
value={form.match_details}
update={update}
/>



<Input
label="Group Size"
type="number"
name="group_size"
value={form.group_size}
update={update}
/>



<Select
label="Traveler Type"
name="traveler_type"
options={[
"Individual",
"Family",
"Supporters Club / Group",
"Corporate / VIP"
]}
value={form.traveler_type}
update={update}
/>



<Select
label="Budget Level"
name="budget_level"
options={[
"Budget-conscious",
"Moderate",
"Premium"
]}
value={form.budget_level}
update={update}
/>



<TextArea
label="Food Needs"
name="food_needs"
placeholder="Halal, African food, vegetarian..."
value={form.food_needs}
update={update}
/>



<label className="flex gap-3 items-center">

<input
type="checkbox"
name="prayer_mosque_needs"
checked={form.prayer_mosque_needs}
onChange={(e)=>
setForm({
...form,
prayer_mosque_needs:e.target.checked
})
}
/>

Mosque/prayer guidance needed

</label>




<TextArea
label="Special Requests"
name="special_requests"
value={form.special_requests}
update={update}
/>



<button
disabled={loading}
className="
w-full
bg-[#E8002D]
hover:bg-red-700
py-3
rounded-lg
font-bold
transition
"
>

{
loading
?
"Submitting..."
:
"Submit Trip Details"
}

</button>



<p className="text-center mt-4 text-green-300">

{message}

</p>


</form>

</div>

);

}