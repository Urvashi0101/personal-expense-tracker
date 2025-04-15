let expenses = JSON.parse(localStorage.getItem("expenses")) || [];
const expenseForm = document.getElementById("expense-form");
const expenseTable = document.getElementById("expense-table");
const totalDisplay = document.getElementById("total");
const grandTotalDisplay = document.getElementById("grand-total");
const chartCanvas = document.getElementById("expense-chart");
const categoryFilter = document.getElementById("filter-category-dropdown");
const monthFilter = document.getElementById("filter-month");
const yearFilter = document.getElementById("filter-year");

let chart;

function saveExpenses() {
  localStorage.setItem("expenses", JSON.stringify(expenses));
}

function addExpenseToTable(expense, index) {
  const row = document.createElement("tr");
  row.innerHTML = `
    <td>${expense.date}</td>
    <td>${expense.category}</td>
    <td>₹${expense.amount}</td>
    <td>${expense.description || "-"}</td>
    <td><button class="btn btn-sm btn-danger" onclick="deleteExpense(${index})">Delete</button></td>
  `;
  expenseTable.appendChild(row);
}

function populateFilters() {
  const categories = [...new Set(expenses.map(e => e.category))];
  const months = [...new Set(expenses.map(e => new Date(e.date).getMonth() + 1))];
  const years = [...new Set(expenses.map(e => new Date(e.date).getFullYear()))];

  categoryFilter.innerHTML = '<option value="">All Categories</option>' + categories.map(c => `<option value="${c}">${c}</option>`).join("");
  monthFilter.innerHTML = '<option value="">All Months</option>' + months.map(m => `<option value="${m}">${m}</option>`).join("");
  yearFilter.innerHTML = '<option value="">All Years</option>' + years.map(y => `<option value="${y}">${y}</option>`).join("");
}

function updateTableAndTotal() {
  expenseTable.innerHTML = "";
  const filtered = getFilteredExpenses();
  filtered.forEach(addExpenseToTable);

  const filteredTotal = filtered.reduce((sum, e) => sum + parseFloat(e.amount), 0);
  const grandTotal = expenses.reduce((sum, e) => sum + parseFloat(e.amount), 0);

  totalDisplay.textContent = filteredTotal;
  grandTotalDisplay.textContent = grandTotal;

  updateChart(filtered);
}

function getFilteredExpenses() {
  const categoryVal = categoryFilter.value;
  const monthVal = monthFilter.value;
  const yearVal = yearFilter.value;

  return expenses.filter(e => {
    const d = new Date(e.date);
    return (
      (!categoryVal || e.category === categoryVal) &&
      (!monthVal || d.getMonth() + 1 === +monthVal) &&
      (!yearVal || d.getFullYear() === +yearVal)
    );
  });
}

function updateChart(data) {
  const grouped = {};
  data.forEach(e => {
    grouped[e.category] = (grouped[e.category] || 0) + parseFloat(e.amount);
  });

  const labels = Object.keys(grouped);
  const values = Object.values(grouped);

  if (chart) chart.destroy();
  chart = new Chart(chartCanvas, {
    type: "doughnut",
    data: {
      labels,
      datasets: [{
        data: values,
        backgroundColor: [
          "#007bff", "#28a745", "#dc3545", "#ffc107", "#17a2b8",
          "#6f42c1", "#fd7e14", "#20c997"
        ],
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: 'bottom'
        }
      }
    }
  });
}

function deleteExpense(index) {
  expenses.splice(index, 1);
  saveExpenses();
  populateFilters();
  updateTableAndTotal();
}

expenseForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const newExpense = {
    date: document.getElementById("date").value,
    category: document.getElementById("category").value.trim(),
    amount: document.getElementById("amount").value,
    description: document.getElementById("description").value.trim(),
  };

  expenses.push(newExpense);
  saveExpenses();
  expenseForm.reset();
  populateFilters();
  updateTableAndTotal();
});

[categoryFilter, monthFilter, yearFilter].forEach(el => el.addEventListener("change", updateTableAndTotal));

// Initial load
populateFilters();
updateTableAndTotal();
