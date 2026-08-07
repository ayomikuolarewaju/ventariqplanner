import CityCard from "@/components/CityCard";
import {cities} from "@/lib/cities";


export default function Cities(){


return(

<main
className="
container
py-20
"
>


<h1
className="
text-5xl
font-bold
"
>

World Cup Host Cities

</h1>



<div
className="
grid
md:grid-cols-3
gap-6
mt-10
"
>

{
cities.map(city=>(

<CityCard
key={city.slug}
city={city}
/>

))
}


</div>


</main>

)

}