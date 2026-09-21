# Hospital Appointment System

A web-based hospital appointment system with pages for patients, doctors, and admins. This project is a work in progress.

## Tech Stack

- **Frontend:** HTML, CSS, JavaScript
- **Backend:** Node.js, Express

## Project Structure

| File | Purpose |
|------|---------|
| `server.js` | Express backend (test routes for now) |
| `index.html` | Home page |
| `login.html` | Login page |
| `admin.html` | Admin page |
| `doctor.html` | Doctor page |
| `status.html` | Appointment status page |
| `script.js` | Frontend logic |
| `style.css` | Styling |

## Getting Started

1. Clone the repository:
```bash
   git clone https://github.com/Vu241fa04324-M/hospital-appointment-system.git
   cd hospital-appointment-system
```

2. Install dependencies:
```bash
   npm install
```

3. Start the server:
```bash
   node server.js
```

4. Open `http://localhost:3000` in your browser. You should see "Hospital Appointment Backend is running!"

## API Routes

| Route | Description |
|-------|-------------|
| `GET /` | Backend status message |
| `GET /api/test` | Test route that returns JSON |

## Planned Features

- Appointment booking
- Login for patients, doctors, and admins
- Database storage for users and appointments

## Author

Vu241fa04324-M
