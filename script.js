let dataExcel = [];

// Ganti URL ini dengan URL raw GitHub kamu
const excelURL = "https://raw.githubusercontent.com/username/repo/main/barcode.xlsx";

fetch(excelURL)
  .then(response => response.arrayBuffer())
  .then(data => {
    const workbook = XLSX.read(data, { type: "array" });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    dataExcel = XLSX.utils.sheet_to_json(sheet);
    console.log("Database berhasil dimuat dari GitHub! Baris:", dataExcel.length);
  })
  .catch(err => {
    console.error("Gagal ambil file Excel dari GitHub:", err.message);
  });

document.getElementById('excelFile').addEventListener('change', function(e) {
  const reader = new FileReader();
  reader.onload = function(e) {
    const data = new Uint8Array(e.target.result);
    const workbook = XLSX.read(data, {type: 'array'});
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    dataExcel = XLSX.utils.sheet_to_json(sheet);
    alert("Database berhasil diupload! Baris: " + dataExcel.length);
  };
  reader.readAsArrayBuffer(e.target.files[0]);
});

function searchPLU() {
  const input = document.getElementById('searchInput').value.trim();
  const result = dataExcel.find(row => row.PLU == input || row.BARCODE == input);
  const resultDiv = document.getElementById('result');

  if (result) {
    resultDiv.innerHTML = `
      <strong>Deskripsi:</strong> ${result.DESC}<br>
      <strong>SUPCO:</strong> ${result.SUPCO}<br>
      <strong>Supplier:</strong> ${result.SUPPLIER}<br>
      <strong>KDSB:</strong> ${result.KDSB}<br>
      <strong>COVERAGE:</strong> ${result.COVERAGE}<br>
      <strong>TAG:</strong> ${result.TAG}<br>
      <strong>PTAG:</strong> ${formatTanggal(result.PTAG)}<br>
      <strong>STOK_02:</strong> ${result.STOK_02}
    `;
  } else {
    resultDiv.innerHTML = "Data tidak ditemukan.";
  }
}

function formatTanggal(nilai) {
  if (typeof nilai === 'number') {
    // Excel date serial (misal: 45123)
    const excelEpoch = new Date(Date.UTC(1899, 11, 30));
    const result = new Date(excelEpoch.getTime() + nilai * 86400000);
    return formatDateObj(result);
  }

  if (typeof nilai === 'string' && /^\d{1,2}\/\d{1,2}\/\d{4}$/.test(nilai)) {
    // Pecah manual dd/mm/yyyy atau mm/dd/yyyy
    const parts = nilai.split('/');
    const day = parseInt(parts[0]);
    const month = parseInt(parts[1]) - 1; // 0-indexed
    const year = parseInt(parts[2]);
    const date = new Date(year, month, day);
    return formatDateObj(date);
  }

  const tryDate = new Date(nilai);
  return isNaN(tryDate) ? nilai : formatDateObj(tryDate);
}

function formatDateObj(date) {
  const options = { day: '2-digit', month: 'short', year: 'numeric' };
  return date.toLocaleDateString('en-GB', options).replace(/ /g, '-');
}
