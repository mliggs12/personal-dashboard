
import { timestampToShortDateTime } from "@/lib/date.utils";

export default function NutritionHomePage({ data }: { data: any }) {
  return (
    <div className="flex flex-col h-full md:px-4">
      <h1 className="hidden md:block font-semibold text-2xl">Nutrition HomePage</h1>
      <div>
        <h2 className="text-2xl mb-4">User Food Log</h2>
        <ul className="space-y-2">
          {data.map((food: any) => (
            <li key={food.id} className="flex items-center gap-4">
              {/* <Image src={food.photo.thumb} alt="food" width={55} height={55} /> */}
              <div className="w-full flex items-center justify-between">
                <div>
                  <div className="truncate">{food.food_name}</div>
                  <div>{food.serving_qty} {food.serving_unit}</div>
                </div>
                <div>{food.meal_type} {timestampToShortDateTime(food.consumed_at)}</div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}