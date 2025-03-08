// Import jsPDF from the jspdf library
const { jsPDF } = window.jspdf;

// Function to format numbers
function formatNumber(value) {
    return new Intl.NumberFormat('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value);
}

// Add an event listener to the file input element
document
    .getElementById("fileInput")
    .addEventListener("change", function (event) {
        const file = event.target.files[0]; // Get the selected file
        if (!file) return; // If no file is selected, do nothing

        const reader = new FileReader(); // Create a new FileReader instance
        reader.onload = function (e) {
            const text = e.target.result; // Get the file content
            const normalizedText = text.replace(/\r\n/g, '\n'); // Normalize line endings to LF

            // Parse the file content using PapaParse
            Papa.parse(normalizedText, {
                delimiter: ";", // Specify the delimiter
                complete: function (results) {
                    console.log("Parsing complete:", results); // Debug log
                    generateEmployeeReports(results.data); // Generate employee reports
                },
            });
        };

        reader.readAsText(file, 'Windows-1251'); // Read the file as text with specified encoding
    });

// Function to generate employee reports
function generateEmployeeReports(data) {
    console.log("Data:", data); // Debug log
    if (data.length < 4) return;  // Ensure there are at least 3 rows to process
    let basicReportHTML = ""; // Initialize the basic HTML report string
    let fullReportHTML = ""; // Initialize the full HTML report string
    const pdf = new jsPDF(); // Create a new jsPDF instance
    let firstPage = true; // Flag to track if it's the first page
    let companyInfo = '';   // To store tax number, id, and name
    let monthYear = ''; // To store month and year

    // Process the first two rows (month/year and company info)
    companyInfo = `Правно лице: ${data[2][2]} ЕДБ: ${data[2][0]} ЕМБС: ${data[2][1]}`;
    monthYear = `Месец: ${data[1][0]} Година: ${data[1][1]}`;

    // Log the extracted month/year and tax info
    console.log("Month/Year:", monthYear);
    console.log("Tax Info:", companyInfo);

    // Parse rows from index 3 to data.length - 5
    for (let i = 3; i < data.length - 5; i++) {
        const row = data[i];

        // For employee data rows (should start from row 4 onwards)
        if (row.length >= 3) { // Ensure there are at least 3 columns (employee data)
            console.log("Adding employee data:", row); // Debug log
            basicReportHTML += '<div class="employee-card">'; // Start a new employee card
            fullReportHTML += '<div class="employee-card">'; // Start a new employee card
            basicReportHTML += `<h2>Месечен извештај за плата</h2>`;
            fullReportHTML += `<h2>Месечен извештај за плата</h2>`;

            // Add company info and period info
            basicReportHTML += `
                <div class="report-header">
                    <div class="company-info">
                        <div class="logo-placeholder"></div>
                        <p><strong>Правно лице:</strong> ${data[2][2]}</p>
                        <p><strong>ЕДБ:</strong> ${data[2][0]}</p>
                        <p><strong>ЕМБС:</strong> ${data[2][1]}</п>
                    </div>
                    <div class="period-info">
                        <p><strong>За период:</strong> ${monthYear}</p>
                    </div>
                </div>
            `;
            fullReportHTML += `
                <div class="report-header">
                    <div class="company-info">
                        <div class="logo-placeholder"></div>
                        <p><strong>Правно лице:</strong> ${data[2][2]}</п>
                        <p><strong>ЕДБ:</strong> ${data[2][0]}</п>
                        <p><strong>ЕМБС:</strong> ${data[2][1]}</п>
                    </div>
                    <div class="period-info">
                        <p><strong>За период:</strong> ${monthYear}</п>
                    </div>
                </div>
            `;

            // Add "во кратки црти" header
            basicReportHTML += `<div class="highlight-section"><h3>Во кратки црти</h3>`;

            // Create a new section for the first six fields
            basicReportHTML += '<div class="employee-basic-details">'; // Start a new section for basic details
            fullReportHTML += '<div class="employee-basic-details">'; // Start a new section for basic details

            let y = 20; // Initialize y-coordinate for PDF text
            pdf.addFileToVFS('Roboto-Regular.ttf', robotoFontBase64);
            pdf.addFont('Roboto-Regular.ttf', 'Roboto', 'normal'); 
            pdf.setFont('Roboto');
            pdf.setFontSize(12); // Set font size for PDF
            if (!firstPage) pdf.addPage(); // Add a new page if not the first page
            firstPage = false; // Set firstPage flag to false
            pdf.text(`Employee Report`, 10, 10); // Add title to PDF

            // Combine "Име" and "Презиме" into one field
            const fullName = `${row[headerRow.indexOf("Име")]} ${row[headerRow.indexOf("Презиме")]}`;
            basicReportHTML += `<p><strong>Име и Презиме:</strong> ${fullName}</п>`;
            pdf.text(`Име и Презиме: ${fullName}`, 10, y);
            y += 7;

            // Add "ЕМБГ" and "Број на трансакциска сметка"
            ["ЕМБГ", "Број на трансакциска сметка"].forEach((header) => {
                const index = headerRow.indexOf(header);
                if (index !== -1 && row[index].trim() !== "") {
                    const value = row[index];
                    basicReportHTML += `<p><strong>${header}:</strong> ${value}</п>`;
                    pdf.text(`${header}: ${value}`, 10, y);
                    y += 7;
                }
            });

            // Add salary info on the right
            basicReportHTML += `
                <div class="employee-info">
                    <div class="left-align">
                        <p><strong>Плата во вкупен износ:</strong></п>
                        <p><strong>Ефективна нето плата:</strong></п>
                    </div>
                    <div class="right-align">
                        <p>${formatNumber(parseFloat(row[headerRow.indexOf("Плата во вкупен износ")]))}</п>
                        <p>${formatNumber(parseFloat(row[headerRow.indexOf("Ефективна нето плата")]))}</п>
                    </div>
                </div>
            `;
            pdf.text(`Плата во вкупен износ: ${formatNumber(parseFloat(row[headerRow.indexOf("Плата во вкупен износ")]))}`, 10, y);
            y += 7;
            pdf.text(`Ефективна нето плата: ${formatNumber(parseFloat(row[headerRow.indexOf("Ефективна нето плата")]))}`, 10, y);
            y += 7;

            basicReportHTML += "</div>"; // Close the basic details section
            basicReportHTML += "</div>"; // Close the highlight section
            fullReportHTML += "</div>"; // Close the basic details section

            // Add "Повеќе детали" header with a button to collapse/expand the section
            basicReportHTML += `<h3 class="details-section">Повеќе детали <button class="toggle-details-btn" onclick="toggleDetails(this)">+</button></h3>`;

            // Create a new section for the remaining fields
            basicReportHTML += '<div class="employee-details details-section" style="display: none;">'; // Start a new section for details
            fullReportHTML += '<div class="employee-details">'; // Start a new section for details

            // Add remaining fields in a table
            basicReportHTML += '<table class="report-table">';
            basicReportHTML += '<thead><tr><th>Поле</th><th class="align-right">Износ</th></tr></thead><tbody>';
            basicReport.slice(6).forEach((header) => {
                const index = headerRow.indexOf(header);
                if (index !== -1 && row[index].trim() !== "" && row[index] !== "0.00") {
                    const value = row[index]; //formatNumber(parseFloat(row[index]));
                    basicReportHTML += `<tr><td><strong>${header}</strong></td><td class="align-right">${formatNumber(value)}</td></tr>`;
                    pdf.text(`${header}: ${formatNumber(value)}`, 10, y);
                    y += 7;
                }
            });
            basicReportHTML += '</tbody></table>';

            // Add all fields to the full report
            row.forEach((value, index) => {
                const header = headerRow[index] || `Field ${index + 1}`; // Get header or default field name
                if (value.trim() !== "") { // If the cell is not empty
                    fullReportHTML += `<p><strong>${header}:</strong> ${value}</п>`; // Add field to full HTML report
                    pdf.text(`${header}: ${value}`, 10, y); // Add field to PDF
                    y += 7; // Increment y-coordinate for next line
                }
            });

            basicReportHTML += "</div>"; // Close the employee details section
            fullReportHTML += "</div>"; // Close the employee details section

            basicReportHTML += "</div>"; // Close the basic employee card div
            fullReportHTML += "</div>"; // Close the full employee card div
        }
    }

    // Display the HTML reports
    console.log("Generated Basic HTML Report:", basicReportHTML); // Debug log
    console.log("Generated Full HTML Report:", fullReportHTML); // Debug log
    document.getElementById("basicReport").innerHTML = basicReportHTML; // Set the basic report HTML
    document.getElementById("fullReport").innerHTML = fullReportHTML; // Set the full report HTML
    document.getElementById("downloadPdf").style.display = "block"; // Show the download button
    document.getElementById("downloadPdf").onclick = function () {
        pdf.save("employee_reports.pdf"); // Save the PDF when the button is clicked
    };

    // Toggle button functionality
    document.getElementById("toggleReport").onclick = function () {
        const basicReport = document.getElementById("basicReport");
        const fullReport = document.getElementById("fullReport");
        const toggleButton = document.getElementById("toggleReport");
        if (basicReport.style.display === "none") {
            basicReport.style.display = "block";
            fullReport.style.display = "none";
            toggleButton.textContent = "Целосен МПИН извештај";
        } else {
            basicReport.style.display = "none";
            fullReport.style.display = "block";
            toggleButton.textContent = "Основен МПИН извештај";
        }
    };
}

// Function to toggle the visibility of the "Повеќе детали" section
function toggleDetails(button) {
    const detailsSection = button.closest('.details-section').nextElementSibling;
    if (detailsSection.style.display === 'none') {
        detailsSection.style.display = 'block';
        button.textContent = '-';
    } else {
        detailsSection.style.display = 'none';
        button.textContent = '+';
    }
}
