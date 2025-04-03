import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  FiDollarSign,
  FiCalendar,
  FiBarChart2,
  FiPieChart,
  FiClock,
  FiUser,
  FiMapPin,
} from "react-icons/fi";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { FaSpinner } from "react-icons/fa";

// Utility function to validate token
const validateToken = (token) => {
  if (!token) return false;
  const parts = token.split(".");
  return parts.length === 3;
};

const Earnings = () => {
  const [earnings, setEarnings] = useState({
    today: 0,
    weekly: 0,
    monthly: 0,
    total: 0,
  });
  const [transactions, setTransactions] = useState([]);
  const [timeRange, setTimeRange] = useState("week");
  const [chartType, setChartType] = useState("bar");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const token = localStorage.getItem("driverToken");

        // Validate token before making requests
        if (!token || !validateToken(token)) {
          localStorage.removeItem("token");
          navigate("/login");
          return;
        }

        const [earningsRes, transactionsRes] = await Promise.all([
          axios.get("/api/driver/earnings", {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            timeout: 10000,
          }),
          axios.get(`/api/driver/transactions?range=${timeRange}`, {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            timeout: 10000,
          }),
        ]);

        // Validate responses
        if (!earningsRes.data || !transactionsRes.data) {
          throw new Error("Invalid response from server");
        }

        setEarnings({
          today: earningsRes.data.today || 0,
          weekly: earningsRes.data.weekly || 0,
          monthly: earningsRes.data.monthly || 0,
          total:
            (earningsRes.data.today || 0) +
            (earningsRes.data.weekly || 0) +
            (earningsRes.data.monthly || 0),
        });

        setTransactions(transactionsRes.data || []);
      } catch (err) {
        console.error("Fetch error:", err);

        if (err.response?.status === 401) {
          localStorage.removeItem("token");
          navigate("/login");
          return;
        }

        setError(
          err.response?.data?.message ||
            err.message ||
            "Failed to load earnings data"
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [timeRange, navigate]);

  const prepareChartData = () => {
    if (!transactions || transactions.length === 0) {
      return [];
    }

    if (timeRange === "week") {
      const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      return days.map((day, index) => {
        const dayEarnings = transactions
          .filter((t) => new Date(t.completedAt).getDay() === index)
          .reduce((sum, t) => sum + (t.fare?.total || 0), 0);
        return { name: day, earnings: dayEarnings };
      });
    } else {
      const months = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ];
      return months.map((month, index) => {
        const monthEarnings = transactions
          .filter((t) => new Date(t.completedAt).getMonth() === index)
          .reduce((sum, t) => sum + (t.fare?.total || 0), 0);
        return { name: month, earnings: monthEarnings };
      });
    }
  };

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"];
  const chartData = prepareChartData();

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <FaSpinner className="animate-spin text-4xl text-blue-500 mb-4" />
        <p className="text-lg text-gray-600">Loading your earnings data...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">
            Earnings Dashboard
          </h1>

          <div className="flex flex-col sm:flex-row gap-4 mt-4 md:mt-0">
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setTimeRange("week")}
                className={`px-4 py-2 rounded-md text-sm font-medium ${
                  timeRange === "week"
                    ? "bg-blue-600 text-white"
                    : "bg-white text-gray-700 border border-gray-300"
                }`}
              >
                Weekly
              </button>
              <button
                onClick={() => setTimeRange("month")}
                className={`px-4 py-2 rounded-md text-sm font-medium ${
                  timeRange === "month"
                    ? "bg-blue-600 text-white"
                    : "bg-white text-gray-700 border border-gray-300"
                }`}
              >
                Monthly
              </button>
            </div>

            <button
              onClick={() => setChartType(chartType === "bar" ? "pie" : "bar")}
              className="px-4 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 flex items-center justify-center"
            >
              {chartType === "bar" ? (
                <>
                  <FiPieChart className="mr-2" />
                  Pie Chart
                </>
              ) : (
                <>
                  <FiBarChart2 className="mr-2" />
                  Bar Chart
                </>
              )}
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded">
            <div className="flex items-center">
              <FiCalendar className="text-red-500 mr-2" />
              <p className="text-red-700 font-medium">{error}</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Earnings Cards */}
          {[
            { label: "Today", value: earnings.today, icon: <FiClock /> },
            {
              label: "This Week",
              value: earnings.weekly,
              icon: <FiCalendar />,
            },
            {
              label: "This Month",
              value: earnings.monthly,
              icon: <FiCalendar />,
            },
            { label: "Total", value: earnings.total, icon: <FiDollarSign /> },
          ].map((card, index) => (
            <div key={index} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-blue-100 text-blue-600 mr-4">
                  {card.icon}
                </div>
                <div>
                  <h3 className="text-gray-500 text-sm">{card.label}</h3>
                  <p className="text-2xl font-bold text-gray-800">
                    ${card.value.toFixed(2)}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Chart Section */}
        <div className="bg-white rounded-lg shadow overflow-hidden mb-8">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-800">
              Earnings Visualization
            </h2>
          </div>
          <div className="p-6 h-80">
            {chartData.length > 0 ? (
              chartType === "bar" ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip
                      formatter={(value) => [
                        `$${value.toFixed(2)}`,
                        "Earnings",
                      ]}
                    />
                    <Legend />
                    <Bar
                      dataKey="earnings"
                      name="Earnings"
                      fill="#3B82F6"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData.filter((item) => item.earnings > 0)}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="earnings"
                      nameKey="name"
                      label={({ name, percent }) =>
                        `${name}: $${(
                          percent *
                          earnings[timeRange === "week" ? "weekly" : "monthly"]
                        ).toFixed(2)}`
                      }
                    >
                      {chartData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value) => [
                        `$${value.toFixed(2)}`,
                        "Earnings",
                      ]}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              )
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-gray-500">
                <FiBarChart2 className="text-4xl mb-2" />
                <p>No earnings data available for the selected period</p>
              </div>
            )}
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-800">
              Recent Transactions
            </h2>
          </div>
          <div className="divide-y divide-gray-200">
            {transactions.length > 0 ? (
              transactions.slice(0, 5).map((transaction) => (
                <div key={transaction._id} className="p-4 hover:bg-gray-50">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-4">
                      <div className="p-2 rounded-full bg-blue-100 text-blue-600">
                        <FiMapPin />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-800">
                          {transaction.pickupLocation?.address || "Unknown"} →{" "}
                          {transaction.dropoffLocation?.address || "Unknown"}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {new Date(transaction.completedAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-green-600">
                        +${transaction.fare?.total?.toFixed(2) || "0.00"}
                      </p>
                      <div className="flex items-center justify-end text-sm text-gray-500">
                        <FiUser className="mr-1" />
                        <span>
                          {transaction.passengerCount || 1} passenger
                          {transaction.passengerCount !== 1 ? "s" : ""}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-6 text-center text-gray-500">
                <p>No recent transactions found</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Earnings;
