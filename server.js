const express = require("express");
const puppeteer = require("puppeteer");
const fs = require("fs");
const cors = require("cors");
const path = require("path");

const app = express();
app.use(cors());
app.use(express.json());

// Function to get Base64 from image file
async function getBase64FromFile(filePath) {
  return new Promise((resolve, reject) => {
    fs.readFile(filePath, (err, data) => {
      if (err) {
        return reject(err);
      }
      const base64Image = Buffer.from(data).toString("base64");
      resolve(base64Image);
    });
  });
}


app.post("/generate-pdf", async (req, res) => {

  const { invoiceData, documentType } = req.body;

  const browser = await puppeteer.launch({
    args: ["--allow-file-access-from-files", "--enable-local-file-accesses"],
  });

  const logoPath = path.join(__dirname, "What.jpg"); // Adjust the path to your image
  const logo = await getBase64FromFile(logoPath);

  const pdfPaths = []; // Array to store generated PDF paths
  // console.log(families, singles);

  // Function to group by ID
  function groupById(invoiceData) {
    const grouped = {};

    // Loop through each hotel object
    invoiceData.holedata.forEach((hotel) => {
      const { ID } = hotel;

      // If the ID doesn't exist in the grouped object, initialize it
      if (!grouped[ID]) {
        grouped[ID] = [];
      }

      // Push the hotel object into the respective ID group
      grouped[ID].push(hotel);
    });

    // Convert the grouped object back into an array of arrays
    return Object.values(grouped);
  }
  const formatDate = (date) => {
    if (!(date instanceof Date)) {
      throw new Error(`Invalid date passed to formatDate: ${date}`);
    }
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();

    return `${day}/${month}/${year}`;
  };

  const excelDateToJSDate = (serial) => {
    const excelEpoch = new Date(Date.UTC(1899, 11, 30));
    // const daysOffset = serial >= 60 ? serial - 1 : serial;
    return new Date(excelEpoch.getTime() + serial * 24 * 60 * 60 * 1000);
  };
  // Regroup the hotels by ID
  const groupedHotels = groupById(invoiceData);
  // const printDate = '31.12.2024'

  try {
    // Generate PDFs for family groups
    for (let group of groupedHotels) {

      const printDate = group[0]?.createDate
        ? formatDate(excelDateToJSDate(group[0].createDate))
        : formatDate(new Date());

      const invoiceNumber = `${group[0]?.invoiceNumber || 'L0000'}${pdfPaths.length + 1}`;

      const htmlContent = documentType === 'invoice'
        ? generateInvoiceTemplate(group, printDate, invoiceNumber, logo)
        : generateVoucherTemplate(group, printDate, invoiceNumber, logo);


      function generateInvoiceTemplate(group, printDate, invoiceNumber, logo) {
        return `

      <!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Invoice</title>
    <style>
    html {
  -webkit-print-color-adjust: exact;
}
      body {
        font-family: Arial, sans-serif;
        margin: 0;
        padding: 20px;
      }

      .invoice {
        width: 800px;
        margin: auto;
        padding: 20px;
      }

      /* Styles for the first table (Guest Names) */
      .guest-table {
        width: 100%;
        margin-bottom: 6px;
        border-collapse: collapse;
      }
      .guest-table th,
      .guest-table td {
        text-align: left;
        border: none; 
      }
      .guest-table th {
        background-color: #f2f2f2 !important;
      }

      /* Styles for the second table (Hotel Details) */
      .details-table {
        width: 100%;
        /* margin-bottom: 20px; */
        border-collapse: collapse;
      }
      .details-table th,
      .details-table td {
        border: 1px solid #333;
        padding: 10px;
        text-align: center;
      }
      .details-table th {
        background-color: #d9e1f2 !important;
      }

      .total {
        color: #002060;
        border: 3px solid black;
        padding: 3px;
        display: flex;
        justify-content: space-between;
        /* text-align: right; */
        font-weight: bold;
        margin-top: 20px;
      }

      .signature-section {
        color: #2f5496;
        margin-top: 20px;
      }
      .left-line {
        color: #2f5496;
        text-align: right;
        border-right: 8px solid #000;
        padding: 10px;
        height: 51px;
        margin: 20px;
        margin-right: 96px;
      }
      .padding_left {
        padding-left: 137px;
      }
      .flex_box {
        display: flex;
        justify-content: space-between;
        background-color: #b4c6e7 !important;
        color: #1f4e78;
        padding-top: 20px;
        padding-right: 30px;
      }
      .bk_color {
        color: #1f4e78;
      }
      .bk_color_guest {
        background-color: #ddebf7 !important;
      }
      .bk_color_details {
        background-color: #d9e1f2 !important;
      }
      .h3_style {
        background-color: #ddebf7 !important;
        color: #002060;
        margin: 0;
        padding-left: 15px;
      }
      .p_style {
        margin-top: 3px;
      }
      .bank-details {
        margin-top: 28px;
      }
    </style>
  </head>
  <body>
    <div class="invoice">
     <div><img src="data:image/jpeg;base64,${logo}" alt="logo" /</div>
      <p>
        Address: Batumi,Baratashvili Ave. 24, Phone: +995 568 93 36 92, ID:
        445672736
      </p>
      <div class="left-line">
        <div>Date ${printDate}</div>
        <div>Invoice No ${invoiceNumber}</div>
        <div>Terms Upon the receipt</div>
      </div>

      <div class="flex_box" style="background-color: #b4c6e7 !important">
        <div>
          <div>Invoice No:</div>
          <span class="bk_color">${invoiceNumber}</span>
        </div>
        <div>
          <div>Agency Name:</div>
          <span class="bk_color"> Yuli Tour</span>
        </div>
        <div>
          <div>Print Date:</div>
          <span class="bk_color"> ${printDate}</span>
        </div>
      </div>
      <table class="guest-table">
        <thead>
          <tr>
            <th class="bk_color_guest"   style="background-color: #ddebf7 !important" >Guest Names</th>
          </tr>
        </thead>
      <tbody>
            ${group
            .map(
              (member) => `
              <tr>
                <td>${member.name}</td>
              </tr>
            `
            )
            .join("")}
          </tbody>
      </table>
      <table class="details-table">
        <thead>
          <tr class="bk_color_details">
            <th>Hotel</th>
            <th>Check In</th>
            <th>Check Out</th>
            <th>Nights</th>
            <th>Room Type</th>
            <th>Room Cost</th>
            <th>Transfer Cost</th>
            <th>Total</th>
          </tr>
        </thead>
   <tbody>
            ${group
            .filter(row => row.hotelCost > 0)
            .map(
              (row) => `
              <tr>
                <td>wyndham batumi</td>
                <td>${formatDate(excelDateToJSDate(row.startDate))}</td>
                <td>${formatDate(excelDateToJSDate(row.endDate))}</td>
                <td>${row.nights}</td>
                <td>${row.typeOfRoom}</td>
                <td>${row.hotelPricesPerOneDay}</td>
                <td>${row.transfer}</td>
                <td>${row.total}</td>
              </tr>
            `
            )
            .join("")}
          </tbody>
      </table>

      <h3 class="h3_style">Other Services</h3>
      <p class="p_style">
        All transfers by private car with English speaking driver
      </p>

      <div class="total">TOTAL: <span>
       $${group.reduce((acc, member) => acc + member.total, 0)}
      </span></div>

      <div class="signature-section">
        <p><strong>Authorized and Approved: Levan Davitadze</strong></p>
        <p><strong>Print Name: Levan Davitadze</strong></p>
        <p><strong>Print Date: ${printDate}</strong></p>
      </div>

      <div class="bank-details">
        <p>Name of Beneficiary: <strong>Yuli Tour LLC</strong></p>
        <p>Beneficiary’s Bank:<strong>JSC Credo Bank</strong></p>
        <p class="padding_left"><strong>Batumi, Georgia</strong></p>
        <p class="padding_left"><strong>Swift: JSCRGE22</strong></p>
        <p>Ben’s IBAN:<strong>GE26CD0360000039174901</strong></p>
      </div>
    </div>
  </body>
</html>
    `;
      }

      function generateVoucherTemplate(group, printDate, invoiceNumber, logo) {
        return ` 
        
      <!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Voucher</title>
    <style>
    html {
  -webkit-print-color-adjust: exact;
}
      body {
        font-family: Arial, sans-serif;
        margin: 0;
        padding: 20px;
      }

      .invoice {
        width: 800px;
        margin: auto;
        padding: 20px;
      }

      /* Styles for the first table (Guest Names) */
      .guest-table {
        width: 100%;
        margin-bottom: 6px;
        border-collapse: collapse;
      }
      .guest-table th,
      .guest-table td {
        text-align: left;
        border: none; 
      }
      .guest-table th {
        background-color: #f2f2f2 !important;
      }

      /* Styles for the second table (Hotel Details) */
      .details-table {
        width: 100%;
        /* margin-bottom: 20px; */
        border-collapse: collapse;
      }
      .details-table th,
      .details-table td {
        border: 1px solid #333;
        padding: 10px;
        text-align: center;
      }
      .details-table th {
        background-color: #d9e1f2 !important;
      }

      .total {
        color: #002060;
        border: 3px solid black;
        padding: 3px;
        display: flex;
        justify-content: space-between;
        /* text-align: right; */
        font-weight: bold;
        margin-top: 20px;
      }

      .signature-section {
        color: #2f5496;
        margin-top: 20px;
      }
      .left-line {
        color: #2f5496;
        text-align: right;
        border-right: 8px solid #000;
        padding: 10px;
        height: 51px;
        margin: 20px;
        margin-right: 96px;
      }
      .padding_left {
        padding-left: 137px;
      }
      .flex_box {
        display: flex;
        justify-content: space-between;
        background-color: #b4c6e7 !important;
        color: #1f4e78;
        padding-top: 20px;
        padding-right: 30px;
      }
      .bk_color {
        color: #1f4e78;
      }
      .bk_color_guest {
        background-color: #ddebf7 !important;
      }
      .bk_color_details {
        background-color: #d9e1f2 !important;
      }
      .h3_style {
        background-color: #ddebf7 !important;
        color: #002060;
        margin: 0;
        padding-left: 15px;
      }
      .p_style {
        margin-top: 3px;
      }
      .bank-details {
        margin-top: 28px;
      }
    </style>
  </head>
  <body>
    <div class="invoice">
     <div><img src="data:image/jpeg;base64,${logo}" alt="logo" /</div>
      <p>
        Address: Batumi,Baratashvili Ave. 24, Phone: +995 568 93 36 92, ID:
        445672736
      </p>
      <div class="left-line">
        <div>Date ${printDate}</div>
        <div>Invoice No ${invoiceNumber}</div>
      </div>

      <div class="flex_box" style="background-color: #b4c6e7 !important">
        <div>
          <div>Invoice No:</div>
          <span class="bk_color">${invoiceNumber}</span>
        </div>
        <div>
          <div>Agency Name:</div>
          <span class="bk_color"> Yuli Tour</span>
        </div>
        <div>
          <div>Print Date:</div>
          <span class="bk_color"> ${printDate}</span>
        </div>
      </div>
      <table class="guest-table">
        <thead>
          <tr>
            <th class="bk_color_guest"   style="background-color: #ddebf7 !important" >Guest Names</th>
          </tr>
        </thead>
      <tbody>
            ${group
            .map(
              (member) => `
              <tr>
                <td>${member.name}</td>
              </tr>
            `
            )
            .join("")}
          </tbody>
      </table>
      <table class="details-table">
        <thead>
          <tr class="bk_color_details">
            <th>Hotel</th>
            <th>Check In</th>
            <th>Check Out</th>
            <th>Nights</th>
            <th>Room Type</th>
            <th>Room Cost</th>
            <th>Transfer Cost</th>
            <th>Total</th>
          </tr>
        </thead>
   <tbody>
            ${group
            .filter(row => row.hotelCost > 0)
            .map(
              (row) => `
              <tr>
                <td>wyndham batumi</td>
                <td>${formatDate(excelDateToJSDate(row.startDate))}</td>
                <td>${formatDate(excelDateToJSDate(row.endDate))}</td>
                <td>${row.nights}</td>
                <td>${row.typeOfRoom}</td>
                <td>${row.hotelPricesPerOneDay}</td>
                <td>${row.transfer}</td>
                <td>${row.total}</td>
              </tr>
            `
            )
            .join("")}
          </tbody>
      </table>
      <h3 class="h3_style">Other Services</h3>
      <p class="p_style">
        All transfers by private car with English speaking driver
      </p>
        <div>
            ${group
            .filter(row => row.transfer > 0)
            .map(
              (row) => `
                <p>${formatDate(excelDateToJSDate(row.startDate))} - transfer from airport </p>
                <p>${formatDate(excelDateToJSDate(row.endDate))} - transfer to airport </p>
            `
            )
            .join("")}
        </div>
      <div class="signature-section">
        <p><strong>Authorized and Approved: Levan Davitadze</strong></p>
        <p><strong>Print Name: Levan Davitadze</strong></p>
        <p><strong>Print Date: ${printDate}</strong></p>
      </div>
    </div>
  </body>
</html>
        
        
        `;
      }

      const page = await browser.newPage();

      await page.setContent(htmlContent, { waitUntil: "networkidle0" });

      const fileName = documentType === 'invoice' ? 'Invoice' : 'Voucher';
      const folderName = documentType === 'invoice' ? 'invoices' : 'vouchers';

      const pdfPath = path.join(
        __dirname,
        folderName,
        `${fileName}_${invoiceNumber}.pdf`
      );


      await page.pdf({ path: pdfPath, format: "A4" });
      pdfPaths.push(pdfPath); // Store the path for sending later

      await page.close(); // Close the page after generating the PDF
    }

    // Send response back to the client
    res.status(200).json({ message: "PDFs generated successfully", pdfPaths });
  } catch (error) {
    console.error("Error generating PDFs:", error);
    res
      .status(500)
      .json({ message: "Error generating PDFs", error: error.message });
  } finally {
    await browser.close(); // Ensure the browser is closed after all operations
  }
});

app.listen(3000, () => {
  console.log("Server running on port 3000");
});
