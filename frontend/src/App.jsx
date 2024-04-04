import TransactionsList from "./components/TransactionList";
import "./App.css"
import TransactionsStatistics from "./components/TransactionStatistics";
import TransactionsPieChart from "./components/TransactionPieChart";

function App() {
  return (
    <>
      <TransactionsList />
      <TransactionsStatistics/>
      <TransactionsPieChart />
    </>
  );
}

export default App;
