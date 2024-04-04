import "./App.css";
import TransactionsBarChart from "./components/TransactionBarChart";
import TransactionsList from "./components/TransactionList";
import TransactionsPieChart from "./components/TransactionPieChart";
import TransactionsStatistics from "./components/TransactionStatistics";

function App() {
  return (
    <>
      <TransactionsList />
      <TransactionsStatistics />
      <TransactionsBarChart />
      <TransactionsPieChart />
    </>
  );
}

export default App;
