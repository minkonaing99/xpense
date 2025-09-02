$(document).ready(function () {
  const keyModal = new Modal(document.getElementById("keyModal"));

  // Check if user already has access via cookie
  checkAccessStatus();

  // Handle key submission
  $("#submitKey").click(function () {
    const key = $("#keyInput").val().trim();

    if (!key) {
      showError("Please enter an access key");
      return;
    }

    // Show loading state
    const btn = $(this);
    const originalText = btn.text();
    btn.text("Verifying...");
    btn.prop("disabled", true);

    $.ajax({
      url: "api/key.php",
      method: "POST",
      data: { key: key },
      dataType: "json",
      success: function (result) {
        if (result.success) {
          showSuccess("Access granted! Welcome to Xpenses.");
          setTimeout(() => {
            keyModal.hide();
            $("#mainContent").show();
            // Trigger fade-in animation
            $("#mainContent").addClass("fade-in-up");
            // Trigger data loading after access is granted
            triggerDataLoading();
          }, 1000);
        } else {
          showError(result.message || "Invalid access key");
        }
      },
      error: function () {
        showError("Network error. Please try again.");
      },
      complete: function () {
        btn.text(originalText);
        btn.prop("disabled", false);
      },
    });
  });

  // Handle Enter key press
  $("#keyInput").keypress(function (e) {
    if (e.which === 13) {
      e.preventDefault();
      $("#submitKey").click();
    }
  });

  function checkAccessStatus() {
    console.log("Checking access status...");
    $.ajax({
      url: "api/key.php",
      method: "POST",
      data: { key: "" }, // Empty key to trigger cookie check
      dataType: "json",
      success: function (result) {
        console.log("Access check result:", result);
        if (result.success) {
          console.log("Access granted, showing content...");
          // User already has access, show main content
          $("#mainContent").show();
          $("#mainContent").addClass("fade-in-up");
          // Trigger data loading after access is confirmed
          triggerDataLoading();
        } else {
          console.log("Access denied, showing key modal...");
          // User needs to enter key, show modal
          keyModal.show();
        }
      },
      error: function (xhr, status, error) {
        console.log("Access check error:", error);
        // On error, show modal as fallback
        keyModal.show();
      },
    });
  }

  function triggerDataLoading() {
    console.log("Triggering data loading...");
    // Trigger data loading for different page types
    if (typeof loadData === "function") {
      console.log("Loading main page data...");
      // Main page - load transactions and categories
      loadData();
      loadCategories();
      // Apply default filter for transaction history
      setTimeout(() => {
        filterOlderTransactions("week");
      }, 100);
    }

    if (typeof ExpenseCharts !== "undefined" && window.chartsInstance) {
      console.log("Loading chart data...");
      // Chart page - load chart data
      window.chartsInstance.loadChartData();
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
