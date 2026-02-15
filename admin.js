const token = localStorage.getItem("token");
const role = localStorage.getItem("role");

if (!token || role !== "admin") {
  window.location.href = "login.html";
}

function showToast(msg) {
  const toast = document.getElementById("toast");
  toast.textContent = msg;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 2500);
}

function logout() {
  localStorage.clear();
  window.location.href = "login.html";
}

async function loadAll() {
  const res = await fetch("/api/admin/appointments", {
    headers: { Authorization: "Bearer " + token },
  });

  const data = await res.json();

  const rows = document.getElementById("rows");
  rows.innerHTML = "";

  data.forEach((a) => {
    rows.innerHTML += `
      <tr>
        <td>${a.user_name}</td>
        <td>${a.user_email}</td>
        <td>${a.doctor}</td>
        <td>${a.appointment_date}</td>
        <td>${a.appointment_time}</td>
        <td><span class="badge ${a.status.toLowerCase()}">${a.status}</span></td>
        <td>
          <button class="btn-sm btn-success" onclick="updateStatus(${a.id}, 'Approved')">Approve</button>
          <button class="btn-sm btn-danger" onclick="updateStatus(${a.id}, 'Cancelled')">Cancel</button>
        </td>
      </tr>
    `;
  });
}

async function updateStatus(id, status) {
  const res = await fetch(`/api/admin/appointments/${id}/status`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + token,
    },
    body: JSON.stringify({ status }),
  });

  const data = await res.json();

  if (res.ok) {
    showToast("Status updated ✅");
    loadAll();
  } else {
    showToast(data.message);
  }
}

loadAll();
