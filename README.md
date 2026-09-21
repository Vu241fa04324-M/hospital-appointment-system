# Hospital Appointment System

A web-based hospital appointment booking system. Patients can book an appointment, choose a payment method, download an invoice, and check their appointment status.

## Features

- Appointment booking form (hospital, specialist, date, time slot)
- Payment method selection (Card, Netbanking, UPI, Pay on Visit)
- Invoice download after booking
- Appointment status check by ID

## Tech Stack

- **Frontend:** HTML, CSS, JavaScript
- **Backend:** Node.js, Express
- **Hosting:** Vercel

## Project Structure

| Path | Purpose |
|------|---------|
| `server.js` | Express backend and API routes |
| `public/index.html` | Booking page |
| `public/status.html` | Appointment status page |
| `public/login.html` | Login page (in progress) |
| `public/admin.html` | Admin page (in progress) |
| `public/doctor.html` | Doctor page (in progress) |
| `public/script.js` | Booking page logic |
| `public/style.css` | Styling |

## API Routes


| Route | Description |
|-------|-------------|
| `GET /` | Home page |
| `GET /api/test` | Test route |
| `POST /api/appointments` | Create an appointment |
| `GET /api/appointments/:id` | Look up an appointment by ID |

## Run Locally

```bash
git clone https://github.com/Vu241fa04324-M/hospital-appointment-system.git
cd hospital-appointment-system
npm install
node server.js
```

Then open `http://localhost:3000`.

## Known Limitations

- Appointments are stored in server memory and in the user's browser, not in a database. They can be lost when the server restarts.
- Login, admin, and doctor pages are not connected to the backend yet.
- Payment is a demo only. No real payments are processed.

## Author

Vu241fa04324-M
