document.addEventListener("DOMContentLoaded", function () {
  const fileInput = document.getElementById("csvFile");
  const loadingSpinner = document.getElementById("loadingSpinner");
  const errorMessage = document.getElementById("errorMessage");
  const resultSection = document.getElementById("resultSection");
  const tableResult = document.getElementById("tableResult");
  const copyHtmlBtn = document.getElementById("copyHtml");
  const downloadHtmlBtn = document.getElementById("downloadHtml");
  const previewToggleBtn = document.getElementById("previewToggle");

  let currentHtml = "";
  let beautifiedHtml = "";
  let isPreviewMode = true;

  fileInput.addEventListener("change", handleFileUpload);
  copyHtmlBtn.addEventListener("click", copyHtmlToClipboard);
  downloadHtmlBtn.addEventListener("click", downloadHtml);
  previewToggleBtn.addEventListener("click", togglePreview);

  async function handleFileUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    // Show loading spinner
    loadingSpinner.classList.remove("hidden");
    errorMessage.classList.add("hidden");
    resultSection.classList.add("hidden");

    try {
      const csvData = await readFile(file);
      CSVValidator.validateCSV(csvData);
      currentHtml = HTMLGenerator.convertToTable(csvData);
      beautifiedHtml = HTMLBeautifier.beautify(currentHtml);
      tableResult.innerHTML = currentHtml;
      resultSection.classList.remove("hidden");
    } catch (error) {
      showError(error.message);
    } finally {
      loadingSpinner.classList.add("hidden");
    }
  }

  function readFile(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => resolve(event.target.result);
      reader.onerror = (error) => reject(error);
      reader.readAsText(file);
    });
  }

  async function copyHtmlToClipboard() {
    try {
      await navigator.clipboard.writeText(beautifiedHtml);
      alert("HTML copied to clipboard!");
    } catch (err) {
      showError("Failed to copy HTML to clipboard");
    }
  }

  function downloadHtml() {
    const blob = new Blob([beautifiedHtml], { type: "text/html" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "table.html";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }

  function togglePreview() {
    isPreviewMode = !isPreviewMode;
    if (isPreviewMode) {
      tableResult.innerHTML = currentHtml;
      previewToggleBtn.textContent = "View Raw HTML";
    } else {
      tableResult.innerHTML = `
        <pre class="language-html" style="background-color: #2d2d2d; padding: 15px; border-radius: 4px; overflow-x: auto;"><code class="language-html">${escapeHtml(
          beautifiedHtml
        )}</code></pre>
      `;
      Prism.highlightAll();
      previewToggleBtn.textContent = "View Preview";
    }
  }

  function showError(message) {
    errorMessage.textContent = message;
    errorMessage.classList.remove("hidden");
  }

  function escapeHtml(html) {
    return html
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }
});
