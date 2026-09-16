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
// TEST API ROUTE
// ==========================================

app.get("/api/test", (req, res) => {
    res.json({
        success: true,
        message: "Hospital Appointment API is working!"
    });
});

// ==========================================
// VERCEL EXPORT
// ==========================================

module.exports = app;
// ==========================================
// DATABASE
// ==========================================

const db = new Database("hospital.db");

console.log("SQLite database connected.");

db.prepare(`
    CREATE TABLE IF NOT EXISTS appointments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        patientName TEXT NOT NULL,
        patientAge INTEGER NOT NULL,
        hospital TEXT NOT NULL,
        specialist TEXT NOT NULL,
        appointmentDate TEXT NOT NULL,
        timeSlot TEXT NOT NULL,
        mobileNumber TEXT NOT NULL,
        email TEXT,
        status TEXT DEFAULT 'Pending',
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )
`).run();

console.log("Appointments table ready.");

// ==========================================
// ADD STATUS COLUMN IF OLD DATABASE
// ==========================================

try {
    db.prepare(`
        ALTER TABLE appointments
        ADD COLUMN status TEXT DEFAULT 'Pending'
    `).run();

    console.log("Status column added.");
} catch (error) {
    // Status column already exists
}

// ==========================================
// TWILIO SMS CONFIGURATION
// ==========================================

let twilioClient = null;

if (
    process.env.TWILIO_ACCOUNT_SID &&
    process.env.TWILIO_AUTH_TOKEN &&
    process.env.TWILIO_PHONE_NUMBER
) {
    twilioClient = twilio(
        process.env.TWILIO_ACCOUNT_SID,
        process.env.TWILIO_AUTH_TOKEN
    );

    console.log("Twilio SMS configured.");
} else {
    console.log("Twilio SMS not configured. SMS will be skipped.");
}

// ==========================================
// PHONE NUMBER FORMAT
// ==========================================

function formatPhoneNumber(number) {
    if (!number) {
        return "";
    }

    let phone = String(number).trim();

    if (/^[6-9]\d{9}$/.test(phone)) {
        phone = "+91" + phone;
    }

    if (/^91[6-9]\d{9}$/.test(phone)) {
        phone = "+" + phone;
    }

    return phone;
}

// ==========================================
// SEND SMS
// ==========================================

async function sendSMS(to, message) {
    if (!twilioClient) {
        console.log("SMS skipped: Twilio is not configured.");
        return;
    }

    if (!to) {
        console.log("SMS skipped: Phone number is missing.");
        return;
    }

    try {
        const formattedNumber = formatPhoneNumber(to);

        const result = await twilioClient.messages.create({
            body: message,
            from: process.env.TWILIO_PHONE_NUMBER,
            to: formattedNumber
        });

        console.log("SMS sent successfully. SID:", result.sid);
    } catch (error) {
        console.error("SMS failed:", error.message);
    }
}

// ==========================================
// HOME ROUTE
// ==========================================

app.get("/", (req, res) => {
    res.send("Hospital Appointment Backend is running!");
});

// ==========================================
// GET ALL APPOINTMENTS
// ==========================================

app.get("/api/appointments", (req, res) => {
    try {
        const appointments = db.prepare(`
            SELECT *
            FROM appointments
            ORDER BY id DESC
        `).all();

        res.json(appointments);
    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Failed to get appointments."
        });
    }
});

// ==========================================
// GET ONE APPOINTMENT
// ==========================================

app.get("/api/appointments/:id", (req, res) => {
    try {
        const id = Number(req.params.id);

        const appointment = db.prepare(`
            SELECT *
            FROM appointments
            WHERE id = ?
        `).get(id);

        if (!appointment) {
            return res.status(404).json({
                success: false,
                message: "Appointment not found."
            });
        }

        res.json(appointment);
    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Failed to get appointment."
        });
    }
});

// ==========================================
// CREATE APPOINTMENT
// ==========================================

app.post("/api/appointments", async (req, res) => {
    try {
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
                message: "Please fill all required fields."
            });
        }

        const insert = db.prepare(`
            INSERT INTO appointments (
                patientName,
                patientAge,
                hospital,
                specialist,
                appointmentDate,
                timeSlot,
                mobileNumber,
                email,
                status
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'Pending')
        `);

        const result = insert.run(
            patientName,
            patientAge,
            hospital,
            specialist,
            appointmentDate,
            timeSlot,
            mobileNumber,
            email || ""
        );

        const appointmentId = result.lastInsertRowid;

        console.log("New appointment saved.");
        console.log("Appointment ID:", appointmentId);

        // ==========================================
        // SEND SMS TO DOCTOR
        // ==========================================

        if (process.env.DOCTOR_PHONE_NUMBER) {
            const doctorMessage =
                `New Hospital Appointment\n` +
                `Appointment ID: ${appointmentId}\n` +
                `Patient: ${patientName}\n` +
                `Age: ${patientAge}\n` +
                `Hospital: ${hospital}\n` +
                `Specialist: ${specialist}\n` +
                `Date: ${appointmentDate}\n` +
                `Time: ${timeSlot}\n` +
                `Please open Doctor Dashboard to Confirm or Cancel.`;

            await sendSMS(
                process.env.DOCTOR_PHONE_NUMBER,
                doctorMessage
            );
        }

        res.json({
            success: true,
            message: "Appointment saved successfully!",
            appointmentId: appointmentId
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Failed to save appointment."
        });
    }
});

// ==========================================
// UPDATE APPOINTMENT STATUS
// ==========================================

app.put("/api/appointments/:id/status", async (req, res) => {
    try {
        const id = Number(req.params.id);
        const { status } = req.body;

        const allowedStatuses = [
            "Pending",
            "Confirmed",
            "Completed",
            "Cancelled"
        ];

        if (!allowedStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: "Invalid appointment status."
            });
        }

        const appointment = db.prepare(`
            SELECT *
            FROM appointments
            WHERE id = ?
        `).get(id);

        if (!appointment) {
            return res.status(404).json({
                success: false,
                message: "Appointment not found."
            });
        }

        db.prepare(`
            UPDATE appointments
            SET status = ?
            WHERE id = ?
        `).run(status, id);

        console.log(
            `Appointment ID ${id} status changed to ${status}`
        );

        // ==========================================
        // SEND STATUS SMS TO PATIENT
        // ==========================================

        let message = "";

        if (status === "Confirmed") {
            message =
                `Hospital Appointment Confirmed\n` +
                `Appointment ID: ${appointment.id}\n` +
                `Patient: ${appointment.patientName}\n` +
                `Hospital: ${appointment.hospital}\n` +
                `Specialist: ${appointment.specialist}\n` +
                `Date: ${appointment.appointmentDate}\n` +
                `Time: ${appointment.timeSlot}\n` +
                `Status: Confirmed`;
        } else if (status === "Cancelled") {
            message =
                `Hospital Appointment Cancelled\n` +
                `Appointment ID: ${appointment.id}\n` +
                `Patient: ${appointment.patientName}\n` +
                `Hospital: ${appointment.hospital}\n` +
                `Date: ${appointment.appointmentDate}\n` +
                `Time: ${appointment.timeSlot}\n` +
                `Status: Cancelled`;
        } else if (status === "Completed") {
            message =
                `Hospital Appointment Completed\n` +
                `Appointment ID: ${appointment.id}\n` +
                `Patient: ${appointment.patientName}\n` +
                `Status: Completed`;
        } else {
            message =
                `Hospital Appointment Update\n` +
                `Appointment ID: ${appointment.id}\n` +
                `Patient: ${appointment.patientName}\n` +
                `Status: Pending`;
        }

        await sendSMS(
            appointment.mobileNumber,
            message
        );

        res.json({
            success: true,
            message: `Appointment status changed to ${status}.`
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Failed to update appointment status."
        });
    }
});

// ==========================================
// EDIT APPOINTMENT
// ==========================================

app.put("/api/appointments/:id", (req, res) => {
    try {
        const id = Number(req.params.id);

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

        const appointment = db.prepare(`
            SELECT *
            FROM appointments
            WHERE id = ?
        `).get(id);

        if (!appointment) {
            return res.status(404).json({
                success: false,
                message: "Appointment not found."
            });
        }

        db.prepare(`
            UPDATE appointments
            SET
                patientName = ?,
                patientAge = ?,
                hospital = ?,
                specialist = ?,
                appointmentDate = ?,
                timeSlot = ?,
                mobileNumber = ?,
                email = ?
            WHERE id = ?
        `).run(
            patientName,
            patientAge,
            hospital,
            specialist,
            appointmentDate,
            timeSlot,
            mobileNumber,
            email || "",
            id
        );

        console.log("Appointment updated. ID:", id);

        res.json({
            success: true,
            message: "Appointment updated successfully."
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Failed to update appointment."
        });
    }
});

// ==========================================
// DELETE APPOINTMENT
// ==========================================

app.delete("/api/appointments/:id", (req, res) => {
    try {
        const id = Number(req.params.id);

        const appointment = db.prepare(`
            SELECT *
            FROM appointments
            WHERE id = ?
        `).get(id);

        if (!appointment) {
            return res.status(404).json({
                success: false,
                message: "Appointment not found."
            });
        }

        db.prepare(`
            DELETE FROM appointments
            WHERE id = ?
        `).run(id);

        console.log("Appointment deleted. ID:", id);

        res.json({
            success: true,
            message: "Appointment deleted successfully."
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Failed to delete appointment."
        });
    }
});

// ==========================================
// VERCEL EXPORT
// ==========================================

module.exports = app;
