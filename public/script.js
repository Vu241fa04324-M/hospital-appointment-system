const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();

app.use(cors());
app.use(express.json());


// ==========================================
// SERVE FRONTEND FILES
// ==========================================

app.use(express.static(__dirname));


// ==========================================
// HOME PAGE
// ==========================================

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "index.html"));
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


    const appointmentId =
        Date.now().toString().slice(-6);


    console.log("New appointment received:", {
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
// LOCAL SERVER
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
