$(document).ready(function () {
  // Set today's date as default (Thailand timezone)
  const today = new Date().toLocaleDateString("en-CA"); // YYYY-MM-DD format
  $("#allowanceDate").val(today);

  // Load initial data
  loadData();

  // Event listeners
  $("#addAllowanceBtn").click(addAllowance);

  // Form submission on Enter key
  $("#allowanceForm").on("keypress", function (e) {
    if (e.which === 13) {
      e.preventDefault();
      addAllowance();
    }
  });

  function addAllowance() {
    const date = $("#allowanceDate").val();
    const amountMMK = $("#amountMMK").val();
    const currencyRate = $("#currencyRate").val();
    const transferBy = $("#transferBy").val();

    if (!date || !amountMMK || !currencyRate || !transferBy) {
      showError("Please fill in all fields");
      return;
    }

    if (amountMMK <= 0) {
      showError("Amount must be greater than 0");
      return;
    }

    if (currencyRate <= 0) {
      showError("Currency rate must be greater than 0");
      return;
    }

    // Ensure amounts are whole numbers
    if (!Number.isInteger(parseFloat(amountMMK))) {
      showError("MMK amount must be a whole number");
      return;
    }

    if (!Number.isInteger(parseFloat(currencyRate))) {
      showError("Currency rate must be a whole number");
      return;
    }

    // Calculate total in THB
    // First divide MMK by 100,000, then multiply by rate
    const totalTHB = (
      (parseFloat(amountMMK) / 100000) *
      parseFloat(currencyRate)
    ).toFixed(2);

    // Show loading state
    const btn = $("#addAllowanceBtn");
    const originalText = btn.html();
    btn.html(
      '<svg class="animate-spin" width="20" height="20" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none" stroke-dasharray="31.416" stroke-dashoffset="31.416"></circle></svg> Adding...'
    );
    btn.prop("disabled", true);

    $.ajax({
      url: "api/add_allowance.php",
      method: "POST",
      data: {
        date: date,
        amount_mmk: amountMMK,
        currency_rate: currencyRate,
        total_bhat: totalTHB,
        transfer_by: transferBy,
      },
      dataType: "json",
      success: function (result) {
        if (result.success) {
          showSuccess("Allowance added successfully!");
          resetForm();
          loadData();
        } else {
          showError(result.message || "Failed to add allowance");
        }
      },
      error: function () {
        showError("Network error. Please try again.");
      },
      complete: function () {
        btn.html(originalText);
        btn.prop("disabled", false);
      },
    });
  }

  function resetForm() {
    $("#allowanceDate").val(today);
    $("#amountMMK").val("");
    $("#currencyRate").val("");
    $("#transferBy").val("");

    // Unfocus all input fields
    $("#allowanceDate, #amountMMK, #currencyRate, #transferBy").blur();
  }

  function loadData() {
    $.ajax({
      url: "api/allowance_table.php",
      method: "GET",
      dataType: "json",
      success: function (data) {
        if (data.success) {
          displayAllowanceHistory(data.allowances);
          updateStats(data.allowances);
        } else {
          showError("Failed to load allowance data");
        }
      },
      error: function () {
        showError("Failed to load data");
      },
    });
  }

  function displayAllowanceHistory(allowances) {
    const container = $("#allowanceHistory");
    container.empty();

    if (!allowances || allowances.length === 0) {
      container.html(
        '<div style="text-align: center; padding: 2rem; color: rgba(255,255,255,0.6);">No allowance records yet</div>'
      );
      return;
    }

    // Sort by date (newest first)
    const sortedAllowances = allowances.sort(
      (a, b) => new Date(b.date) - new Date(a.date)
    );

    // Group by date
    const grouped = {};
    sortedAllowances.forEach((allowance) => {
      const date = allowance.date;
      if (!grouped[date]) {
        grouped[date] = [];
      }
      grouped[date].push(allowance);
    });

    // Display grouped allowances
    Object.keys(grouped).forEach((date) => {
      const dayAllowances = grouped[date];
      const total = dayAllowances.reduce(
        (sum, a) => sum + parseFloat(a.total_bhat),
        0
      );

      const groupHtml = `
                <div class="transaction-group">
                    <div class="group-header">
                        <div class="group-date">${formatDate(date)}</div>
                        <div class="group-total">${Math.round(total)} THB</div>
                    </div>
                    ${dayAllowances
                      .map(
                        (allowance) => `
                        <div class="transaction-item allowance">
                            <div class="transaction-details">
                                <div class="transaction-info">
                                    <div class="transaction-category">${
                                      allowance.transfer_by
                                    }</div>
                                    <div class="transaction-description">
                                        ${parseInt(
                                          allowance.amount_mmk
                                        ).toLocaleString()} MMK @ ${Math.round(
                          parseFloat(allowance.currency_rate)
                        )} rate
                                    </div>
                                </div>
                                <div class="transaction-amount">${Math.round(
                                  parseFloat(allowance.total_bhat)
                                )} THB</div>
                            </div>
                        </div>
                    `
                      )
                      .join("")}
                </div>
            `;

      container.append(groupHtml);
    });
  }

  function updateStats(allowances) {
    if (!allowances || allowances.length === 0) {
      $("#totalAllowance").text("0");
      $("#totalAllowanceMMK").text("0");
      $("#monthlyAllowance").text("0");
      $("#totalTransfers").text("0");
      return;
    }

    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    const total = allowances.reduce(
      (sum, a) => sum + parseFloat(a.total_bhat),
      0
    );

    const totalMMK = allowances.reduce(
      (sum, a) => sum + parseFloat(a.amount_mmk),
      0
    );

    const monthly = allowances
      .filter((a) => {
        const date = new Date(a.date);
        return (
          date.getMonth() === currentMonth && date.getFullYear() === currentYear
        );
      })
      .reduce((sum, a) => sum + parseFloat(a.total_bhat), 0);

    const totalTransfers = allowances.length;

    $("#totalAllowance").text(Math.round(total));
    $("#totalAllowanceMMK").text(Math.round(totalMMK));
    $("#monthlyAllowance").text(Math.round(monthly));
    $("#totalTransfers").text(totalTransfers);
  }

  function formatDate(dateString) {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return "Today";
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Yesterday";
    } else {
      return date.toLocaleDateString("en-GB", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    }
  }

  function showSuccess(message) {
    showToast(message, "success");
  }

  function showError(message) {
    showToast(message, "error");
  }

  function showToast(message, type = "success") {
    // Create or get toast container
    let toastContainer = document.querySelector(".toast-container");
    if (!toastContainer) {
      toastContainer = document.createElement("div");
      toastContainer.className = "toast-container";
      document.body.appendChild(toastContainer);
    }

    // Create toast element
    const toastElement = document.createElement("div");
    toastElement.className = `toast ${type}`;

    // Create toast content
    const iconSvg =
      type === "success"
        ? '<svg class="toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>'
        : '<svg class="toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>';

    toastElement.innerHTML = `
      ${iconSvg}
      <div class="toast-message">${message}</div>
      <button class="toast-close">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M18 6L6 18M6 6l12 12" />
        </svg>
      </button>
    `;

    // Add close functionality
    const closeBtn = toastElement.querySelector(".toast-close");
    closeBtn.addEventListener("click", () => {
      toastElement.remove();
    });

    // Add to container
    toastContainer.appendChild(toastElement);

    // Show the toast
    const toast = new Toast(toastElement);
    toast.show();
  }
});
