import { v } from "convex/values";
import dayjs from "dayjs";
import isToday from "dayjs/plugin/isToday";
import { action } from "./_generated/server";

dayjs.extend(isToday);

// As it is now, this function retrieves all of my user data from nix including `x-user-jwt`
// which is needed for many other endpoints
export async function signinUser() {
  const url = "https://trackapi.nutritionix.com/v2/auth/signin"
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-app-id": process.env.NIX_APP_ID!,
      "x-app-key": process.env.NIX_API_KEY!,
      "x-remote-user-id": "0"
    },
    body: JSON.stringify({
      "email": "mliggs12@gmail.com",
      "password": "Enlightened1!"
    })
  })
  if (!response.ok) {
    throw new Error(`${response.status} - ${response.statusText}`)
  }

  return await response.json()
}

export async function fetchUserFoodLog() {
  const url = `https://trackapi.nutritionix.com/v2/log/${process.env.NIX_USER_ID}?limit=100`
  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "x-app-id": process.env.NIX_APP_ID!,
      "x-app-key": process.env.NIX_API_KEY!,
      "x-user-jwt": process.env.NIX_USER_JWT!,
      "x-remote-user-id": "0",
    },
    cache: "no-store"
  })
  if (!response.ok) {
    throw new Error(`${response.status} - ${response.statusText}`)
  }

  const foodLog = await response.json()

  return await foodLog["foods"]
}

export async function fetchDayTotals({ date }: { date: any }) {
  const dateString = dayjs(date).format("YYYY-MM-DD")
  const isToday = dayjs(dateString).isToday()
  const url = `https://trackapi.nutritionix.com/v2/reports/totals/${process.env.NIX_USER_ID}?begin=${dateString}&end=${dateString}&timezone=US%2FMountain&today=${isToday}`

  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "x-app-id": process.env.NIX_APP_ID!,
      "x-app-key": process.env.NIX_API_KEY!,
      "x-user-jwt": process.env.NIX_USER_JWT!,
      "x-remote-user-id": "0",
    },
  })
  if (!response.ok) {
    throw new Error(`${response.status} - ${response.statusText}`)
  }

  const data = await response.json()

  return data["dates"][0]
}

export const getDayTotals = action({
  args: {
    date: v.string()
  },
  async handler(ctx, { date }) {
    return await fetchDayTotals({ date: dayjs(date).format("YYYY-MM-DD") })
  }
})