const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());


// ==========================================
// HOME ROUTE
// ==========================================

app.get("/", (req, res) => {
    res.send("Hospital Appointment Backend is running!");
});


// ==========================================
// TEST API
// ==========================================

app.get("/api/test", (req, res) => {
    res.json({
        success: true,
        message: "Hospital Appointment API is working!"
    });
});


// ==========================================
// CREATE APPOINTMENT
// ==========================================

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


    // Check required details

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


    // Temporary appointment ID
    // We will connect a permanent database later.

    const appointmentId =
        Date.now().toString().slice(-6);


    console.log("New appointment received:");
    console.log({
        appointmentId,
        patientName,
        patientAge,
        hospital,
        specialist,
        appointmentDate,
        timeSlot,
        mobileNumber,
        email,
        status: "Pending"
    });


    // Send response to frontend

    res.json({

        success: true,

        message: "Appointment created successfully.",

        appointmentId: appointmentId,

        status: "Pending"

    });

});


// ==========================================
// GET APPOINTMENT
// ==========================================

app.get("/api/appointments/:id", (req, res) => {

    res.json({

        success: true,

        appointmentId: req.params.id,

        status: "Pending",

        message: "Appointment found."

    });

});


// ==========================================
// START SERVER LOCALLY
// ==========================================

if (require.main === module) {

    const PORT = 3000;

    app.listen(PORT, () => {

        console.log(
            `Server running at http://localhost:${PORT}`
        );

    });

}


// ==========================================
// VERCEL
// ==========================================

module.exports = app;
