import { useState, useEffect } from "react";

const TransactionsList = () => {
  const [transactions, setTransactions] = useState([]);
  const [search, setSearch] = useState("");
  const [month, setMonth] = useState(3); // Default to March
  const [page, setPage] = useState(1);
  const perPage = 10;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadTransactions();
  }, [month, search, page]);

  const loadTransactions = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `http://localhost:3000/transactions?search=${search}&page=${page}&perPage=${perPage}&month=${month}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch data");
      }
      const data = await response.json();
      setTransactions(data.transactions);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const previousPage = () => {
    if (page > 1) {
      setPage(page - 1);
    }
  };

  const nextPage = () => {
    setPage(page + 1);
  };

  return (
    <div
      style={{
        backgroundColor: "#edf6f6",
        border: "#e5ebef",
        borderRadius: "10px",
      }}
    >
      <div className="table-container">
        <div className="container">
          <input
            type="text"
            id="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search Transaction"
            style={{marginTop:"20px"}}
          />
          <label
            htmlFor="month"
            style={{
              paddingTop: "28px",
              paddingRight: "5px",
              paddingLeft: "10px",
            }}
          >
            <b>Select Month : </b>
          </label>
          <select
            id="month"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            style={{marginTop:"20px"}}
            
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
        </div>
        <table className="table">
          
          <thead>
            <tr>
              <th>ID</th>
              <th>Title</th>
              <th>Description</th>
              <th>Price</th>
              <th>Category</th>
              <th>Sold</th>
              <th>Image</th>
            </tr>
          </thead>
          {/* Table body */}
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="7">Loading...</td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan="7">Error: {error}</td>
              </tr>
            ) : (
              transactions.map((transaction) => (
                <tr key={transaction._id}>
                  <td>{transaction.id}</td>
                  <td>{transaction.title}</td>
                  <td>{transaction.description}</td>
                  <td>{transaction.price}</td>
                  <td>{transaction.category}</td>
                  <td>{transaction.sold}</td>
                  <td>
                    <img src={transaction.image} alt={transaction.title} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        {/* Pagination */}
        <div className="pagination">
          <div className="page-number">Page: {page}</div>
          <div className="navigation">
            <button onClick={previousPage} disabled={page === 1}>
              Previous
            </button>
            <button onClick={nextPage}>Next</button>
          </div>
          <div className="per-page">PerPage: {perPage}</div>
        </div>
      </div>
    </div>
  );
};

export default TransactionsList;
