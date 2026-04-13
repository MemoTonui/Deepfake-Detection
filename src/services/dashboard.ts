// src/services/dashboard.ts
export async function fetchRecentCases() {
  const response = await fetch("http://localhost:5000/api/dashboard/recent", {
    headers: {
      "Authorization": `Bearer ${localStorage.getItem("token")}`,
    },
  })

  if (!response.ok) throw new Error("Failed to fetch recent cases")
  return await response.json()
}

// src/services/dashboard.ts
export async function fetchStats() {
  const response = await fetch("http://localhost:5000/api/dashboard/stats", {
    headers: {
      "Authorization": `Bearer ${localStorage.getItem("token")}`,
    },
  })

  if (!response.ok) throw new Error("Failed to fetch stats")
  return await response.json()
}
