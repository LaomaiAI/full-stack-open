# full-stack-open
My solutions for the University of Helsinki Full Stack Open course.

## Part 2

- part2/courseinfo - exercises 2.1-2.5: rendering a collection of courses, total exercises, separate Course module.
- part2/phonebook - exercises 2.6-2.17: phonebook with filtering, adding, updating, deleting, json-server backend and notifications. Run the backend with npm run server (port 3001) and the app with npm run dev.
- part2/countries - exercises 2.18-2.20: country search with REST Countries data and OpenWeatherMap weather. Copy countries/.env.example to countries/.env and add a free VITE_WEATHER_API_KEY to enable weather; the key is never committed.

## Part 3

- part3/phonebook - exercises 3.1-3.22: phonebook backend (Node.js + Express + Mongoose + MongoDB Atlas), morgan logging, validation (name min. 3 chars, phone number min. 8 chars and NN-NNNNNN / NNN-NNNNNNNN format), ESLint, frontend production build served by the backend. Run with `npm start` (port 3001, needs MONGODB_URI in .env, never committed).
- Deployed application: TODO - add Render URL after deployment.
