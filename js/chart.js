// Chart.js configuration and data management
class ExpenseCharts {
  constructor() {
    this.pieChart = null;
    this.lineChart = null;
    this.chartData = null;
    this.dateRange = "7";

    this.init();
  }

  init() {
    this.setupEventListeners();
    this.loadChartData();
  }

  setupEventListeners() {
    const dateRangeSelect = document.getElementById("dateRange");
    const refreshButton = document.getElementById("refreshCharts");

    if (dateRangeSelect) {
      // Set the dropdown to match the default date range
      dateRangeSelect.value = this.dateRange;

      dateRangeSelect.addEventListener("change", (e) => {
        this.dateRange = e.target.value;
        this.loadChartData();
      });
    }

    if (refreshButton) {
      refreshButton.addEventListener("click", () => {
        this.loadChartData();
      });
    }
  }

  async loadChartData() {
    this.showLoading(true);

    try {
      const response = await fetch("api/expense_data.php");
      const data = await response.json();

      if (data.success) {
        this.chartData = data;
        this.processData();
        this.renderCharts();
        this.updateSummaryStats();
      } else {
        this.showError("Failed to load chart data: " + data.message);
      }
    } catch (error) {
      console.error("Error loading chart data:", error);
      this.showError("Failed to load chart data. Please try again.");
    } finally {
      this.showLoading(false);
    }
  }

  processData() {
    if (!this.chartData || !this.chartData.transactions) return;

    // Filter transactions based on date range
    const filteredTransactions = this.filterTransactionsByDateRange(
      this.chartData.transactions
    );

    // Process data for pie chart (category split)
    this.pieData = this.processPieChartData(filteredTransactions);

    // Process data for line chart (daily spending trends)
    this.lineData = this.processLineChartData(filteredTransactions);
  }

  filterTransactionsByDateRange(transactions) {
    if (this.dateRange === "all") {
      return transactions;
    }

    const days = parseInt(this.dateRange);
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    return transactions.filter((transaction) => {
      const transactionDate = new Date(transaction.date);
      return transactionDate >= cutoffDate;
    });
  }

  processPieChartData(transactions) {
    const categoryTotals = {};

    transactions.forEach((transaction) => {
      const category = transaction.category || "Uncategorized";
      const amount = parseFloat(transaction.amount) || 0;

      if (categoryTotals[category]) {
        categoryTotals[category] += amount;
      } else {
        categoryTotals[category] = amount;
      }
    });

    const labels = Object.keys(categoryTotals);
    const values = Object.values(categoryTotals);

    return {
      labels: labels,
      values: values,
      total: values.reduce((sum, val) => sum + val, 0),
    };
  }

  processLineChartData(transactions) {
    const dailyTotals = {};

    transactions.forEach((transaction) => {
      const date = transaction.date;
      const amount = parseFloat(transaction.amount) || 0;

      if (dailyTotals[date]) {
        dailyTotals[date] += amount;
      } else {
        dailyTotals[date] = amount;
      }
    });

    // Sort dates and create arrays
    const sortedDates = Object.keys(dailyTotals).sort();
    const dailyAmounts = sortedDates.map((date) => dailyTotals[date]);

    // Calculate running total
    const runningTotal = [];
    let total = 0;
    dailyAmounts.forEach((amount) => {
      total += amount;
      runningTotal.push(total);
    });

    return {
      dates: sortedDates,
      dailyAmounts: dailyAmounts,
      runningTotal: runningTotal,
      totalSpent: total,
      averageDaily: dailyAmounts.length > 0 ? total / dailyAmounts.length : 0,
    };
  }

  renderCharts() {
    this.renderPieChart();
    this.renderLineChart();
  }

  renderPieChart() {
    const ctx = document.getElementById("pieChart");
    if (!ctx || !this.pieData) return;

    // Destroy existing chart
    if (this.pieChart) {
      this.pieChart.destroy();
    }

    // Generate colors for categories
    const colors = this.generateColors(this.pieData.labels.length);

    this.pieChart = new Chart(ctx, {
      type: "doughnut",
      data: {
        labels: this.pieData.labels,
        datasets: [
          {
            data: this.pieData.values,
            backgroundColor: colors.backgrounds,
            borderColor: colors.borders,
            borderWidth: 2,
            hoverOffset: 10,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false, // We'll create custom legend
          },
          tooltip: {
            backgroundColor: "rgba(0, 0, 0, 0.8)",
            titleColor: "#ffffff",
            bodyColor: "#ffffff",
            borderColor: "#667eea",
            borderWidth: 1,
            callbacks: {
              label: function (context) {
                const value = context.parsed;
                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                const percentage = ((value / total) * 100).toFixed(1);
                return `${context.label}: ${value.toFixed(
                  2
                )} THB (${percentage}%)`;
              },
            },
          },
        },
        cutout: "60%",
        animation: {
          animateRotate: true,
          animateScale: true,
          duration: 1000,
        },
      },
    });

    this.renderPieLegend(colors);
  }

  renderLineChart() {
    const ctx = document.getElementById("lineChart");
    if (!ctx || !this.lineData) return;

    // Destroy existing chart
    if (this.lineChart) {
      this.lineChart.destroy();
    }

    this.lineChart = new Chart(ctx, {
      type: "line",
      data: {
        labels: this.lineData.dates.map((date) => this.formatDate(date)),
        datasets: [
          {
            label: "Daily Spending",
            data: this.lineData.dailyAmounts,
            borderColor: "#667eea",
            backgroundColor: "rgba(102, 126, 234, 0.1)",
            borderWidth: 3,
            fill: true,
            tension: 0.4,
            pointBackgroundColor: "#667eea",
            pointBorderColor: "#ffffff",
            pointBorderWidth: 2,
            pointRadius: 6,
            pointHoverRadius: 8,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false,
          },
          tooltip: {
            backgroundColor: "rgba(0, 0, 0, 0.8)",
            titleColor: "#ffffff",
            bodyColor: "#ffffff",
            borderColor: "#667eea",
            borderWidth: 1,
            callbacks: {
              label: function (context) {
                return `Spent: ${context.parsed.y.toFixed(2)} THB`;
              },
            },
          },
        },
        scales: {
          x: {
            grid: {
              color: "rgba(255, 255, 255, 0.1)",
              drawBorder: false,
            },
            ticks: {
              color: "rgba(255, 255, 255, 0.7)",
              maxTicksLimit: 8,
            },
          },
          y: {
            grid: {
              color: "rgba(255, 255, 255, 0.1)",
              drawBorder: false,
            },
            ticks: {
              color: "rgba(255, 255, 255, 0.7)",
              callback: function (value) {
                return value.toFixed(0);
              },
            },
          },
        },
        animation: {
          duration: 1000,
          easing: "easeInOutQuart",
        },
      },
    });

    this.renderLineStats();
  }

  renderPieLegend(colors) {
    const legendContainer = document.getElementById("pieLegend");
    if (!legendContainer || !this.pieData) return;

    legendContainer.innerHTML = "";

    this.pieData.labels.forEach((label, index) => {
      const value = this.pieData.values[index];
      const percentage = ((value / this.pieData.total) * 100).toFixed(1);

      const legendItem = document.createElement("div");
      legendItem.className = "legend-item";
      legendItem.innerHTML = `
                <div class="legend-color" style="background-color: ${
                  colors.backgrounds[index]
                }"></div>
                <span class="legend-label">${label}</span>
                <span class="legend-value">${value.toFixed(
                  2
                )} THB (${percentage}%)</span>
            `;

      legendContainer.appendChild(legendItem);
    });
  }

  renderLineStats() {
    const statsContainer = document.getElementById("lineStats");
    if (!statsContainer || !this.lineData) return;

    statsContainer.innerHTML = `
            <div class="stat-item">
                <div class="stat-label">Total Spent</div>
                <div class="stat-value">${this.lineData.totalSpent.toFixed(
                  2
                )} THB</div>
            </div>
            <div class="stat-item">
                <div class="stat-label">Daily Average</div>
                <div class="stat-value">${this.lineData.averageDaily.toFixed(
                  2
                )} THB</div>
            </div>
        `;
  }

  updateSummaryStats() {
    const summaryContainer = document.getElementById("summaryStats");
    if (!summaryContainer || !this.pieData || !this.lineData) return;

    const totalCategories = this.pieData.labels.length;
    const mostExpensiveCategory =
      this.pieData.labels[
        this.pieData.values.indexOf(Math.max(...this.pieData.values))
      ];
    const mostExpensiveAmount = Math.max(...this.pieData.values);

    summaryContainer.innerHTML = `
            <div class="summary-card">
                <div class="summary-title">Total Categories</div>
                <div class="summary-value">${totalCategories}</div>
                <div class="summary-description">Different spending categories</div>
            </div>
            <div class="summary-card">
                <div class="summary-title">Most Expensive</div>
                <div class="summary-value">${mostExpensiveAmount.toFixed(
                  2
                )}</div>
                <div class="summary-description">${mostExpensiveCategory} category</div>
            </div>
            <div class="summary-card">
                <div class="summary-title">Total Spent</div>
                <div class="summary-value">${this.lineData.totalSpent.toFixed(
                  2
                )}</div>
                <div class="summary-description">THB in selected period</div>
            </div>
            <div class="summary-card">
                <div class="summary-title">Daily Average</div>
                <div class="summary-value">${this.lineData.averageDaily.toFixed(
                  2
                )}</div>
                <div class="summary-description">THB per day</div>
            </div>
        `;
  }

  generateColors(count) {
    const baseColors = [
      "#667eea",
      "#764ba2",
      "#f093fb",
      "#f5576c",
      "#4facfe",
      "#00f2fe",
      "#43e97b",
      "#38f9d7",
      "#ffecd2",
      "#fcb69f",
      "#a8edea",
      "#fed6e3",
      "#d299c2",
      "#fef9d7",
      "#89f7fe",
      "#66a6ff",
    ];

    const backgrounds = [];
    const borders = [];

    for (let i = 0; i < count; i++) {
      const color = baseColors[i % baseColors.length];
      backgrounds.push(color);
      borders.push(this.lightenColor(color, 20));
    }

    return { backgrounds, borders };
  }

  lightenColor(color, percent) {
    const num = parseInt(color.replace("#", ""), 16);
    const amt = Math.round(2.55 * percent);
    const R = (num >> 16) + amt;
    const G = ((num >> 8) & 0x00ff) + amt;
    const B = (num & 0x0000ff) + amt;
    return (
      "#" +
      (
        0x1000000 +
        (R < 255 ? (R < 1 ? 0 : R) : 255) * 0x10000 +
        (G < 255 ? (G < 1 ? 0 : G) : 255) * 0x100 +
        (B < 255 ? (B < 1 ? 0 : B) : 255)
      )
        .toString(16)
        .slice(1)
    );
  }

  formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  }

  showLoading(show) {
    const overlay = document.getElementById("loadingOverlay");
    if (overlay) {
      if (show) {
        overlay.classList.add("show");
      } else {
        overlay.classList.remove("show");
      }
    }
  }

  showError(message) {
    console.error(message);
    // You could implement a toast notification here
    alert(message);
  }
}

// Initialize charts when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  window.chartsInstance = new ExpenseCharts();
});
