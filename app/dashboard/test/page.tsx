import { fetchDayTotals, fetchUserFoodLog } from "@/convex/nutritionix";

import NutritionHomePage from "./nutrition-homepage";

export default async function ServerNutritionHomePage() {
  const now = Date.now()
  const day = "2025-06-27"

  const foods = await fetchUserFoodLog()
  const todayTotals = await fetchDayTotals({ date: day })
  console.log(todayTotals)

  return <NutritionHomePage data={foods} />
}
