export const prompts = [
  "Points", "Lines", "Polygons", "Clusters", "Senses: Sight", "Vintage", "10 minute map", "Utopia", "Urban–rural", "Prompting only", "Senses: Sound", "Power", "Interactions", "Borgesian map", "Inside out", "Collaborative map", "Light & dark", "NULL", "Senses: Smell", "Hexagons", "OpenStreetMap", "Projections", "Senses: Taste", "Network", "Is this a map?", "Water", "New tool", "Senses: Feeling", "Raster", "Pen & paper",
] as const;

export const promptDescriptions = [
  "A map challenge classic. Map with points.",
  "A map challenge classic. Map with lines.",
  "A map challenge classic. Map with polygons.",
  "Clusters of something—hotspots, groups, and things that gather together.",
  "How do you see something? Maybe map a viewshed?",
  "Spin up your time machine: make a historical-looking map, or map something vintage.",
  "You have no more than 10 minutes to complete this map.",
  "A map of something which could be.",
  "Urban or rural. Cities and countryside.",
  "Make AI work for its money and produce something from start to finish in a chat window or command line.",
  "How do you hear something? Map a soundscape or noise pollution.",
  "Nuclear, physical, political, or electrical—read power the way you want.",
  "Interactions between things, or perhaps the result is an interactive map.",
  "A map so detailed it becomes the territory, inspired by Borges’ On Exactitude in Science.",
  "Inside out, upside down. Something on this map is not quite right.",
  "Make a map with a friend, colleague, or stranger. AI doesn’t count as a friend :)",
  "Play with visual effects. What can you map with just light and shadows?",
  "No description. Make something from nothing.",
  "How do you map things your nose can sense? What does a smelly map look like?",
  "Hexagons, the good old bestagons.",
  "The awesome open data source for mapping. You can also use this day to edit OSM.",
  "Explore the ways a globe becomes flat. What does your favourite projection say about you?",
  "Food, drink, or something else which you can taste.",
  "Route, transit, human, or something completely different.",
  "Blend mapping with art or creative data visualization. When does something stop being a map?",
  "About 71% of Earth’s surface. That wet thing, you know?",
  "Try a new tool in your mapmaking workflow.",
  "The most abstract sense. How would you map a feeling?",
  "Do something cool with pixels.",
  "Close the laptop and return to basics. Make an analogue map with pen and paper.",
] as const;

export const dayPath = (day: number) => `/days/${String(day).padStart(2, "0")}`;
export const getPrompt = (day: number) => prompts[day - 1];
export const getPromptDescription = (day: number) => promptDescriptions[day - 1];

// Published-day content now lives in lib/days.tsx (the day registry).
// Import { isPublished, getDay } from "@/lib/days" to read it.
