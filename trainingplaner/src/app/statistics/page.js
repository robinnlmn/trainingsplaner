"use client";
import React, { useEffect, useState } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";

// Register necessary components for Chart.js including Filler
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

function Statistics() {
  const [data, setData] = useState([]);
  const [competitions, setCompetitions] = useState([]);
  const serverUrl = "http://192.168.178.112:8080";

  async function runStatistics() {
    try {
      const response = await fetch(`${serverUrl}/api/statistic`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      const data = await response.json();
      setData(data);
      await getCompetitions();
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  }

  async function getCompetitions() {
    try {
      const response = await fetch(`${serverUrl}/api/statistic/competitions`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      const data = await response.json();
      setCompetitions(data);
    } catch (error) {
      console.error("Error fetching competitions:", error);
    }
  }

  // Helper function to format date
  function formatDate(dateString) {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are zero-indexed
    const day = String(date.getDate()).padStart(2, "0");
    return `${day}-${month}-${year}`;
  }

  // Create a unified list of dates
  const allDates = [
    ...data.map((item) => item.date),
    ...competitions.map((comp) => comp.date),
  ].map((date) => new Date(date).toISOString().split("T")[0]); // Format dates as strings
  const uniqueDates = Array.from(new Set(allDates)).sort();

  // Prepare the data for the line chart
  const chartData = {
    labels: uniqueDates.map((date) => formatDate(date)),
    datasets: [
      {
        label: "Volume",
        data: uniqueDates.map((date) => {
          const training = data.find(
            (t) => new Date(t.date).toISOString().split("T")[0] === date
          );
          return training ? training.volume : null; // Use null for missing data
        }),
        borderColor: "rgba(75, 192, 192, 1)",
        backgroundColor: "rgba(75, 192, 192, 0.2)",
        fill: true, // Fill under the line
      },
      {
        label: "Competitions",
        data: competitions.map((comp) => ({
          x: formatDate(comp.date),
          y: comp.volume || 0,
          name: comp.name, // Include the competition name
        })),
        backgroundColor: "rgba(255, 99, 132, 0.6)", // Color for the competition markers
        borderColor: "rgba(255, 99, 132, 1)", // Border color for the competition markers
        pointStyle: "rect", // Shape of the marker (rectangle in this case)
        pointRadius: 12, // Size of the marker
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
      },
      title: {
        display: true,
        text: "Training Volume and Competitions Over Time",
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            if (context.dataset.label === "Competitions") {
              return `Competition: ${context.raw.name}`;
            }
            return `${context.dataset.label}: ${context.raw.y}`;
          },
        },
      },
    },
    scales: {
      x: {
        type: "category",
        labels: uniqueDates.map((date) => formatDate(date)),
        ticks: {
          autoSkip: false, // Ensure all dates are visible
        },
      },
      y: {
        beginAtZero: true,
      },
    },
  };

  useEffect(() => {
    runStatistics();
  }, []);

  return (
    <div>
      {data.length > 0 && <Line data={chartData} options={chartOptions} />}
    </div>
  );
}

export default Statistics;
