const bestSellersList = document.getElementById("best-sellers-list");
const bestSellersStatus = document.getElementById("best-sellers-status");
const topSoldCount = document.getElementById("top-sold-count");
const averageRating = document.getElementById("average-rating");
const template = document.getElementById("best-seller-template");
const ownerButton = document.querySelector(".owner-access-button");
const ownerModal = document.getElementById("owner-modal");
const ownerPassword = document.getElementById("owner-password");
const ownerSubmit = document.getElementById("owner-submit");
const ownerCancel = document.getElementById("owner-cancel");
const ownerError = document.getElementById("owner-error");

function openOwnerModal() {
  ownerModal.classList.remove("hidden");
  ownerPassword.value = "";
  ownerPassword.focus();
  ownerError.classList.add("hidden");
}

function closeOwnerModal() {
  ownerModal.classList.add("hidden");
}

ownerButton.addEventListener("click", openOwnerModal);
ownerCancel.addEventListener("click", closeOwnerModal);

ownerSubmit.addEventListener("click", () => {
  if (ownerPassword.value.trim() === "restora123") {
    sessionStorage.setItem("restora-admin-auth", "true");
    closeOwnerModal();
    window.location.href = "/restaurant.html";
    return;
  }

  ownerError.textContent = "Incorrect password.";
  ownerError.classList.remove("hidden");
  ownerPassword.focus();
});

ownerPassword.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    ownerSubmit.click();
  }
});

const moneyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD"
});

function formatMoney(value) {
  return moneyFormatter.format(Number(value || 0));
}

async function loadBestSellers() {
  try {
    const response = await fetch("/api/orders");
    if (!response.ok) {
      throw new Error("Unable to load orders.");
    }

    const orders = await response.json();
    const normalized = Array.isArray(orders) ? orders : [];

    const aggregate = normalized.reduce((map, order) => {
      const key = order.item_name || "Unknown item";
      if (!map[key]) {
        map[key] = {
          name: key,
          sold: 0,
          totalRevenue: 0,
          reviews: [],
          price: Number(order.unit_price || 0)
        };
      }

      map[key].sold += Number(order.quantity || 0);
      map[key].totalRevenue += Number(order.quantity || 0) * Number(order.unit_price || 0);
      map[key].price = Number(order.unit_price || 0);

      const rating = Number(order.rating || 0);
      if (rating > 0) {
        map[key].reviews.push(rating);
      }

      return map;
    }, {});

    const bestSellers = Object.values(aggregate)
      .map((item) => {
        const avgRating = item.reviews.length
          ? item.reviews.reduce((sum, rating) => sum + rating, 0) / item.reviews.length
          : 5;

        return {
          ...item,
          avgRating,
          reviewText: item.reviews.length
            ? `${item.reviews.length} customer review${item.reviews.length > 1 ? "s" : ""}`
            : "Trending item"
        };
      })
      .sort((left, right) => right.sold - left.sold)
      .slice(0, 6);

    if (!bestSellers.length) {
      bestSellersList.innerHTML = '<div class="order-card"><h4>No sales yet</h4><p class="order-notes">No orders have been placed yet. Customer activity will appear here.</p></div>';
      topSoldCount.textContent = "0";
      averageRating.textContent = "5.0";
      bestSellersStatus.textContent = "No sales data available yet.";
      return;
    }

    bestSellersList.innerHTML = "";
    const fragment = document.createDocumentFragment();

    bestSellers.forEach((item) => {
      const card = template.content.firstElementChild.cloneNode(true);
      card.querySelector(".best-seller-name").textContent = item.name;
      card.querySelector(".best-seller-price").textContent = formatMoney(item.price);
      card.querySelector(".sold-pill").textContent = `${item.sold} sold`;
      card.querySelector(".review-pill").textContent = `${item.avgRating.toFixed(1)} / 5`;
      card.querySelector(".best-seller-review").textContent = `${item.reviewText} • ${formatMoney(item.totalRevenue)} revenue generated`;
      fragment.appendChild(card);
    });

    bestSellersList.appendChild(fragment);
    topSoldCount.textContent = String(bestSellers[0].sold);
    const allRatings = bestSellers.flatMap((item) => item.reviews.length ? item.reviews : [5]);
    const average = allRatings.length
      ? allRatings.reduce((sum, rating) => sum + rating, 0) / allRatings.length
      : 5;
    averageRating.textContent = average.toFixed(1);
    bestSellersStatus.textContent = `${bestSellers.length} best-selling items shown.`;
  } catch (error) {
    console.error(error);
    bestSellersStatus.textContent = "Best sellers are unavailable right now.";
    bestSellersList.innerHTML = '<div class="order-card"><h4>Sales data unavailable</h4><p class="order-notes">Please check the restaurant dashboard or database connection.</p></div>';
  }
}

loadBestSellers();
