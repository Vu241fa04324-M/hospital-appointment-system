// ==========================================
// ELEMENTS
// ==========================================
const form = document.getElementById("appointmentForm");
const paymentSection = document.getElementById("payment-options");
const confirmationSection = document.getElementById("confirmation");

const cardOptions = document.getElementById("card-options");
const cardDetails = document.getElementById("card-details");
const netbankingDetails = document.getElementById("netbanking-details");
const upiDetails = document.getElementById("upi-details");

const backBtn = document.getElementById("back-btn");
const proceedBtn = document.getElementById("proceed-btn");
const backToPaymentBtn = document.getElementById("back-to-payment");
const continueBtn = document.getElementById("continue-btn");

let appointmentData = null;
let selectedPayment = "";

const paymentNames = {
    "card": "Card",
    "netbanking": "Netbanking",
    "pay-on-visit": "Pay on Visit",
    "upi": "UPI"
};


// ==========================================
// DON'T ALLOW PAST DATES
// ==========================================
const dateInput = document.getElementById("appointmentDate");

const now = new Date();
dateInput.min = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
    .toISOString()
    .split("T")[0];


// ==========================================
// STEP 1: BOOKING FORM
// ==========================================
form.addEventListener("submit", function (event) {
    event.preventDefault(); // stops the page from refreshing

    appointmentData = {
        patientName: document.getElementById("patientName").value.trim(),
        patientAge: document.getElementById("patientAge").value,
        hospital: document.getElementById("hospitalSelect").value,
        specialist: document.getElementById("specialistSelect").value,
        appointmentDate: document.getElementById("appointmentDate").value,
        timeSlot: document.getElementById("timeSlotSelect").value,
        mobileNumber: document.getElementById("mobileNumber").value.trim(),
        email: document.getElementById("emailAddress").value.trim()
    };

    form.style.display = "none";
    paymentSection.style.display = "block";
});


// ==========================================
// STEP 2: PAYMENT OPTIONS
// ==========================================
document.querySelectorAll('input[name="payment"]').forEach(function (radio) {

    radio.addEventListener("change", function () {
        selectedPayment = radio.value;

        cardOptions.style.display = "none";
        cardDetails.style.display = "none";
        netbankingDetails.style.display = "none";
        upiDetails.style.display = "none";

        if (selectedPayment === "card") {
            cardOptions.style.display = "block";
        } else if (selectedPayment === "netbanking") {
            netbankingDetails.style.display = "block";
        } else if (selectedPayment === "upi") {
            upiDetails.style.display = "block";
        }
    });
});

document.querySelectorAll('input[name="card-type"]').forEach(function (radio) {
    radio.addEventListener("change", function () {
        cardDetails.style.display = "block";
    });
});

backBtn.addEventListener("click", function () {
    paymentSection.style.display = "none";
    form.style.display = "block";
});

proceedBtn.addEventListener("click", function () {
    if (!selectedPayment) {
        alert("Please select a payment method.");

        return;
    }

    if (selectedPayment === "card") {
        if (!document.querySelector('input[name="card-type"]:checked')) {
            alert("Please select Credit Card or Debit Card.");
            return;
        }
        if (!/^[0-9]{12}$/.test(document.getElementById("card-number").value)) {
            alert("Card number must be 12 digits.");
            return;
        }
        if (!/^[0-9]{3}$/.test(document.getElementById("cvv").value)) {
            alert("CVV must be 3 digits.");
            return;
        }
    }

    if (selectedPayment === "netbanking" &&
        !document.getElementById("banking-id").value.trim()) {
        alert("Please enter your Banking ID.");
        return;
    }

    if (selectedPayment === "upi" &&
        !document.getElementById("upi-id").value.trim()) {
        alert("Please enter your UPI ID.");
        return;
    }

    paymentSection.style.display = "none";
    confirmationSection.style.display = "block";

});


// ==========================================
// STEP 3: CONFIRMATION
// ==========================================
backToPaymentBtn.addEventListener("click", function () {
    confirmationSection.style.display = "none";
    paymentSection.style.display = "block";
});

continueBtn.addEventListener("click", async function () {
    continueBtn.disabled = true;
    continueBtn.textContent = "Booking...";

    try {
        // Send the appointment to the server
        const response = await fetch("/api/appointments", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(appointmentData)
        });

        const result = await response.json();

        if (!response.ok || !result.success) {
            alert(result.message || "Could not book the appointment.");
            return;
        }

        downloadInvoice(result.appointmentId, result.status);


        confirmationSection.innerHTML =
            "<h3>Appointment Booked!</h3>" +
            "<p>Your appointment ID is <strong>" + result.appointmentId + "</strong></p>" +
            "<p>Your invoice has been downloaded. Save your ID to check the status.</p>" +
            '<p><a href="status.html">Check appointment status</a></p>';

    } catch (error) {
        alert("Could not reach the server. Please try again.");
    } finally {
        continueBtn.disabled = false;
        continueBtn.textContent = "Continue & Download Invoice";
    }
});


// ==========================================
// INVOICE DOWNLOAD
// ==========================================
function downloadInvoice(appointmentId, status) {
    const d = appointmentData;

    const text =
        "HOSPITAL APPOINTMENT INVOICE\n" +
        "============================\n\n" +
        "Appointment ID : " + appointmentId + "\n" +
        "Status         : " + status + "\n\n" +
        "Patient Name   : " + d.patientName + "\n" +
        "Patient Age    : " + d.patientAge + "\n" +
        "Mobile         : +91 " + d.mobileNumber + "\n" +
        "Email          : " + (d.email || "-") + "\n\n" +
        "Hospital       : " + d.hospital + "\n" +
        "Specialist     : " + d.specialist + "\n" +

        "Date           : " + d.appointmentDate + "\n" +
        "Time Slot      : " + d.timeSlot + "\n\n" +
        "Payment Method : " + paymentNames[selectedPayment] + "\n" +
        "Amount         : Rs. 300\n";

    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = "invoice-" + appointmentId + ".txt";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
}
