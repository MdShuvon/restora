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
    window.location.href = "restaurant.html";
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
    const [ordersResponse, reviewsResponse] = await Promise.all([
      fetch("/api/orders"),
      fetch("/api/reviews")
    ]);

    if (!ordersResponse.ok) throw new Error("Unable to load orders.");
    const orders = await ordersResponse.json();
    const reviews = reviewsResponse.ok ? await reviewsResponse.json() : [];

    const normalizedOrders = Array.isArray(orders) ? orders : [];
    const normalizedReviews = Array.isArray(reviews) ? reviews : [];

    // Sales aggregation (unchanged logic, just no longer reads order.rating)
    const salesMap = normalizedOrders.reduce((map, order) => {
      const key = order.item_name || "Unknown item";
      if (!map[key]) {
        map[key] = { name: key, sold: 0, totalRevenue: 0, price: Number(order.unit_price || 0) };
      }
      map[key].sold += Number(order.quantity || 0);
      map[key].totalRevenue += Number(order.quantity || 0) * Number(order.unit_price || 0);
      map[key].price = Number(order.unit_price || 0);
      return map;
    }, {});

    // Reviews aggregation, per item
    const reviewsMap = normalizedReviews.reduce((map, review) => {
      const key = review.item_name || "Unknown item";
      if (!map[key]) map[key] = [];
      map[key].push(Number(review.rating || 0));
      return map;
    }, {});

    const bestSellers = Object.values(salesMap)
      .map((item) => {
        const itemRatings = reviewsMap[item.name] || [];
        const avgRating = itemRatings.length
          ? itemRatings.reduce((sum, r) => sum + r, 0) / itemRatings.length
          : null;

        return {
          ...item,
          avgRating,
          reviewCount: itemRatings.length,
          reviewText: itemRatings.length
            ? `${itemRatings.length} customer review${itemRatings.length > 1 ? "s" : ""}`
            : "No reviews yet"
        };
      })
      .sort((left, right) => right.sold - left.sold)
      .slice(0, 6);

    if (!bestSellers.length) {
      bestSellersList.innerHTML = '<div class="order-card"><h4>No sales yet</h4><p class="order-notes">No orders have been placed yet. Customer activity will appear here.</p></div>';
      topSoldCount.textContent = "0";
      averageRating.textContent = "New";
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

      const reviewPill = card.querySelector(".review-pill");
      reviewPill.textContent = item.avgRating ? `${item.avgRating.toFixed(1)} / 5` : "Not rated yet";
      reviewPill.style.cursor = "pointer";
      reviewPill.addEventListener("click", () => {
        window.location.href = `feedback.html?item=${encodeURIComponent(item.name)}`;
      });

      card.querySelector(".best-seller-review").textContent = `${item.reviewText} • ${formatMoney(item.totalRevenue)} revenue generated`;
      fragment.appendChild(card);
    });

    bestSellersList.appendChild(fragment);
    topSoldCount.textContent = String(bestSellers[0].sold);

    // Overall average across ALL reviews (not just best sellers)
    if (normalizedReviews.length) {
      const overallAvg =
        normalizedReviews.reduce((sum, r) => sum + Number(r.rating || 0), 0) / normalizedReviews.length;
      averageRating.textContent = overallAvg.toFixed(1);
    } else {
      averageRating.textContent = "New";
    }

    bestSellersStatus.textContent = `${bestSellers.length} best-selling items shown.`;
  } catch (error) {
    console.error(error);
    bestSellersStatus.textContent = "Best sellers are unavailable right now.";
    bestSellersList.innerHTML = '<div class="order-card"><h4>Sales data unavailable</h4><p class="order-notes">Please check the restaurant dashboard or database connection.</p></div>';
  }
}

// Clicking the "Avg. rating" stat at the top takes you to the general feedback page
const ratingStat = document.getElementById("rating-stat");
if (ratingStat) {
  ratingStat.style.cursor = "pointer";
  ratingStat.addEventListener("click", () => {
    window.location.href = "feedback.html";
  });
}

loadBestSellers();