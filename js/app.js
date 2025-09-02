$(document).ready(function () {
  // Set today's date as default (Thailand timezone)
  const today = new Date().toLocaleDateString("en-CA"); // YYYY-MM-DD format
  $("#expenseDate").val(today);

  // Load initial data
  loadData();
  loadCategories();

  // Apply default filter for transaction history
  setTimeout(() => {
    filterOlderTransactions("week");
  }, 100);

  // Event listeners
  $("#addExpensesBtn").click(addExpense);
  $("#download").click(downloadCSV);

  // Form submission on Enter key
  $("#expenseForm").on("keypress", function (e) {
    if (e.which === 13) {
      e.preventDefault();
      addExpense();
    }
  });

  // Keyboard shortcut for category selection
  $(document).on("keydown", function (e) {
    // Check if "/" key is pressed and no input is focused
    if (e.key === "/" && !$(e.target).is("input, textarea, select")) {
      e.preventDefault();
      $("#category").focus();
      // Open the category dropdown
      $("#category").trigger("click");
    }
  });

  function loadCategories() {
    const categories = [
      "Meals",
      "Groceries",
      "Transportation",
      "Entertainment",
      "Shopping",
      "Bills",
      "Healthcare",
      "Education",
      "Restaurant",
      "Coffee",
      "Snacks",
      "Other",
    ];

    const select = $("#category");
    categories.forEach((category) => {
      select.append(`<option value="${category}">${category}</option>`);
    });
  }

  function addExpense() {
    const date = $("#expenseDate").val();
    const category = $("#category").val();
    const details = $("#details").val();
    const amount = $("#expenseAmount").val();

    if (!date || !category || !details || !amount) {
      showError("Please fill in all fields");
      return;
    }

    if (amount <= 0) {
      showError("Amount must be greater than 0");
      return;
    }

    // Ensure amount is a whole number
    if (!Number.isInteger(parseFloat(amount))) {
      showError("Amount must be a whole number");
      return;
    }

    // Show loading state
    const btn = $("#addExpensesBtn");
    const originalText = btn.html();
    btn.html(
      '<svg class="animate-spin" width="20" height="20" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none" stroke-dasharray="31.416" stroke-dashoffset="31.416"></circle></svg> Adding...'
    );
    btn.prop("disabled", true);

    $.ajax({
      url: "api/add_transaction.php",
      method: "POST",
      data: {
        date: date,
        category: category,
        details: details,
        amount: amount,
      },
      dataType: "json",
      success: function (result) {
        if (result.success) {
          showSuccess("Expense added successfully!");
          resetForm();
          refreshTransactionsOnly();
        } else {
          showError(result.message || "Failed to add expense");
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
    const today = new Date().toLocaleDateString("en-CA"); // YYYY-MM-DD format
    $("#expenseDate").val(today);
    $("#category").val("");
    $("#details").val("");
    $("#expenseAmount").val("");

    // Unfocus all input fields
    $("#expenseDate, #category, #details, #expenseAmount").blur();
  }

  function loadData() {
    $.ajax({
      url: "api/expense_table.php",
      method: "GET",
      dataType: "json",
      success: function (data) {
        if (data.success) {
          displayTransactions(data.transactions);
          updateStats(data.transactions);
        } else {
          showError("Failed to load transactions");
        }
      },
      error: function () {
        showError("Failed to load data");
      },
    });
  }

  function refreshTransactionsOnly() {
    $.ajax({
      url: "api/expense_table.php",
      method: "GET",
      dataType: "json",
      success: function (data) {
        if (data.success) {
          displayTransactions(data.transactions);
          updateStats(data.transactions);
        }
      },
      error: function () {
        // Silent error - don't show error message for refresh
      },
    });
  }

  // Global variables for pagination
  let allTransactions = [];
  let originalTransactions = []; // Keep original data for filtering
  let currentPage = 1;
  const transactionsPerPage = 30;

  function displayTransactions(transactions) {
    const recentContainer = $("#groupedTransactions");
    const olderContainer = $("#olderTransactions");

    recentContainer.empty();
    olderContainer.empty();

    // Store all transactions globally for pagination
    allTransactions = transactions;
    // Store original transactions for filtering (only if not already stored)
    if (originalTransactions.length === 0) {
      originalTransactions = [...transactions];
    }

    if (!transactions || transactions.length === 0) {
      recentContainer.html(
        '<div style="text-align: center; padding: 2rem; color: rgba(255,255,255,0.6);">No transactions yet</div>'
      );
      olderContainer.html(
        '<div style="text-align: center; padding: 2rem; color: rgba(255,255,255,0.6);">No older transactions</div>'
      );
      return;
    }

    // Group transactions by date
    const grouped = {};
    transactions.forEach((transaction) => {
      const date = transaction.date;
      if (!grouped[date]) {
        grouped[date] = [];
      }
      grouped[date].push(transaction);
    });

    // Sort dates in descending order
    const sortedDates = Object.keys(grouped).sort(
      (a, b) => new Date(b) - new Date(a)
    );

    // Get today and yesterday dates
    const today = new Date().toLocaleDateString("en-CA");
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toLocaleDateString("en-CA");

    // Separate recent and older transactions
    const recentDates = [];
    const olderDates = [];

    sortedDates.forEach((date) => {
      if (date === today || date === yesterdayStr) {
        recentDates.push(date);
      } else {
        olderDates.push(date);
      }
    });

    // Display recent transactions (today and yesterday)
    displayRecentTransactions(recentDates, grouped, recentContainer);

    // Display older transactions with pagination
    displayOlderTransactions(olderDates, grouped, olderContainer);
  }

  function displayRecentTransactions(dates, grouped, container) {
    dates.forEach((date) => {
      const dayTransactions = grouped[date];
      const total = dayTransactions.reduce(
        (sum, t) => sum + parseFloat(t.amount),
        0
      );

      const groupHtml = `
        <div class="transaction-group">
          <div class="group-header">
            <div class="group-date">${formatDate(date)}</div>
            <div class="group-total">${Math.round(total)} THB</div>
          </div>
          ${dayTransactions
            .map(
              (transaction) => `
              <div class="transaction-item" data-id="${transaction.trans_id}">
                <div class="transaction-content">
                  <div class="transaction-details">
                    <div class="transaction-info">
                      <div class="transaction-category">${
                        transaction.category
                      }</div>
                      <div class="transaction-description">${
                        transaction.details
                      }</div>
                    </div>
                    <div class="transaction-amount">${Math.round(
                      parseFloat(transaction.amount)
                    )} THB</div>
                  </div>
                </div>
                <div class="delete-button" data-id="${transaction.trans_id}">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2M10 11v6M14 11v6"/>
                  </svg>
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

  function displayOlderTransactions(dates, grouped, container) {
    if (dates.length === 0) {
      container.html(
        '<div style="text-align: center; padding: 2rem; color: rgba(255,255,255,0.6);">No older transactions</div>'
      );
      return;
    }

    // Reset pagination
    currentPage = 1;

    // Show first 30 days
    const datesToShow = dates.slice(0, transactionsPerPage);
    const hasMore = dates.length > transactionsPerPage;

    datesToShow.forEach((date) => {
      const dayTransactions = grouped[date];
      const total = dayTransactions.reduce(
        (sum, t) => sum + parseFloat(t.amount),
        0
      );

      const groupHtml = `
        <div class="transaction-group collapsed">
          <div class="group-header dropdown-header" data-date="${date}">
            <div class="group-date">${formatDate(date)}</div>
            <div class="group-total">${Math.round(total)} THB</div>
          </div>
          <div class="dropdown-content" data-date="${date}" style="display: none;">
            ${dayTransactions
              .map(
                (transaction) => `
                <div class="transaction-item" data-id="${transaction.trans_id}">
                  <div class="transaction-content">
                    <div class="transaction-details">
                      <div class="transaction-info">
                        <div class="transaction-category">${
                          transaction.category
                        }</div>
                        <div class="transaction-description">${
                          transaction.details
                        }</div>
                      </div>
                      <div class="transaction-amount">${Math.round(
                        parseFloat(transaction.amount)
                      )} THB</div>
                    </div>
                  </div>
                </div>
              `
              )
              .join("")}
          </div>
        </div>
      `;
      container.append(groupHtml);
    });

    // Add Load More button if there are more transactions
    if (hasMore) {
      const loadMoreHtml = `
        <div class="load-more-container" style="text-align: center; margin-top: 2rem;">
          <button class="btn btn-secondary" id="loadMoreBtn">
            Load More Transactions
            <span id="remainingCount">(${
              dates.length - transactionsPerPage
            } more)</span>
          </button>
        </div>
      `;
      container.append(loadMoreHtml);
    }
  }

  // Use event delegation for dynamically added elements
  $(document).on("click", ".dropdown-header", function () {
    const date = $(this).data("date");
    const content = $(`.dropdown-content[data-date="${date}"]`);
    const header = $(this);

    if (content.is(":visible")) {
      content.hide();
      header.closest(".transaction-group").addClass("collapsed");
    } else {
      content.show();
      header.closest(".transaction-group").removeClass("collapsed");
    }
  });

  // Initialize swipe functionality for transaction items
  initializeSwipeToDelete();

  function initializeSwipeToDelete() {
    // Remove any existing event handlers to prevent duplicates
    $(document).off("dblclick", ".transaction-item");
    $(document).off("click", ".delete-button");

    // Show delete button on double click for desktop only
    $(document).on("dblclick", ".transaction-item", function (e) {
      const $item = $(this);

      // Hide all other delete buttons
      $(".transaction-item").not($item).removeClass("show-delete");

      // Toggle current item's delete button
      if ($item.hasClass("show-delete")) {
        $item.removeClass("show-delete");
      } else {
        $item.addClass("show-delete");
      }

      e.preventDefault();
    });

    // Hide delete button when clicking outside
    $(document).on("click", function (e) {
      if (!$(e.target).closest(".transaction-item").length) {
        $(".transaction-item").removeClass("show-delete");
      }
    });

    // Delete button click handler
    $(document).on("click", ".delete-button", function (e) {
      e.stopPropagation();
      const transactionId = $(this).data("id");
      deleteTransaction(transactionId);
    });
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

    // Add to container first
    toastContainer.appendChild(toastElement);

    // Add close functionality
    const closeBtn = toastElement.querySelector(".toast-close");
    if (closeBtn) {
      closeBtn.addEventListener("click", () => {
        toastElement.remove();
      });
    }

    // Show the toast
    try {
      const toast = new Toast(toastElement);
      toast.show();
    } catch (error) {
      console.error("Error creating toast:", error);
      // Fallback: manually show the toast
      toastElement.style.display = "flex";
      toastElement.offsetHeight; // Trigger reflow
      toastElement.classList.add("show");

      // Auto-hide after 5 seconds
      setTimeout(() => {
        toastElement.classList.remove("show");
        setTimeout(() => {
          if (toastElement.parentNode) {
            toastElement.parentNode.removeChild(toastElement);
          }
        }, 300);
      }, 5000);
    }
  }

  function deleteTransaction(transactionId) {
    if (confirm("Are you sure you want to delete this transaction?")) {
      $.ajax({
        url: "api/delete_transaction.php",
        type: "POST",
        data: { id: transactionId },
        dataType: "json",
        success: function (response) {
          if (response.success) {
            showToast("Transaction deleted successfully", "success");
            refreshTransactionsOnly();
          } else {
            showToast(
              response.message || "Failed to delete transaction",
              "error"
            );
          }
        },
        error: function () {
          showToast("Error deleting transaction", "error");
        },
      });
    }
  }

  function updateStats(transactions) {
    if (!transactions || transactions.length === 0) {
      $("#daily").text("0");
      $("#monthly").text("0");
      $("#total_expenses").text("0");
      $("#daily_change").text("0");
      $("#daily_change_indicator")
        .text("THB")
        .removeClass("increase decrease no-change");
      return;
    }

    const today = new Date().toLocaleDateString("en-CA"); // YYYY-MM-DD format
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toLocaleDateString("en-CA");

    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    const daily = transactions
      .filter((t) => t.date === today)
      .reduce((sum, t) => sum + parseFloat(t.amount), 0);

    const yesterdayTotal = transactions
      .filter((t) => t.date === yesterdayStr)
      .reduce((sum, t) => sum + parseFloat(t.amount), 0);

    const monthly = transactions
      .filter((t) => {
        const date = new Date(t.date);
        return (
          date.getMonth() === currentMonth && date.getFullYear() === currentYear
        );
      })
      .reduce((sum, t) => sum + parseFloat(t.amount), 0);

    const total = transactions.reduce(
      (sum, t) => sum + parseFloat(t.amount),
      0
    );

    // Calculate daily change
    const dailyChange = daily - yesterdayTotal;
    const dailyChangeElement = $("#daily_change");
    const dailyChangeIndicator = $("#daily_change_indicator");

    dailyChangeElement.text(Math.abs(Math.round(dailyChange)));

    // Update indicator with color and text
    dailyChangeIndicator.removeClass("increase decrease no-change");

    if (dailyChange > 0) {
      dailyChangeIndicator.html("↗ + THB").addClass("increase");
    } else if (dailyChange < 0) {
      dailyChangeIndicator.html("↘ - THB").addClass("decrease");
    } else {
      dailyChangeIndicator.html("→ THB").addClass("no-change");
    }

    $("#daily").text(Math.round(daily));
    $("#monthly").text(Math.round(monthly));
    $("#total_expenses").text(Math.round(total));
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

  function downloadCSV() {
    $.ajax({
      url: "api/expense_data.php",
      method: "GET",
      dataType: "json",
      success: function (data) {
        if (data.success && data.transactions) {
          const csv = convertToCSV(data.transactions);
          downloadFile(csv, "expenses.csv", "text/csv");
          showSuccess("CSV downloaded successfully!");
        } else {
          showError("No data to download");
        }
      },
      error: function () {
        showError("Failed to download data");
      },
    });
  }

  function convertToCSV(transactions) {
    const headers = ["Date", "Category", "Details", "Amount"];
    const csvContent = [
      headers.join(","),
      ...transactions.map((t) =>
        [t.date, `"${t.category}"`, `"${t.details}"`, t.amount].join(",")
      ),
    ].join("\n");

    return csvContent;
  }

  function downloadFile(content, fileName, contentType) {
    const blob = new Blob([content], { type: contentType });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }

  function showSuccess(message) {
    showToast(message, "success");
  }

  function showError(message) {
    showToast(message, "error");
  }

  // Handle history date range filter
  $("#historyDateRange").change(function () {
    const selectedRange = $(this).val();
    filterOlderTransactions(selectedRange);
  });

  function filterOlderTransactions(range) {
    if (!originalTransactions || originalTransactions.length === 0) {
      return;
    }

    let filteredTransactions = originalTransactions;

    if (range !== "all") {
      const days =
        range === "week"
          ? 7
          : range === "month"
          ? 30
          : range === "quarter"
          ? 90
          : 0;
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);

      filteredTransactions = originalTransactions.filter((transaction) => {
        const transactionDate = new Date(transaction.date);
        return transactionDate >= cutoffDate;
      });
    }

    // Re-display transactions with the filtered data
    displayTransactions(filteredTransactions);
  }

  // Handle Load More button
  $(document).on("click", "#loadMoreBtn", function () {
    loadMoreTransactions();
  });

  function loadMoreTransactions() {
    // Get all transactions and group them by date
    const grouped = {};
    originalTransactions.forEach((transaction) => {
      const date = transaction.date;
      if (!grouped[date]) {
        grouped[date] = [];
      }
      grouped[date].push(transaction);
    });

    // Sort dates in descending order
    const sortedDates = Object.keys(grouped).sort(
      (a, b) => new Date(b) - new Date(a)
    );

    // Get today and yesterday dates
    const today = new Date().toLocaleDateString("en-CA");
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toLocaleDateString("en-CA");

    // Get older dates (excluding today and yesterday)
    const olderDates = sortedDates.filter(
      (date) => date !== today && date !== yesterdayStr
    );

    // Calculate how many more to show
    const currentlyShowing = currentPage * transactionsPerPage;
    const nextBatch = olderDates.slice(
      currentlyShowing,
      currentlyShowing + transactionsPerPage
    );
    const remaining =
      olderDates.length - currentlyShowing - transactionsPerPage;

    // Add the next batch of transactions
    nextBatch.forEach((date) => {
      const dayTransactions = grouped[date];
      const total = dayTransactions.reduce(
        (sum, t) => sum + parseFloat(t.amount),
        0
      );

      const groupHtml = `
        <div class="transaction-group collapsed">
          <div class="group-header dropdown-header" data-date="${date}">
            <div class="group-date">${formatDate(date)}</div>
            <div class="group-total">${Math.round(total)} THB</div>
          </div>
          <div class="dropdown-content" data-date="${date}" style="display: none;">
            ${dayTransactions
              .map(
                (transaction) => `
                <div class="transaction-item" data-id="${transaction.trans_id}">
                  <div class="transaction-content">
                    <div class="transaction-details">
                      <div class="transaction-info">
                        <div class="transaction-category">${
                          transaction.category
                        }</div>
                        <div class="transaction-description">${
                          transaction.details
                        }</div>
                      </div>
                      <div class="transaction-amount">${Math.round(
                        parseFloat(transaction.amount)
                      )} THB</div>
                    </div>
                  </div>
                </div>
              `
              )
              .join("")}
          </div>
        </div>
      `;

      // Insert before the Load More button
      $("#loadMoreBtn").parent().before(groupHtml);
    });

    // Update the Load More button or remove it
    if (remaining > 0) {
      $("#remainingCount").text(`(${remaining} more)`);
    } else {
      $("#loadMoreBtn").parent().remove();
    }

    currentPage++;
  }
});
