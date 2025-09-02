// Modal and Toast functionality
class Modal {
  constructor(element) {
    this.element = element;
    this.backdrop = null;
    this.isShown = false;
    this.init();
  }

  init() {
    // Create backdrop
    this.backdrop = document.createElement("div");
    this.backdrop.className = "modal-backdrop";
    this.backdrop.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.5);
            z-index: 1999;
            opacity: 0;
            transition: opacity 0.3s ease;
        `;

    // Add event listeners
    this.element.addEventListener("click", (e) => {
      if (e.target === this.element) {
        this.hide();
      }
    });

    // Keyboard events
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && this.isShown) {
        this.hide();
      }
    });
  }

  show() {
    if (this.isShown) return;

    this.isShown = true;
    document.body.appendChild(this.backdrop);
    this.element.style.display = "flex";

    // Trigger reflow
    this.element.offsetHeight;

    this.element.classList.add("show");
    this.backdrop.style.opacity = "1";

    // Focus management
    const focusableElements = this.element.querySelectorAll(
      "input, button, select, textarea"
    );
    if (focusableElements.length > 0) {
      focusableElements[0].focus();
    }
  }

  hide() {
    if (!this.isShown) return;

    this.isShown = false;
    this.element.classList.remove("show");
    this.backdrop.style.opacity = "0";

    setTimeout(() => {
      this.element.style.display = "none";
      if (this.backdrop.parentNode) {
        this.backdrop.parentNode.removeChild(this.backdrop);
      }
    }, 300);
  }
}

class Toast {
  constructor(element) {
    this.element = element;
    this.timeout = null;
    this.init();
  }

  init() {
    // Add close button functionality
    const closeBtn = this.element.querySelector(".toast-close");
    if (closeBtn) {
      closeBtn.addEventListener("click", () => {
        this.hide();
      });
    }

    // Auto-hide after 5 seconds
    this.element.addEventListener("mouseenter", () => {
      if (this.timeout) {
        clearTimeout(this.timeout);
      }
    });

    this.element.addEventListener("mouseleave", () => {
      this.autoHide();
    });
  }

  show(duration = 5000) {
    // Clear existing timeout
    if (this.timeout) {
      clearTimeout(this.timeout);
    }

    // Hide any existing toasts
    const existingToasts = document.querySelectorAll(".toast.show");
    existingToasts.forEach((toast) => {
      if (toast !== this.element) {
        toast.classList.remove("show");
      }
    });

    // Show this toast
    this.element.style.display = "flex";
    this.element.offsetHeight; // Trigger reflow
    this.element.classList.add("show");

    // Auto-hide
    this.autoHide(duration);
  }

  hide() {
    if (this.timeout) {
      clearTimeout(this.timeout);
      this.timeout = null;
    }
    this.element.classList.remove("show");
    setTimeout(() => {
      this.element.style.display = "none";
    }, 300);
  }

  autoHide(duration = 5000) {
    this.timeout = setTimeout(() => {
      this.hide();
    }, duration);
  }
}

// Add CSS for modal and toast animations with dark theme
const style = document.createElement("style");
style.textContent = `
    .modal {
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        opacity: 0;
        transform: scale(0.95);
    }
    
    .modal.show {
        opacity: 1;
        transform: scale(1);
    }
    
    .modal-dialog {
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        transform: translateY(-20px);
    }
    
    .modal.show .modal-dialog {
        transform: translateY(0);
    }
    
    .toast {
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        opacity: 0;
        transform: translateX(100%) translateY(-10px);
    }
    
    .toast.show {
        opacity: 1;
        transform: translateX(0) translateY(0);
    }
    
    .btn-close {
        background: none;
        border: none;
        cursor: pointer;
        padding: 0.25rem;
        margin: 0;
        transition: all 0.3s ease;
    }
    
    .btn-close:hover {
        opacity: 1;
        transform: scale(1.1);
    }
    
    /* Dark theme enhancements */
    .modal-content {
        animation: modalSlideIn 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }
    
    @keyframes modalSlideIn {
        from {
            opacity: 0;
            transform: translateY(-50px) scale(0.95);
        }
        to {
            opacity: 1;
            transform: translateY(0) scale(1);
        }
    }
    
    .toast {
        animation: toastSlideIn 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }
    
    @keyframes toastSlideIn {
        from {
            opacity: 0;
            transform: translateX(100%) translateY(-20px);
        }
        to {
            opacity: 1;
            transform: translateX(0) translateY(0);
        }
    }
`;
document.head.appendChild(style);

// Make classes globally available
window.Modal = Modal;
window.Toast = Toast;
