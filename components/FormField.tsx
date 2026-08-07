export function Input({label,...props}:any){
return(
<div>
<label className="block font-bold mb-2">{label}</label>
<input {...props} className=" w-full rounded-lg p-3 text-black"/>
</div>)};


export function TextArea({label,...props}:any){
return(
<div>
<label className="block font-bold mb-2">{label}</label>
<textarea {...props} className="w-full rounded-lg p-3 text-black"/>
</div>
)}


export function Select({label,options,...props}:any){
return(
<div>
<label className="block font-bold mb-2">{label}</label>
<select {...props} className=" w-full rounded-lg p-3 text-black">
{options.map((x:string)=>(<option key={x}>{x}</option>))}
</select>
</div>)};