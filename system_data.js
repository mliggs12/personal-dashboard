// Exercise Categories

const systemExerciseCategories = [
  {
    name: "Abs",
  },
  {
    name: "Back",
  },
  {
    name: "Biceps",
  },
  {
    name: "Cardio",
  },
  {
    name: "Chest",
  },
  {
    name: "Legs",
  },
  {
    name: "Shoulders",
  },
  {
    name: "Triceps",
  },
]

// Exercises
  
const systemExercises = [
  {
    name: "Ab-Wheel Rollout",
    categoryId: "q97222er189fyf4vh8kr73535h7bb3jk",
    type: "reps",
  },
  {
    name: "Air Bicycles",
    categoryId: "q97222er189fyf4vh8kr73535h7bb3jk",
    type: "reps",
  },
  {
    name: "Cable Crunch",
    categoryId: "q97222er189fyf4vh8kr73535h7bb3jk",
    type: "weight_and_reps",
  },
  {
    name: "Captain's Chair Leg Raise",
    categoryId: "q97222er189fyf4vh8kr73535h7bb3jk",
    type: "weight_and_reps",
  },
  {
    name: "Crunch",
    categoryId: "q97222er189fyf4vh8kr73535h7bb3jk",
    type: "reps",
  },
  {
    name: "Crunch Machine",
    categoryId: "q97222er189fyf4vh8kr73535h7bb3jk",
    type: "weight_and_reps",
  },
  {
    name: "Decline Crunch",
    categoryId: "q97222er189fyf4vh8kr73535h7bb3jk",
    type: "weight_and_reps",
  },
  {
    name: "Dragon Flag",
    categoryId: "q97222er189fyf4vh8kr73535h7bb3jk",
    type: "reps",
  },
  {
    name: "Hanging Knee Raise",
    categoryId: "q97222er189fyf4vh8kr73535h7bb3jk",
    type: "weight_and_reps",
  },
  {
    name: "Hanging Leg Raise",
    categoryId: "q97222er189fyf4vh8kr73535h7bb3jk",
    type: "weight_and_reps",
  },
  {
    name: "Leg Press Calf Raise",
    categoryId: "q97222er189fyf4vh8kr73535h7bb3jk",
    type: "weight_and_reps",
  },
  {
    name: "Plank",
    categoryId: "q97222er189fyf4vh8kr73535h7bb3jk",
    type: "time",
  },
  {
    name: "Side Plank",
    categoryId: "q97222er189fyf4vh8kr73535h7bb3jk",
    type: "time",
  },
  {
    name: "Barbell Row",
    categoryId: "q970nebvrjxr8bqvj85m9q7h0n7baa2v",
    type: "weight_and_reps",
  },
  {
    name: "Barbell Shrug",
    categoryId: "q970nebvrjxr8bqvj85m9q7h0n7baa2v",
    type: "weight_and_reps",
  },
  {
    name: "Chin Up",
    categoryId: "q970nebvrjxr8bqvj85m9q7h0n7baa2v",
    type: "weight_and_reps",
  },
  {
    name: "Deadlift",
    categoryId: "q970nebvrjxr8bqvj85m9q7h0n7baa2v",
    type: "weight_and_reps",
  },
  {
    name: "Dumbbell Row",
    categoryId: "q970nebvrjxr8bqvj85m9q7h0n7baa2v",
    type: "weight_and_reps",
  },
  {
    name: "Good Morning",
    categoryId: "q970nebvrjxr8bqvj85m9q7h0n7baa2v",
    type: "weight_and_reps",
  },
  {
    name: "Hammer Strength Row",
    categoryId: "q970nebvrjxr8bqvj85m9q7h0n7baa2v",
    type: "weight_and_reps",
  },
  {
    name: "Lat Pulldown",
    categoryId: "q970nebvrjxr8bqvj85m9q7h0n7baa2v",
    type: "weight_and_reps",
  },
  {
    name: "Machine Shrug",
    categoryId: "q970nebvrjxr8bqvj85m9q7h0n7baa2v",
    type: "weight_and_reps",
  },
  {
    name: "Neutral Chin Up",
    categoryId: "q970nebvrjxr8bqvj85m9q7h0n7baa2v",
    type: "weight_and_reps",
  },
  {
    name: "Penlay Row",
    categoryId: "q970nebvrjxr8bqvj85m9q7h0n7baa2v",
    type: "weight_and_reps",
  },
  {
    name: "Pull Up",
    categoryId: "q970nebvrjxr8bqvj85m9q7h0n7baa2v",
    type: "weight_and_reps",
  },
  {
    name: "Rack Pull",
    categoryId: "q970nebvrjxr8bqvj85m9q7h0n7baa2v",
    type: "weight_and_reps",
  },
  {
    name: "Seated Cable Row",
    categoryId: "q970nebvrjxr8bqvj85m9q7h0n7baa2v",
    type: "weight_and_reps",
  },
  {
    name: "Straight-Arm Cable Pulldown",
    categoryId: "q970nebvrjxr8bqvj85m9q7h0n7baa2v",
    type: "weight_and_reps",
  },
  {
    name: "T-Bar Row",
    categoryId: "q970nebvrjxr8bqvj85m9q7h0n7baa2v",
    type: "weight_and_reps",
  },
  {
    name: "Barbell Curl",
    categoryId: "q971k1c68tdwavsfm8h8rxqdsh7bbwhm",
    type: "weight_and_reps",
  },
  {
    name: "Cable Curl",
    categoryId: "q971k1c68tdwavsfm8h8rxqdsh7bbwhm",
    type: "weight_and_reps",
  },
  {
    name: "Dumpbell Concentration Curl",
    categoryId: "q971k1c68tdwavsfm8h8rxqdsh7bbwhm",
    type: "weight_and_reps",
  },
  {
    name: "Dumpbell Curl",
    categoryId: "q971k1c68tdwavsfm8h8rxqdsh7bbwhm",
    type: "weight_and_reps",
  },
  {
    name: "Dumpbell Hammer Curl",
    categoryId: "q971k1c68tdwavsfm8h8rxqdsh7bbwhm",
    type: "weight_and_reps",
  },
  {
    name: "Dumpbell Preacher Curl",
    categoryId: "q971k1c68tdwavsfm8h8rxqdsh7bbwhm",
    type: "weight_and_reps",
  },
  {
    name: "EZ-Bar Curl",
    categoryId: "q971k1c68tdwavsfm8h8rxqdsh7bbwhm",
    type: "weight_and_reps",
  },
  {
    name: "EZ-Bar Preacher Curl",
    categoryId: "q971k1c68tdwavsfm8h8rxqdsh7bbwhm",
    type: "weight_and_reps",
  },
  {
    name: "Seated Incline Dumbbell Curl",
    categoryId: "q971k1c68tdwavsfm8h8rxqdsh7bbwhm",
    type: "weight_and_reps",
  },
  {
    name: "Seated Machine Curl",
    categoryId: "q971k1c68tdwavsfm8h8rxqdsh7bbwhm",
    type: "weight_and_reps",
  },
  {
    name: "Cycling",
    categoryId: "q972a12t8w3412kbppc93khwnx7bb9re",
    type: "time",
  },
  {
    name: "Elliptical",
    categoryId: "q972a12t8w3412kbppc93khwnx7bb9re",
    type: "time",
  },
  {
    name: "Rowing Machine",
    categoryId: "q972a12t8w3412kbppc93khwnx7bb9re",
    type: "time",
  },
  {
    name: "Running (Outdoor)",
    categoryId: "q972a12t8w3412kbppc93khwnx7bb9re",
    type: "time",
  },
  {
    name: "Running (Treadmill)",
    categoryId: "q972a12t8w3412kbppc93khwnx7bb9re",
    type: "time",
  },
  {
    name: "Staitonary Bike",
    categoryId: "q972a12t8w3412kbppc93khwnx7bb9re",
    type: "time",
  },
  {
    name: "Swimming",
    categoryId: "q972a12t8w3412kbppc93khwnx7bb9re",
    type: "time",
  },
  {
    name: "Walking",
    categoryId: "q972a12t8w3412kbppc93khwnx7bb9re",
    type: "time",
  },
  {
    name: "Cable Crossover",
    categoryId: "q978vy53291kzk6k0wakn632517bbqgt",
    type: "weight_and_reps",
  },
  {
    name: "Decline Barbell Bench Press",
    categoryId: "q978vy53291kzk6k0wakn632517bbqgt",
    type: "weight_and_reps",
  },
  {
    name: "Decline Hammer Strength Chest Press",
    categoryId: "q978vy53291kzk6k0wakn632517bbqgt",
    type: "weight_and_reps",
  },
  {
    name: "Flat Barbell Bench Press",
    categoryId: "q978vy53291kzk6k0wakn632517bbqgt",
    type: "weight_and_reps",
  },
  {
    name: "Flat Dumbbell Bench Press",
    categoryId: "q978vy53291kzk6k0wakn632517bbqgt",
    type: "weight_and_reps",
  },
  {
    name: "Flat Dumbbell Fly",
    categoryId: "q978vy53291kzk6k0wakn632517bbqgt",
    type: "weight_and_reps",
  },
  {
    name: "Incline Barbell Bench Press",
    categoryId: "q978vy53291kzk6k0wakn632517bbqgt",
    type: "weight_and_reps",
  },
  {
    name: "Incline Dumbbell Bench Press",
    categoryId: "q978vy53291kzk6k0wakn632517bbqgt",
    type: "weight_and_reps",
  },
  {
    name: "Incline Dumbbell Fly",
    categoryId: "q978vy53291kzk6k0wakn632517bbqgt",
    type: "weight_and_reps",
  },
  {
    name: "Incline Hammer Strength Chest Press",
    categoryId: "q978vy53291kzk6k0wakn632517bbqgt",
    type: "weight_and_reps",
  },
  {
    name: "Seated Machine Fly",
    categoryId: "q978vy53291kzk6k0wakn632517bbqgt",
    type: "weight_and_reps",
  },
  {
    name: "Barbell Calf Raise",
    categoryId: "q97846hw2268wxx8qxkhvz4fad7bak91",
    type: "weight_and_reps",
  },
  {
    name: "Barbell Front Squat",
    categoryId: "q97846hw2268wxx8qxkhvz4fad7bak91",
    type: "weight_and_reps",
  },
  {
    name: "Barbell Glute Bridge",
    categoryId: "q97846hw2268wxx8qxkhvz4fad7bak91",
    type: "weight_and_reps",
  },
  {
    name: "Barbell Squat",
    categoryId: "q97846hw2268wxx8qxkhvz4fad7bak91",
    type: "weight_and_reps",
  },
  {
    name: "Donkey Calf Raise",
    categoryId: "q97846hw2268wxx8qxkhvz4fad7bak91",
    type: "weight_and_reps",
  },
  {
    name: "Glute-Ham Raise",
    categoryId: "q97846hw2268wxx8qxkhvz4fad7bak91",
    type: "weight_and_reps",
  },
  {
    name: "Leg Extension Machine",
    categoryId: "q97846hw2268wxx8qxkhvz4fad7bak91",
    type: "weight_and_reps",
  },
  {
    name: "Leg Press",
    categoryId: "q97846hw2268wxx8qxkhvz4fad7bak91",
    type: "weight_and_reps",
  },
  {
    name: "Lying Leg Curl Machine",
    categoryId: "q97846hw2268wxx8qxkhvz4fad7bak91",
    type: "weight_and_reps",
  },
  {
    name: "Power Clean",
    categoryId: "q97846hw2268wxx8qxkhvz4fad7bak91",
    type: "weight_and_reps",
  },
  {
    name: "Romanian Deadlift",
    categoryId: "q97846hw2268wxx8qxkhvz4fad7bak91",
    type: "weight_and_reps",
  },
  {
    name: "Seated Calf Raise Machine",
    categoryId: "q97846hw2268wxx8qxkhvz4fad7bak91",
    type: "weight_and_reps",
  },
  {
    name: "Seated Leg Curl Machine",
    categoryId: "q97846hw2268wxx8qxkhvz4fad7bak91",
    type: "weight_and_reps",
  },
  {
    name: "Standing Calf Raise Machine",
    categoryId: "q97846hw2268wxx8qxkhvz4fad7bak91",
    type: "weight_and_reps",
  },
  {
    name: "Stiff-Legged Deadlift",
    categoryId: "q97846hw2268wxx8qxkhvz4fad7bak91",
    type: "weight_and_reps",
  },
  {
    name: "Sumo Deadlift",
    categoryId: "q97846hw2268wxx8qxkhvz4fad7bak91",
    type: "weight_and_reps",
  },
  {
    name: "Arnold Dumbbell Press",
    categoryId: "q974jx7gfn7zcssn9np4c52pan7bbn2c",
    type: "weight_and_reps",
  },
  {
    name: "Behind The Neck Barbell Press",
    categoryId: "q974jx7gfn7zcssn9np4c52pan7bbn2c",
    type: "weight_and_reps",
  },
  {
    name: "Cable Face Pull",
    categoryId: "q974jx7gfn7zcssn9np4c52pan7bbn2c",
    type: "weight_and_reps",
  },
  {
    name: "Front Dumbbell Raise",
    categoryId: "q974jx7gfn7zcssn9np4c52pan7bbn2c",
    type: "weight_and_reps",
  },
  {
    name: "Hammer Strength Shoulder Press",
    categoryId: "q974jx7gfn7zcssn9np4c52pan7bbn2c",
    type: "weight_and_reps",
  },
  {
    name: "Laterall Dumbbell Raise",
    categoryId: "q974jx7gfn7zcssn9np4c52pan7bbn2c",
    type: "weight_and_reps",
  },
  {
    name: "Laterall Machine Raise",
    categoryId: "q974jx7gfn7zcssn9np4c52pan7bbn2c",
    type: "weight_and_reps",
  },
  {
    name: "Log Press",
    categoryId: "q974jx7gfn7zcssn9np4c52pan7bbn2c",
    type: "weight_and_reps",
  },
  {
    name: "One-Arm Standing Dumbbell Press",
    categoryId: "q974jx7gfn7zcssn9np4c52pan7bbn2c",
    type: "weight_and_reps",
  },
  {
    name: "Overhead Press",
    categoryId: "q974jx7gfn7zcssn9np4c52pan7bbn2c",
    type: "weight_and_reps",
  },
  {
    name: "Push Press",
    categoryId: "q974jx7gfn7zcssn9np4c52pan7bbn2c",
    type: "weight_and_reps",
  },
  {
    name: "Rear Delt Dumbbell Raise",
    categoryId: "q974jx7gfn7zcssn9np4c52pan7bbn2c",
    type: "weight_and_reps",
  },
  {
    name: "Rear Delt Machine Fly",
    categoryId: "q974jx7gfn7zcssn9np4c52pan7bbn2c",
    type: "weight_and_reps",
  },
  {
    name: "Seated Dumbbell Lateral Raise",
    categoryId: "q974jx7gfn7zcssn9np4c52pan7bbn2c",
    type: "weight_and_reps",
  },
  {
    name: "Seated Dumbbell Press",
    categoryId: "q974jx7gfn7zcssn9np4c52pan7bbn2c",
    type: "weight_and_reps",
  },
  {
    name: "Seated Military Press",
    categoryId: "q974jx7gfn7zcssn9np4c52pan7bbn2c",
    type: "weight_and_reps",
  },
  {
    name: "Smith Machine Overhead Press",
    categoryId: "q974jx7gfn7zcssn9np4c52pan7bbn2c",
    type: "weight_and_reps",
  },
  {
    name: "Cable Overhead Triceps Extension",
    categoryId: "q97fbs752a71z5wta92vmrc7p17bb8pw",
    type: "weight_and_reps",
  },
  {
    name: "Close Grip Barbell Bench Press",
    categoryId: "q97fbs752a71z5wta92vmrc7p17bb8pw",
    type: "weight_and_reps",
  },
  {
    name: "Dumpbell Overhead Triceps Extension",
    categoryId: "q97fbs752a71z5wta92vmrc7p17bb8pw",
    type: "weight_and_reps",
  },
  {
    name: "EZ-Bar Skullcrusher",
    categoryId: "q97fbs752a71z5wta92vmrc7p17bb8pw",
    type: "weight_and_reps",
  },
  {
    name: "Lying Triceps Extension",
    categoryId: "q97fbs752a71z5wta92vmrc7p17bb8pw",
    type: "weight_and_reps",
  },
  {
    name: "Parallel Bar Triceps Dip",
    categoryId: "q97fbs752a71z5wta92vmrc7p17bb8pw",
    type: "weight_and_reps",
  },
  {
    name: "Ring Dip",
    categoryId: "q97fbs752a71z5wta92vmrc7p17bb8pw",
    type: "weight_and_reps",
  },
  {
    name: "Rope Push Down",
    categoryId: "q97fbs752a71z5wta92vmrc7p17bb8pw",
    type: "weight_and_reps",
  },
  {
    name: "Smith Machine Close Grip Bench Press",
    categoryId: "q97fbs752a71z5wta92vmrc7p17bb8pw",
    type: "weight_and_reps",
  },
  {
    name: "V-Bar Push Down",
    categoryId: "q97fbs752a71z5wta92vmrc7p17bb8pw",
    type: "weight_and_reps",
  },
]