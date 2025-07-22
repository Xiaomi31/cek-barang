let dataExcel = [];

// Ganti URL ini dengan URL raw GitHub kamu
const excelURL = "https://raw.githubusercontent.com/Xiaomi31/cek-barang/main/barcode.xlsx";

fetch(excelURL)
  .then(response => response.arrayBuffer())
  .then(data => {
    const workbook = XLSX.read(data, { type: "array", cellDates: false });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    dataExcel = XLSX.utils.sheet_to_json(sheet, { raw: true });
    console.log("Database berhasil dimuat dari GitHub! Baris:", dataExcel.length);
  })
  .catch(err => {
    console.error("Gagal ambil file Excel dari GitHub:", err.message);
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
    const excelEpoch = new Date(Date.UTC(1899, 11, 30));
    const result = new Date(excelEpoch.getTime() + nilai * 86400000);
    return formatDateObj(result);
  }

  if (typeof nilai === 'string' && /^\d{1,2}\/\d{1,2}\/\d{4}$/.test(nilai)) {
    const [day, month, year] = nilai.split('/').map(Number);
    const result = new Date(year, month - 1, day);
    return formatDateObj(result);
  }

  const parsedDate = new Date(nilai);
  return isNaN(parsedDate) ? nilai : formatDateObj(parsedDate);
}

function formatDateObj(date) {
  const options = { day: '2-digit', month: 'short', year: 'numeric' };
  return date.toLocaleDateString('en-GB', options).replace(/ /g, '-');
}
