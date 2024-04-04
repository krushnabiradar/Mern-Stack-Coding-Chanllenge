import Chart from "chart.js/auto";
import { useEffect, useState } from "react";

const monthOptions = [
  { value: 1, label: "January" },
  { value: 2, label: "February" },
  { value: 3, label: "March" },
  { value: 4, label: "April" },
  { value: 5, label: "May" },
  { value: 6, label: "June" },
  { value: 7, label: "July" },
  { value: 8, label: "August" },
  { value: 9, label: "September" },
  { value: 10, label: "October" },
  { value: 11, label: "November" },
  { value: 12, label: "December" },
];

const useFetch = (url) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await fetch(url);
        const result = await response.json();
        setData(result);
      } catch (error) {
        setError(error);
      }
      setLoading(false);
    };
    fetchData();
  }, [url]);

  return { data, loading, error };
};

const TransactionsPieChart = () => {
  const [month, setMonth] = useState(3);
  const {
    data: pieChartData,
    loading,
    error,
  } = useFetch(`http://localhost:3000/pie-chart?month=${month}`);
  const [chartInstance, setChartInstance] = useState(null);

  useEffect(() => {
    if (!loading && !error && pieChartData) {
      if (chartInstance) {
        chartInstance.destroy(); // Destroy the previous Chart instance
      }
      drawPieChart(pieChartData);
    }
  }, [loading, error, pieChartData]);

  const drawPieChart = (data) => {
    const ctx = document.getElementById("pieChart");
    const newChartInstance = new Chart(ctx, {
      type: "pie",
      data: {
        labels: data.map((item) => item._id),
        datasets: [
          {
            label: "Number of Items",
            data: data.map((item) => item.count),
            backgroundColor: [
              "rgba(255, 99, 132, 0.5)",
              "rgba(54, 162, 235, 0.5)",
              "rgba(255, 206, 86, 0.5)",
              "rgba(75, 192, 192, 0.5)",
              "rgba(153, 102, 255, 0.5)",
              "rgba(255, 159, 64, 0.5)",
            ],
            borderColor: [
              "rgba(255, 99, 132, 1)",
              "rgba(54, 162, 235, 1)",
              "rgba(255, 206, 86, 1)",
              "rgba(75, 192, 192, 1)",
              "rgba(153, 102, 255, 1)",
              "rgba(255, 159, 64, 1)",
            ],
            borderWidth: 1,
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: "right",
          },
          title: {
            display: true,
            text: "Transactions by Category",
          },
        },
      },
    });
    setChartInstance(newChartInstance); // Store the new Chart instance
  };

  return (
    <div className="pie-chart">
      <div className="select-container">
        <label htmlFor="month" className="select-label">
          <b>Select Month : </b>
        </label>
        <select
          id="month"
          value={month}
          onChange={(e) => setMonth(parseInt(e.target.value))}
          className="select-month"
        >
          {monthOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        <canvas id="pieChart" width="300" height="300"></canvas>
      </div>
    </div>
  );
};

export default TransactionsPieChart;
