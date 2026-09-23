const express = require("express");
const cors = require("cors");
const path = require("path");
const Razorpay = require("razorpay");
const PDFDocument = require("pdfkit");
const crypto = require("crypto");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// Initialize Razorpay (Replace with your actual keys or use environment variables)
const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID || "YOUR_RAZORPAY_KEY_ID",
    key_secret: process.env.RAZORPAY_KEY_SECRET || "YOUR_RAZORPAY_KEY_SECRET"
});

// Appointments storage
const appointments = {};

function makeId() {
    let id;
    do {
        id = Math.floor(100000 + Math.random() * 900000).toString();
    } while (appointments[id]);
    return id;
}

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.get("/api/test", (req, res) => {
    res.json({ success: true, message: "Hospital Appointment API is working with Payments & PDFs!" });
});

// 1. Create Appointment (Status: Pending)
app.post("/api/appointments", (req, res) => {
    const {
        patientName, patientAge, hospital, specialist,
        appointmentDate, timeSlot, mobileNumber, email, amount
    } = req.body;

    if (!patientName || !patientAge || !hospital || !specialist ||
        !appointmentDate || !timeSlot || !mobileNumber) {
        return res.status(400).json({
            success: false,
            message: "Please fill all required appointment details."
        });
    }

    const appointmentId = makeId();

    appointments[appointmentId] = {
        appointmentId, patientName, patientAge, hospital, specialist,
        appointmentDate, timeSlot, mobileNumber, email,
        amount: amount || 500, // Default consultation fee (e.g., 500 INR)
        status: "Pending"
    };

    res.json({
        success: true,
        message: "Appointment created successfully.",
        appointmentId,
        amount: appointments[appointmentId].amount,
        status: "Pending"
    });
});

// 2. Create Razorpay Payment Order
app.post("/api/create-payment-order", async (req, res) => {
    try {
        const { appointmentId } = req.body;
        const appointment = appointments[appointmentId];

        if (!appointment) {
            return res.status(404).json({ success: false, message: "Appointment not found." });
        }

        const options = {
            amount: appointment.amount * 100, // amount in the smallest currency unit (paise)
            currency: "INR",
            receipt: `receipt_${appointmentId}`
        };

        const order = await razorpay.orders.create(options);
        res.json({ success: true, order, keyId: razorpay.key_id });
    } catch (error) {
        console.error("Payment error:", error);
        res.status(500).json({ success: false, message: "Failed to create payment order." });
    }
});

// 3. Verify Payment & Update Status
app.post("/api/verify-payment", (req, res) => {
    const { appointmentId, razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    const appointment = appointments[appointmentId];
    if (!appointment) {
        return res.status(404).json({ success: false, message: "Appointment not found." });
    }

    // Verify signature
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
        .createHmac("sha256", razorpay.key_secret)
        .update(body.toString())
        .digest("hex");

    if (expectedSignature === razorpay_signature) {
        appointment.status = "Paid";
        appointment.paymentId = razorpay_payment_id;
        return res.json({ success: true, message: "Payment verified successfully!", status: "Paid" });
    } else {
        return res.status(400).json({ success: false, message: "Invalid payment signature." });
    }
});

// 4. Get Appointment Details
app.get("/api/appointments/:id", (req, res) => {
    const appointment = appointments[req.params.id];

    if (!appointment) {
        return res.status(404).json({
            success: false,
            message: "Appointment not found."
        });
    }

    res.json({ success: true, ...appointment });
});

// 5. Download PDF Invoice Route
app.get("/api/appointments/:id/invoice", (req, res) => {
    const appointment = appointments[req.params.id];

    if (!appointment) {
        return res.status(404).send("Appointment not found.");
    }

    const doc = new PDFDocument({ margin: 50 });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename=Invoice_${appointment.appointmentId}.pdf`);

    doc.pipe(res);

    // PDF Header
    doc.fontSize(22).fillColor("#0284c7").text("HOSPITAL APPOINTMENT INVOICE", { align: "center" });
    doc.moveDown();

    doc.fontSize(10).fillColor("#64748b").text(`Invoice Generated: ${new Date().toLocaleString()}`, { align: "right" });
    doc.moveDown();

    // Line separator
    doc.strokeColor("#cbd5e1").lineWidth(1).moveTo(50, doc.y).lineTo(550, doc.y).stroke();
    doc.moveDown();

    // Details Section
    doc.fontSize(12).fillColor("#0f172a");
    doc.text(`Appointment ID: ${appointment.appointmentId}`, { bold: true });
    doc.text(`Patient Name: ${appointment.patientName}`);
    doc.text(`Age: ${appointment.patientAge}`);
    doc.text(`Mobile Number: ${appointment.mobileNumber}`);
    doc.text(`Hospital: ${appointment.hospital}`);
    doc.text(`Specialist: ${appointment.specialist}`);
    doc.text(`Appointment Date: ${appointment.appointmentDate} (${appointment.timeSlot})`);
    doc.moveDown();

    // Payment Info Box
    doc.text(`Consultation Fee: Rs. ${appointment.amount}`);
    doc.text(`Payment Status: ${appointment.status}`);
    if (appointment.paymentId) {
        doc.text(`Payment ID: ${appointment.paymentId}`);
    }
    doc.moveDown(2);

    // Footer
    doc.fontSize(10).fillColor("#64748b").text("Thank you for choosing our hospital services. Please arrive 15 minutes prior to your slot.", { align: "center" });

    doc.end();
});

if (require.main === module) {
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
        console.log(`Server running at http://localhost:${PORT}`);
    });
}

module.exports = app;
