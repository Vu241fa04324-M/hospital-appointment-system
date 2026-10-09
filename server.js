```javascript
const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// Temporary appointment storage
const appointments = {};

function makeId() {
    let id;

    do {
        id = Math.floor(100000 + Math.random() * 900000).toString();
    } while (appointments[id]);

    return id;
}

// Home page
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Test API
app.get("/api/test", (req, res) => {
    res.json({
        success: true,
        message: "Hospital Appointment API is working!"
    });
});

// Create appointment
app.post("/api/appointments", (req, res) => {
    const {
        patientName,
        patientAge,
        hospital,
        specialist,
        appointmentDate,
        timeSlot,
        mobileNumber,
        email
    } = req.body;

    if (
        !patientName ||
        !patientAge ||
        !hospital ||
        !specialist ||
        !appointmentDate ||
        !timeSlot ||
        !mobileNumber
    ) {
        return res.status(400).json({
            success: false,
            message: "Please fill all required appointment details."
        });
    }

    const appointmentId = makeId();

    appointments[appointmentId] = {
        appointmentId,
        patientName,
        patientAge,
        hospital,
        specialist,
        appointmentDate,
        timeSlot,
        mobileNumber,
        email: email || "",
        status: "Pending"
    };

    return res.status(201).json({
        success: true,
        message: "Appointment created successfully.",
        appointmentId,
        status: "Pending"
    });
});

// Get appointment by ID
app.get("/api/appointments/:id", (req, res) => {
    const appointment = appointments[req.params.id];

    if (!appointment) {
        return res.status(404).json({
            success: false,
            message: "Appointment not found."
        });
    }

    return res.json({
        success: true,
        ...appointment
    });
});

// Start server locally
if (require.main === module) {
    const PORT = process.env.PORT || 3000;

    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}

// Export app for deployment
module.exports = app;
```
