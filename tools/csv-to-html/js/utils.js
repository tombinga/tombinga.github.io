class CSVValidator {
  static parseCSVRow(row) {
    const cells = [];
    let cell = "";
    let inQuotes = false;

    for (let i = 0; i < row.length; i++) {
      const char = row[i];

      if (char === '"') {
        if (inQuotes && row[i + 1] === '"') {
          // Handle escaped quotes
          cell += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
        continue;
      }

      if (char === "," && !inQuotes) {
        cells.push(cell.trim());
        cell = "";
        continue;
      }

      cell += char;
    }
    cells.push(cell.trim()); // Push the last cell

    return cells;
  }

  static validateCSV(csvData) {
    if (!csvData || csvData.trim() === "") {
      throw new Error("CSV file is empty");
    }

    const rows = csvData.split("\n");
    if (rows.length < 2) {
      throw new Error("CSV file must contain headers and at least one data row");
    }

    const headerCount = rows[0].split(",").length;

    for (let i = 1; i < rows.length; i++) {
      if (rows[i].trim() === "") continue;

      const cellCount = rows[i].split(",").length;
      if (cellCount !== headerCount) {
        throw new Error(`Invalid data format in row ${i + 1}. Expected ${headerCount} columns but found ${cellCount}`);
      }
    }

    return true;
  }

  static sanitizeCell(cell) {
    return cell.trim().replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }
}

class HTMLGenerator {
  static convertToTable(csvData) {
    const rows = csvData.split("\n").map((row) => row.trim());
    let tableHtml = '<table class="result-table">';

    // Handle headers
    const headers = CSVValidator.parseCSVRow(rows[0]);
    tableHtml += "<thead><tr>";
    headers.forEach((header) => {
      tableHtml += `<th>${CSVValidator.sanitizeCell(header).trim()}</th>`;
    });
    tableHtml += "</tr></thead>";

    // Handle data rows
    tableHtml += "<tbody>";
    for (let i = 1; i < rows.length; i++) {
      if (rows[i].trim() === "") continue;
      const cells = CSVValidator.parseCSVRow(rows[i]);
      tableHtml += "<tr>";
      cells.forEach((cell) => {
        tableHtml += `<td>${CSVValidator.sanitizeCell(cell).trim()}</td>`;
      });
      tableHtml += "</tr>";
    }
    tableHtml += "</tbody></table>";

    return tableHtml;
  }
}

class HTMLBeautifier {
  static beautify(html) {
    // First clean up any existing whitespace/newlines
    html = html.replace(/>\s+</g, "><");

    // Replace specific tags with line breaks and indentation
    const beautified = html
      // Add newline and indent after opening table tag
      .replace(/<table/g, "\n<table")
      // Add newline before closing table tag
      .replace(/<\/table>/g, "\n</table>")
      // Add indentation for thead and tbody
      .replace(/<(thead|tbody)>/g, "\n    <$1>")
      .replace(/<\/(thead|tbody)>/g, "\n    </$1>")
      // Add indentation for tr
      .replace(/<tr>/g, "\n        <tr>")
      .replace(/<\/tr>/g, "\n        </tr>")
      // Handle td and th tags (keep closing tags on same line)
      .replace(/<(td|th)>/g, "\n            <$1>")
      .replace(/<\/(td|th)>/g, "</$1>")
      // Clean up any multiple newlines
      .replace(/\n\s*\n/g, "\n")
      // Remove any trailing whitespace on lines
      .split("\n")
      .map((line) => line.trimRight())
      .join("\n")
      .trim();

    return beautified;
  }
}
