function showToast(msg) {
  const toast = document.getElementById("toast");
  toast.textContent = msg;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 2500);
}

function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("role");
  localStorage.removeItem("name");
  window.location.href = "login.html";
}

function scrollToBooking() {
  document.getElementById("booking").scrollIntoView({ behavior: "smooth" });
}

function setMinDate() {
  const dateInput = document.getElementById("date");
  const today = new Date().toISOString().split("T")[0];
  dateInput.min = today;
}

async function loadAppointments() {
  const token = localStorage.getItem("token");
  if (!token) return (window.location.href = "login.html");

  const res = await fetch("/api/appointments", {
    headers: { Authorization: "Bearer " + token },
  });

  const data = await res.json();
  if (!res.ok) {
    showToast(data.message || "Failed to load");
    return;
  }

  const rows = document.getElementById("rows");
  rows.innerHTML = "";

  document.getElementById("total").textContent = data.length;
  const pendingCount = data.filter(a => a.status === "Pending").length;
  document.getElementById("pending").textContent = pendingCount;

  data.forEach((a) => {
    const badgeClass = a.status.toLowerCase(); // pending/approved/cancelled

    rows.innerHTML += `
      <tr>
        <td>${a.doctor}</td>
        <td>${a.appointment_date}</td>
        <td>${a.appointment_time}</td>
        <td><span class="badge ${badgeClass}">${a.status}</span></td>
        <td>
          <button class="btn-sm btn-danger" onclick="del(${a.id})">Delete</button>
        </td>
      </tr>
    `;
  });
}

async function book() {
  const token = localStorage.getItem("token");
  const doctor = document.getElementById("doctor").value;
  const date = document.getElementById("date").value;
  const time = document.getElementById("time").value;

  const res = await fetch("/api/appointments", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + token,
    },
    body: JSON.stringify({ doctor, date, time }),
  });

  const data = await res.json();
  if (res.ok) {
    showToast(data.message);
    await loadAppointments();
  } else {
    showToast(data.message || "Booking failed ❌");
  }
}

async function del(id) {
  const token = localStorage.getItem("token");

  const res = await fetch(`/api/appointments/${id}`, {
    method: "DELETE",
    headers: { Authorization: "Bearer " + token },
  });

  const data = await res.json();
  if (res.ok) {
    showToast(data.message);
    await loadAppointments();
  } else {
    showToast(data.message || "Delete failed ❌");
  }
}

// Init
const name = localStorage.getItem("name") || "";
document.getElementById("welcome").textContent = `Welcome, ${name}`;

setMinDate();
loadAppointments();
