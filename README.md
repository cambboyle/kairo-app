# kairo-app

**Kairo** is a minimal productivity tool (I know..) that helps users focus and reflect during study or work sessions.

### Why?

Simple. People don't stay focused often enough and when they do, they
rarely reflect on how it went.
Kairo brings structure and awareness to your deep work sessions by
combining a smart timer with lightweight post-session reflections.

---

## About the Project

Kairo isn't just a timer — it's a tool to build _awareness_ around how you work and how you feel during focused effort.  
The goal is to help people build intentional habits, not just squeeze out more productivity.

This project is also a personal challenge: building and scaling a full-stack app from scratch using the skills I'm learning as a web developer.

---

## Table of Contents

- [Installation](#installation)
- [Usage](#usage)
- [Screenshots or GIFs](#screenshots-or-gifs)
- [Features](#features)
- [License](#license)
- [Acknowledgements](acknowledgements)

---

## Installation

- Clone the repository:
  `git clone https://github.com/cambboyle/kairo-app.git`

- Navigate into the project directory:
  `cd kairo-app`

- Install dependencies:
  `npm install`

- Navigate to both server and client folders:
  `cd server`/`cd client`

- Install those dependencies too:
  `npm install`

- Start the dev server for front and backend

---

## Usage

1. Set your desired focus timer.
2. Start your session and get to work.
3. When the timer ends, write a short reflection on how it went.
4. Review past sessions to track your mindset and momentum.

   Optional features like custom durations, dark mode and session analytics coming soon.

---

## Screenshots or GIFs

---

## Features

- Simple focus timer with session tracking.
- Post-session reflections.
- Local persistence or MongoDB
- Switch between Focus, Short Break or Long Break timers
- Dark/light mode toggle

---

## Roadmap

### Short-Term Goals

- [ ] Basic timer with session types
- [ ] Post-session reflections
- [ ] LocalStorage persistence
- [ ] Minimal mobile-friendly design

### Long-Term Goals

- [ ] User accounts and MongoDB integration
- [ ] Reflection tagging (emotions, themes)
- [ ] Productivity analytics dashboard (basic)
- [ ] Shareable reflection exports
- [ ] Chrome extension or mobile app
- [ ] Account setup for deeper analytics and other goodies

---

## Tech Stack

- **Frontend:** JavaScript, HTML5, CSS3
- **Build Tool:** Vite
- **Backend:** Node.js, MongoDB, Express
- **Tooling:** ESLint, Prettier, Husky, Commitlint, Jest
- **Deployment:** Vercel

---

## Troubleshooting

- If you see "Database connection failed", check your `.env` file and MongoDB status.
- If you get CORS errors, make sure the Vite proxy is set up and both servers are running.

---

## License

This project is licensed under the MIT License

---

## Acknowledgements

- Inspired by techniques from Deep Work by Cal Newport
- Timer mechanics loosely based on the Pomodoro Technique
- Built with love.

---

If you want to contribute or suggest a feature, reach out to me on [LinkedIn](https://www.linkedin.com/in/cbb00/) or [X](https://x.com/cambboyle).
Feedback is critical to success!
