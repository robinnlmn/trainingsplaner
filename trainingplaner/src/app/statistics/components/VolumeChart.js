import React, { useEffect, useState } from "react";
import styles from "../../styles/Statistics.module.css";
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

export default function VolumeChart() {
  const [data, setData] = useState([]);
  const [competitions, setCompetitions] = useState([]);
  const serverUrl = "http://192.168.178.112:8080";

  async function runStatistics() {
    try {
      const response = await fetch(
        `${serverUrl}/api/statistic/volumeOverTime?type=Schwimmen`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      const data = await response.json();
      setData(data);
      await getCompetitions();
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  }

  async function getCompetitions() {
    try {
      const response = await fetch(
        `${serverUrl}/api/statistic/volumeOverTime?type=Wettkampf`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      const data = await response.json();
      setCompetitions(data);
    } catch (error) {
      console.error("Error fetching competitions:", error);
    }
  }

  function formatDate(dateString) {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${day}-${month}-${year}`;
  }

  const allDates = [
    ...data.map((item) => item.date),
    ...competitions.map((comp) => comp.date),
  ].map((date) => new Date(date).toISOString().split("T")[0]);
  const uniqueDates = Array.from(new Set(allDates)).sort();

  const chartData = {
    labels: uniqueDates.map((date) => formatDate(date)),
    datasets: [
      {
        label: "Volume",
        data: uniqueDates.map((date) => {
          const training = data.find(
            (t) => new Date(t.date).toISOString().split("T")[0] === date
          );
          return training ? training.volume : null;
        }),
        borderColor: "rgba(75, 192, 192, 1)",
        backgroundColor: "rgba(75, 192, 192, 0.2)",
        fill: true,
      },
      {
        label: "Competitions",
        data: competitions.map((comp) => ({
          x: formatDate(comp.date),
          y: comp.volume || 0,
          name: comp.name,
        })),
        backgroundColor: "rgba(255, 99, 132, 0.6)",
        borderColor: "rgba(255, 99, 132, 1)",
        pointStyle: "rect",
        pointRadius: 12,
      },
    ],
  };

  const chartOptions = {
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
          autoSkip: false,
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
    <div className={styles.chart}>
      {data.length > 0 && <Line data={chartData} options={chartOptions} />}
    </div>
  );
}
