document.addEventListener("DOMContentLoaded", function () {

    // ==========================================
    // GET HTML ELEMENTS
    // ==========================================

    const form = document.getElementById("appointmentForm");

    const paymentOptions =
        document.getElementById("payment-options");

    const confirmation =
        document.getElementById("confirmation");

    const cardOptions =
        document.getElementById("card-options");

    const cardDetails =
        document.getElementById("card-details");

    const netbankingDetails =
        document.getElementById("netbanking-details");

    const upiDetails =
        document.getElementById("upi-details");

    const proceedBtn =
        document.getElementById("proceed-btn");

    const backBtn =
        document.getElementById("back-btn");

    const continueBtn =
        document.getElementById("continue-btn");

    const backToPaymentBtn =
        document.getElementById("back-to-payment");

    const paymentRadios =
        document.querySelectorAll('input[name="payment"]');

    const cardTypeRadios =
        document.querySelectorAll('input[name="card-type"]');


    // ==========================================
    // CHECK REQUIRED ELEMENTS
    // ==========================================

    if (!form) {
        console.error("appointmentForm not found.");
        return;
    }

    if (!paymentOptions) {
        console.error("payment-options not found.");
        return;
    }


    // ==========================================
    // SET MINIMUM APPOINTMENT DATE
    // ==========================================

    const dateInput =
        document.getElementById("appointmentDate");

    if (dateInput) {

        const today = new Date();

        const year = today.getFullYear();

        const month =
            String(today.getMonth() + 1).padStart(2, "0");

        const day =
            String(today.getDate()).padStart(2, "0");

        dateInput.min =
            `${year}-${month}-${day}`;
    }


    // ==========================================
    // STORE APPOINTMENT ID
    // ==========================================

    let savedAppointmentId = null;


    // ==========================================
    // BOOK APPOINTMENT
    // FRONTEND → BACKEND
    // ==========================================

    form.addEventListener("submit", async function (event) {

        event.preventDefault();


        // ======================================
        // CHECK FORM
        // ======================================

        if (!form.checkValidity()) {

            form.reportValidity();

            return;
        }


        // ======================================
        // COLLECT FORM DATA
        // ======================================

        const appointmentData = {

            patientName:
                document.getElementById("patientName").value.trim(),

            patientAge:
                document.getElementById("patientAge").value.trim(),

            hospital:
                document.getElementById("hospitalSelect").value,

            specialist:
                document.getElementById("specialistSelect").value,

            appointmentDate:
                document.getElementById("appointmentDate").value,

            timeSlot:
                document.getElementById("timeSlotSelect").value,

            mobileNumber:
                document.getElementById("mobileNumber").value.trim(),

            email:
                document.getElementById("emailAddress").value.trim()
        };


        console.log(
            "Sending appointment to backend:",
            appointmentData
        );


        // ======================================
        // SEND DATA TO BACKEND
        // ======================================

        try {

            const response = await fetch(
                "http://localhost:3000/api/appointments",
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body:
                        JSON.stringify(appointmentData)
                }
            );


            // ==================================
            // CHECK SERVER RESPONSE
            // ==================================

            if (!response.ok) {

                throw new Error(
                    "Backend returned status " +
                    response.status
                );
            }


            const result =
                await response.json();


            console.log(
                "Backend response:",
                result
            );


            // ==================================
            // SUCCESS
            // ==================================

            if (result.success) {

                // Save database appointment ID
                savedAppointmentId =
                    result.appointmentId;


                // Save ID in browser
                localStorage.setItem(
                    "lastAppointmentId",
                    savedAppointmentId
                );


                alert(
                    "Appointment details sent successfully!\n\n" +
                    "Your Appointment ID is: APT-" +
                    savedAppointmentId
                );


                // Hide appointment form
                form.style.display = "none";


                // Show payment section
                paymentOptions.style.display = "block";


                // Scroll to payment
                paymentOptions.scrollIntoView({
                    behavior: "smooth",
                    block: "start"
                });

            }

            else {

                alert(
                    result.message ||
                    "Something went wrong."
                );

            }

        }

        catch (error) {

            console.error(
                "Backend Error:",
                error
            );


            alert(
                "Cannot connect to backend.\n\n" +
                "Please make sure the backend server is running."
            );

        }

    });


    // ==========================================
    // PAYMENT METHOD
    // ==========================================

    paymentRadios.forEach(function (radio) {

        radio.addEventListener("change", function () {


            // Hide all payment details

            if (cardOptions) {
                cardOptions.style.display = "none";
            }

            if (netbankingDetails) {
                netbankingDetails.style.display = "none";
            }

            if (upiDetails) {
                upiDetails.style.display = "none";
            }


            // Show selected payment

            if (this.value === "card") {

                if (cardOptions) {
                    cardOptions.style.display = "block";
                }

            }


            if (this.value === "netbanking") {

                if (netbankingDetails) {
                    netbankingDetails.style.display = "block";
                }

            }


            if (this.value === "upi") {

                if (upiDetails) {
                    upiDetails.style.display = "block";
                }

            }

        });

    });


    // ==========================================
    // CARD TYPE
    // ==========================================

    cardTypeRadios.forEach(function (radio) {

        radio.addEventListener("change", function () {

            if (cardDetails) {

                cardDetails.style.display = "block";

            }

        });

    });


    // ==========================================
    // BACK BUTTON
    // PAYMENT → APPOINTMENT
    // ==========================================

    if (backBtn) {

        backBtn.addEventListener("click", function () {

            paymentOptions.style.display = "none";

            form.style.display = "block";

            window.scrollTo({
                top: 0,
                behavior: "smooth"
            });

        });

    }


    // ==========================================
    // PROCEED TO CONFIRMATION
    // ==========================================

    if (proceedBtn) {

        proceedBtn.addEventListener("click", function () {


            // ==================================
            // GET PAYMENT METHOD
            // ==================================

            const selectedPayment =
                document.querySelector(
                    'input[name="payment"]:checked'
                );


            if (!selectedPayment) {

                alert(
                    "Please select a payment method."
                );

                return;
            }


            // ==================================
            // CARD VALIDATION
            // ==================================

            if (selectedPayment.value === "card") {

                const selectedCard =
                    document.querySelector(
                        'input[name="card-type"]:checked'
                    );


                if (!selectedCard) {

                    alert(
                        "Please select Credit Card or Debit Card."
                    );

                    return;
                }


                const cardNumberElement =
                    document.getElementById("card-number");

                const cvvElement =
                    document.getElementById("cvv");


                const cardNumber =
                    cardNumberElement
                        ? cardNumberElement.value.trim()
                        : "";


                const cvv =
                    cvvElement
                        ? cvvElement.value.trim()
                        : "";


                if (!/^[0-9]{12}$/.test(cardNumber)) {

                    alert(
                        "Please enter a valid 12-digit card number."
                    );

                    return;
                }


                if (!/^[0-9]{3}$/.test(cvv)) {

                    alert(
                        "Please enter a valid 3-digit CVV."
                    );

                    return;
                }

            }


            // ==================================
            // NETBANKING VALIDATION
            // ==================================

            if (selectedPayment.value === "netbanking") {

                const bankingElement =
                    document.getElementById("banking-id");


                const bankingId =
                    bankingElement
                        ? bankingElement.value.trim()
                        : "";


                if (bankingId === "") {

                    alert(
                        "Please enter your Banking ID."
                    );

                    return;
                }

            }


            // ==================================
            // UPI VALIDATION
            // ==================================

            if (selectedPayment.value === "upi") {

                const upiElement =
                    document.getElementById("upi-id");


                const upiId =
                    upiElement
                        ? upiElement.value.trim()
                        : "";


                if (upiId === "") {

                    alert(
                        "Please enter your UPI ID."
                    );

                    return;
                }

            }


            // ==================================
            // SHOW CONFIRMATION
            // ==================================

            paymentOptions.style.display = "none";


            if (confirmation) {

                confirmation.style.display = "block";

                confirmation.scrollIntoView({
                    behavior: "smooth",
                    block: "start"
                });

            }

        });

    }


    // ==========================================
    // BACK TO PAYMENT
    // ==========================================

    if (backToPaymentBtn) {

        backToPaymentBtn.addEventListener(
            "click",
            function () {

                if (confirmation) {

                    confirmation.style.display = "none";

                }


                paymentOptions.style.display = "block";


                paymentOptions.scrollIntoView({
                    behavior: "smooth",
                    block: "start"
                });

            }
        );

    }


    // ==========================================
    // DOWNLOAD INVOICE
    // ==========================================

    if (continueBtn) {

        continueBtn.addEventListener(
            "click",
            function () {


                // ==================================
                // GET PATIENT DATA
                // ==================================

                const patientName =
                    document.getElementById(
                        "patientName"
                    ).value;


                const patientAge =
                    document.getElementById(
                        "patientAge"
                    ).value;


                const mobileNumber =
                    document.getElementById(
                        "mobileNumber"
                    ).value;


                const email =
                    document.getElementById(
                        "emailAddress"
                    ).value;


                // ==================================
                // GET APPOINTMENT DATA
                // ==================================

                const hospital =
                    document.getElementById(
                        "hospitalSelect"
                    ).value;


                const specialist =
                    document.getElementById(
                        "specialistSelect"
                    ).value;


                const appointmentDate =
                    document.getElementById(
                        "appointmentDate"
                    ).value;


                const timeSlot =
                    document.getElementById(
                        "timeSlotSelect"
                    ).value;


                // ==================================
                // GET PAYMENT METHOD
                // ==================================

                const selectedPayment =
                    document.querySelector(
                        'input[name="payment"]:checked'
                    );


                let paymentMethod =
                    "Not selected";


                if (selectedPayment) {

                    paymentMethod =
                        selectedPayment.value;

                }


                // ==================================
                // APPOINTMENT NUMBER
                // ==================================

                const appointmentNumber =
                    savedAppointmentId
                        ? "APT-" + savedAppointmentId
                        : "APT-" + Date.now();


                // ==================================
                // CREATE INVOICE
                // ==================================

                const invoiceHTML = `

<!DOCTYPE html>

<html lang="en">

<head>

<meta charset="UTF-8">

<meta name="viewport"
content="width=device-width, initial-scale=1.0">

<title>Hospital Appointment Invoice</title>

<style>

body {

    font-family: Arial, sans-serif;

    background: #f0f0f0;

    margin: 0;

    padding: 30px;

}

.invoice {

    max-width: 650px;

    margin: auto;

    background: white;

    padding: 30px;

    border-radius: 10px;

    box-shadow:
        0 5px 20px
        rgba(0,0,0,0.15);

}

h1 {

    text-align: center;

    color: #35c3b1;

}

h2 {

    color: #333;

    border-bottom:
        1px solid #ddd;

    padding-bottom: 8px;

}

.info {

    margin-bottom: 25px;

}

.info p {

    margin: 8px 0;

}

.amount {

    font-size: 20px;

    font-weight: bold;

    color: #35c3b1;

}

.footer {

    text-align: center;

    color: #777;

    margin-top: 30px;

}

.status-box {

    margin-top: 20px;

    padding: 15px;

    background: #f5f5f5;

    text-align: center;

    border-radius: 8px;

}

.status-box a {

    display: inline-block;

    margin-top: 10px;

    padding: 10px 18px;

    background: #35c3b1;

    color: white;

    text-decoration: none;

    border-radius: 6px;

}

</style>

</head>

<body>

<div class="invoice">

<h1>
Hospital Appointment Invoice
</h1>


<div class="info">

<h2>
Appointment Information
</h2>

<p>
<strong>Appointment ID:</strong>
${appointmentNumber}
</p>

<p>
<strong>Date:</strong>
${appointmentDate}
</p>

<p>
<strong>Time:</strong>
${timeSlot}
</p>

</div>


<div class="info">

<h2>
Patient Details
</h2>

<p>
<strong>Name:</strong>
${patientName}
</p>

<p>
<strong>Age:</strong>
${patientAge}
</p>

<p>
<strong>Mobile:</strong>
+91 ${mobileNumber}
</p>

<p>
<strong>Email:</strong>
${email || "N/A"}
</p>

</div>


<div class="info">

<h2>
Hospital Details
</h2>

<p>
<strong>Hospital:</strong>
${hospital}
</p>

<p>
<strong>Specialist:</strong>
${specialist}
</p>

</div>


<div class="info">

<h2>
Payment Details
</h2>

<p>
<strong>Payment Method:</strong>
${paymentMethod}
</p>

<p class="amount">
Amount: ₹300
</p>

</div>


<div class="status-box">

<strong>
Appointment Status
</strong>

<br>

Pending

<br>

<a href="status.html?id=${savedAppointmentId}">
Check Appointment Status
</a>

</div>


<div class="footer">

<p>
Thank you for booking your appointment!
</p>

<p>
Hospital Appointment Booking System
</p>

</div>

</div>

</body>

</html>

`;


                // ==================================
                // DOWNLOAD INVOICE
                // ==================================

                const blob =
                    new Blob(
                        [invoiceHTML],
                        {
                            type: "text/html"
                        }
                    );


                const url =
                    URL.createObjectURL(blob);


                const downloadLink =
                    document.createElement("a");


                downloadLink.href = url;


                downloadLink.download =
                    "appointment_invoice.html";


                document.body.appendChild(
                    downloadLink
                );


                downloadLink.click();


                document.body.removeChild(
                    downloadLink
                );


                URL.revokeObjectURL(url);


                // ==================================
                // SUCCESS MESSAGE
                // ==================================

                alert(
                    "Appointment confirmed!\n\n" +
                    "Appointment ID: APT-" +
                    savedAppointmentId +
                    "\n\n" +
                    "Invoice downloaded successfully."
                );


                // ==================================
                // SHOW STATUS BUTTON ON PAGE
                // ==================================

                showStatusButton();

            }
        );

    }


    // ==========================================
    // SHOW STATUS BUTTON
    // ==========================================

    function showStatusButton() {

        if (!savedAppointmentId) {
            return;
        }


        // Don't create duplicate button
        if (document.getElementById("check-status-btn")) {
            return;
        }


        const statusButton =
            document.createElement("button");


        statusButton.id =
            "check-status-btn";


        statusButton.type =
            "button";


        statusButton.textContent =
            "Check Appointment Status";


        statusButton.style.display =
            "block";


        statusButton.style.margin =
            "20px auto";


        statusButton.style.padding =
            "12px 24px";


        statusButton.style.border =
            "none";


        statusButton.style.borderRadius =
            "6px";


        statusButton.style.background =
            "#35c3b1";


        statusButton.style.color =
            "white";


        statusButton.style.fontSize =
            "16px";


        statusButton.style.cursor =
            "pointer";


        statusButton.addEventListener(
            "click",
            function () {

                window.location.href =
                    "status.html?id=" +
                    savedAppointmentId;

            }
        );


        if (confirmation) {

            confirmation.appendChild(
                statusButton
            );

        }

    }

});