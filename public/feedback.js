const itemSelect = document.getElementById("feedback-item-select");
const starButtons = document.querySelectorAll("#star-rating button");
const ratingLabel = document.getElementById("rating-label");
const form = document.getElementById("feedback-form");
const commentInput = document.getElementById("feedback-comment");
const nameInput = document.getElementById("feedback-name");
const statusMessage = document.getElementById("feedback-status");

let selectedRating = 0;

function showStatus(message, type = "success") {
  statusMessage.textContent = message;
  statusMessage.className = `status-message status-${type}`;
}

function highlightStars(value) {
  starButtons.forEach((button) => {
    button.classList.toggle("active", Number(button.dataset.value) <= value);
  });
}

starButtons.forEach((button) => {
  button.addEventListener("click", () => {
    selectedRating = Number(button.dataset.value);
    highlightStars(selectedRating);
    ratingLabel.textContent = `You rated: ${selectedRating} / 5`;
  });
});

async function loadMenuOptions() {
  try {
    const response = await fetch("/api/menu");
    if (!response.ok) throw new Error("Unable to load menu.");

    const menu = await response.json();
    const items = Array.isArray(menu) ? menu : [];

    if (!items.length) {
      itemSelect.innerHTML = '<option value="">No menu items available</option>';
      return;
    }

    itemSelect.innerHTML = items
      .map((item) => `<option value="${item.name}">${item.name}</option>`)
      .join("");

    // If arrived via a "rate this item" link like feedback.html?item=Burger
    const params = new URLSearchParams(window.location.search);
    const preselect = params.get("item");
    if (preselect && items.some((item) => item.name === preselect)) {
      itemSelect.value = preselect;
    }
  } catch (error) {
    console.error(error);
    itemSelect.innerHTML = '<option value="">Menu unavailable</option>';
  }
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const itemName = itemSelect.value;

  if (!itemName) {
    showStatus("Please choose an item.", "error");
    return;
  }

  if (!selectedRating) {
    showStatus("Please tap a star to give a rating.", "error");
    return;
  }

  const submitButton = form.querySelector('button[type="submit"]');
  const originalText = submitButton.textContent;
  submitButton.textContent = "Submitting...";
  submitButton.disabled = true;

  try {
    const response = await fetch("/api/reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        itemName,
        rating: selectedRating,
        comment: commentInput.value.trim(),
        customerName: nameInput.value.trim()
      })
    });

    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({}));
      throw new Error(errorBody.error || "Unable to submit review.");
    }

    showStatus("✓ Thanks for your feedback!", "success");
    form.reset();
    selectedRating = 0;
    highlightStars(0);
    ratingLabel.textContent = "Tap a star to rate.";
  } catch (error) {
    console.error(error);
    showStatus(error.message || "Unable to submit review.", "error");
  } finally {
    submitButton.textContent = originalText;
    submitButton.disabled = false;
  }
});

loadMenuOptions();