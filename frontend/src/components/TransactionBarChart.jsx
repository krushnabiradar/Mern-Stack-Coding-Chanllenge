import { useState, useEffect } from "react";
import { Bar } from "react-chartjs-2";

function TransactionsBarChart() {
  const [data, setData] = useState([]);
  const [month, setMonth] = useState(3);
  const [error, setError] = useState("");

  useEffect(() => {
    if (month) {
      fetchData(month);
    }
  }, [month]);

  const fetchData = async (month) => {
    try {
      const response = await fetch(
        `http://localhost:3000/bar-chart?month=${month}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch data");
      }
      const responseData = await response.json();
      setData(responseData);
      setError("");
    } catch (error) {
      console.error("Error fetching data:", error);
      setError("Error fetching data. Please try again later.");
    }
  };

  const chartData = {
    labels: data.map((item) => item.priceRange),
    datasets: [
      {
        label: "Number of Items",
        backgroundColor: "rgba(75,192,192,1)",
        borderColor: "rgba(0,0,0,1)",
        borderWidth: 1,
        data: data.map((item) => item.count),
      },
    ],
  };

  return (
    <div className="bar-chart">
      <label htmlFor="month" style={{marginLeft:'30px'}}>
        <b>Bar Chart Stats : </b>
      </label>
      <select
        id="month"
        value={month}
        onChange={(e) => setMonth(e.target.value)}
        style={{marginTop:"50px"}}
      >
        <option value="1">January</option>
        <option value="2">February</option>
        <option value="3">March</option>
        <option value="4">April</option>
        <option value="5">May</option>
        <option value="6">June</option>
        <option value="7">July</option>
        <option value="8">August</option>
        <option value="9">September</option>
        <option value="10">October</option>
        <option value="11">November</option>
        <option value="12">December</option>
      </select>

      {error && <div>Error: {error}</div>}

      <div id="chart-container">
        <Bar
          data={chartData}
          options={{
            title: {
              display: true,
              text: "Transactions Bar Chart",
              fontSize: 20,
            },
            legend: {
              display: true,
              position: "right",
            },
          }}
        />
      </div>
    </div>
  );
}

export default TransactionsBarChart;
