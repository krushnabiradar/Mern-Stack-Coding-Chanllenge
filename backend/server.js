import cors from "cors";
import "dotenv/config";
import express from "express";
// import jwt from "jsonwebtoken";
import axios from "axios";
import mongoose from "mongoose";
import Transaction from "./model/Transaction.js";

const server = express();

server.use(express.json());
server.use(cors());

let PORT = 3000;

async function connectToDatabase() {
  try {
    await mongoose.connect(process.env.DB_LOCATION, {
      autoIndex: true,
    });
    console.log("Connected to the database");
  } catch (error) {
    console.error("Error connecting to the database:", error);
    // Optionally, you can rethrow the error to handle it at a higher level
    throw error;
  }
}
connectToDatabase();

// Function to fetch data from the third-party API and initialize the database

// async function initializeDatabase() {
//   try {
//     const response = await axios.get(
//       "https://s3.amazonaws.com/roxiler.com/product_transaction.json"
//     );
//     const transactions = response.data; // Assuming transactions are an array of objects

//     // Insert transactions into the database
//     await Transaction.insertMany(transactions);
//     console.log("Database initialized successfully.");
//   } catch (error) {
//     console.error("Error initializing database:", error);
//   }
// }
// initializeDatabase();

// List All Transactions API with Search, Pagination, and Month Filtering

// transaction API

server.get("/transactions", async (req, res) => {
  const { search, page = 1, perPage = 10, month } = req.query;

  let query = {};

  // Apply month filtering
  if (month) {
    const monthIndex = new Date(`${month} 1, 2000`).getMonth() + 1;
    query.$expr = {
      $eq: [{ $month: "$dateOfSale" }, monthIndex],
    };
  }

  // Apply search if search parameter is provided
  if (search) {
    query.$or = [
      { title: { $regex: search, $options: "i" } },
      { description: { $regex: search, $options: "i" } },
    ];
  }

  try {
    const transactions = await Transaction.find(query)
      .skip((page - 1) * perPage)
      .limit(perPage)
      .exec();

    res.json({ transactions });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Statistics API
server.get('/statistics', async (req, res) => {
  const { month } = req.query;

  if (!month) {
      return res.status(400).json({ error: "Month parameter is required" });
  }

  const monthIndex = new Date(`${month} 1, 2000`).getMonth() + 1;

  try {
      const statistics = await Transaction.aggregate([
          {
              $addFields: {
                  month: { $month: "$dateOfSale" },
              },
          },
          {
              $match: {
                  month: monthIndex,
              },
          },
          {
              $group: {
                  _id: null,
                  totalSaleAmount: { $sum: "$price" },
                  totalSoldItems: { $sum: 1 },
              },
          },
          {
              $project: {
                  _id: 0,
                  totalSaleAmount: 1,
                  totalSoldItems: 1,
                  totalNotSoldItems: { $subtract: [0, "$totalSoldItems"] }, // Calculate totalNotSoldItems by subtracting totalSoldItems from total number of transactions
              },
          },
      ]);

      res.json(
          statistics[0] || {
              totalSaleAmount: 0,
              totalSoldItems: 0,
              totalNotSoldItems: 0,
          }
      );
  } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal server error" });
  }
});

// API endpoint for bar chart
server.get("/bar-chart", async (req, res) => {
  const { month } = req.query;

  if (!month) {
    return res.status(400).json({ error: "Month parameter is required" });
  }

  const monthIndex = new Date(`${month} 1, 2000`).getMonth() + 1;

  try {
    // Define price ranges
    const priceRanges = [
      { min: 0, max: 100 },
      { min: 101, max: 200 },
      { min: 201, max: 300 },
      { min: 301, max: 400 },
      { min: 401, max: 500 },
      { min: 501, max: 600 },
      { min: 601, max: 700 },
      { min: 701, max: 800 },
      { min: 801, max: 900 },
      { min: 901, max: Infinity },
    ];

    const data = await Transaction.aggregate([
      {
        $addFields: {
          month: { $month: "$dateOfSale" },
        },
      },
      {
        $match: {
          month: monthIndex,
        },
      },
      {
        $group: {
          _id: {
            $switch: {
              branches: priceRanges.map((range, index) => ({
                case: {
                  $and: [
                    { $gte: ["$price", range.min] },
                    { $lt: ["$price", range.max] },
                  ],
                },
                then: index,
              })),
              default: priceRanges.length - 1,
            },
          },
          count: { $sum: 1 },
        },
      },
    ]);

    // Construct response data
    const responseData = priceRanges.map((range, index) => {
      const label =
        index === priceRanges.length - 1
          ? "901-above"
          : `${range.min}-${range.max}`;
      const count = data.find((item) => item._id === index)?.count || 0; // Accessing count from data array
      return { priceRange: label, count };
    });

    // Send response
    res.json(responseData);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

//Pie-chart API
server.get("/pie-chart", async (req, res) => {
  const { month } = req.query;

  if (!month) {
    return res.status(400).json({ error: "Month parameter is required" });
  }

  try {
    const monthIndex = new Date(`${month} 1, 2000`).getMonth() + 1;

    const pieChartData = await Transaction.aggregate([
      {
        $addFields: {
          month: { $month: "$dateOfSale" },
        },
      },
      {
        $match: {
          month: monthIndex,
        },
      },
      {
        $group: {
          _id: "$category",
          count: { $sum: 1 },
        },
      },
    ]);

    res.json(pieChartData);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

//combined response API

const TRANSACTION_API_URL = "http://localhost:3000/transactions";
const STATISTICS_API_URL = "http://localhost:3000/statistics";
const BAR_CHART_API_URL = "http://localhost:3000/bar-chart";
const PIE_CHART_API_URL = "http://localhost:3000/pie-chart";

server.get("/combined-response", async (req, res) => {
  const { month } = req.query;

  if (!month) {
    return res.status(400).json({ error: "Month parameter is required" });
  }

  try {
    // Make HTTP GET requests to each API
    const transactionsResponse = await axios.get(
      `${TRANSACTION_API_URL}?month=${month}`
    );
    const statisticsResponse = await axios.get(
      `${STATISTICS_API_URL}?month=${month}`
    );
    const barChartResponse = await axios.get(
      `${BAR_CHART_API_URL}?month=${month}`
    );
    const pieChartResponse = await axios.get(
      `${PIE_CHART_API_URL}?month=${month}`
    );

    // Extract data from responses
    const transactions = transactionsResponse.data;
    const statistics = statisticsResponse.data;
    const barChart = barChartResponse.data;
    const pieChart = pieChartResponse.data;

    // Combine responses into final JSON
    const combinedResponse = {
      transactions,
      statistics,
      barChart,
      pieChart,
    };

    // Send final combined response
    res.json(combinedResponse);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

server.listen(PORT, () => {
  console.log("Listening on port ->" + PORT);
});
