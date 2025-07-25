# PDF Generator API

This Node.js application uses **Express** and **Puppeteer** to generate PDFs (Invoices or Vouchers) based on grouped invoice data and custom HTML templates. It supports grouping records by ID and dynamically generates styled PDF documents with your company branding.

## Features

- Accepts JSON data and groups entries by `ID`
- Dynamically generates **Invoice** or **Voucher** PDFs using HTML templates
- Embeds a company logo in Base64 format
- Supports multiple PDFs in one request
- Saves generated PDFs to disk
- Includes invoice/voucher metadata like print date, invoice number, guest and hotel data
- Cross-Origin Resource Sharing (CORS) enabled for frontend integration

---

## Getting Started

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd <your-repo-folder>

2. Install Dependencies

npm install
3. Place Assets
Ensure you have a logo image named What.jpg inside the root directory of your project (or adjust the path in code).

4. Run the Server
node index.js
The server will run at http://localhost:3001

API Usage
POST /generate-pdf
Description: Generates PDFs for either invoice or voucher based on provided data.

Request Body
{
  "invoiceData": [
    {
      "ID": "A123",
      "name": "John Doe",
      "hotel": "Hilton",
      "startDate": 45500,
      "endDate": 45502,
      "nights": 2,
      "typeOfRoom": "Double",
      "hotelPricesPerOneDay": 100,
      "transfer": 50,
      "total": 250,
      "createDate": 45500,
      "invoiceNumber": "INV001"
    }
    // ... more entries grouped by same or different ID
  ],
  "documentType": "invoice" // or "voucher"
}
startDate, endDate, and createDate are expected as Excel serial date numbers
documentType can be either "invoice" or "voucher"
Example Response
{
  "message": "PDFs generated successfully",
  "pdfPaths": [
    "/path/to/project/invoices/Invoice_INV0011.pdf",
    "/path/to/project/invoices/Invoice_INV0022.pdf"
  ]
}
Folder Structure
project-root/
├── index.js
├── What.jpg                 # Logo image used in the PDF
├── invoices/                # Generated invoice PDFs
├── vouchers/                # Generated voucher PDFs
├── package.json
Create the invoices and vouchers folders manually if not already present.

Dependencies
express
puppeteer
cors
fs
path

License
MIT License
