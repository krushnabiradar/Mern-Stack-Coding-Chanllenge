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

const TransactionsStatistics = () => {
  const [month, setMonth] = useState(3);
  const {
    data: statistics,
    loading,
    error,
  } = useFetch(`http://localhost:3000/statistics?month=${month}`);

  return (
    <div className="statistics-container">
      <div className="select-container">
        <label htmlFor="month">
          <b>Statistics - </b>
        </label>
        <select
          id="month"
          value={month}
          onChange={(e) => setMonth(parseInt(e.target.value))}
        >
          {monthOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
      <div className="statistics-box">
        {loading ? (
          <div>Loading...</div>
        ) : error ? (
          <div>Error fetching statistics</div>
        ) : (
          <>
            <div>Total Sale Amount: {statistics.totalSaleAmount.toFixed(2)}</div>
            <div>Total Sold Items: {statistics.totalSoldItems}</div>
            <div>Total Not Sold Items: {statistics.totalNotSoldItems}</div>
          </>
        )}
      </div>
    </div>
  );
};

export default TransactionsStatistics;
