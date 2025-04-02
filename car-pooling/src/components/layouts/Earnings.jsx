import React, { useState, useEffect } from 'react';
import axios from 'axios';
// import { DriverNavbar } from './DriverNavbar';
import { FiDollarSign, FiCalendar, FiBarChart2, FiPieChart } from 'react-icons/fi';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';

const Earnings = () => {
    const [earnings, setEarnings] = useState({
        today: 0,
        weekly: 0,
        monthly: 0,
        total: 0
    });
    const [transactions, setTransactions] = useState([]);
    const [timeRange, setTimeRange] = useState('week');
    const [isLoading, setIsLoading] = useState(true);
    const [chartType, setChartType] = useState('bar');

    useEffect(() => {
        const fetchEarnings = async () => {
            try {
                const token = localStorage.getItem('token');
                const [earningsRes, transactionsRes] = await Promise.all([
                    axios.get('/api/driver/earnings', {
                        headers: { 'x-auth-token': token }
                    }),
                    axios.get(`/api/driver/transactions?range=${timeRange}`, {
                        headers: { 'x-auth-token': token }
                    })
                ]);

                setEarnings({
                    ...earningsRes.data,
                    total: earningsRes.data.today + earningsRes.data.weekly + earningsRes.data.monthly
                });
                setTransactions(transactionsRes.data);
                setIsLoading(false);
            } catch (err) {
                console.error(err);
                setIsLoading(false);
            }
        };

        fetchEarnings();
    }, [timeRange]);

    const prepareChartData = () => {
        if (timeRange === 'week') {
            const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
            return days.map(day => {
                const dayEarnings = transactions.filter(t =>
                    new Date(t.completedAt).getDay() === days.indexOf(day)
                        .reduce((sum, t) => sum + t.fare.total, 0));
                return { name: day, earnings: dayEarnings };
            });
        } else {
            const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            return months.map((month, index) => {
                const monthEarnings = transactions.filter(t =>
                    new Date(t.completedAt).getMonth() === index)
                    .reduce((sum, t) => sum + t.fare.total, 0);
                return { name: month, earnings: monthEarnings };
            });
        }
    };

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

    return (
        <div className="min-h-screen bg-gray-100">
            {/* <DriverNavbar /> */}
            <div className="container mx-auto py-8 px-4">
                <h1 className="text-2xl font-bold text-gray-800 mb-6">Earnings</h1>

                {isLoading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                            <div className="bg-white rounded-lg shadow p-6">
                                <div className="flex items-center">
                                    <div className="p-3 rounded-full bg-blue-100 text-blue-600 mr-4">
                                        <FiDollarSign size={20} />
                                    </div>
                                    <div>
                                        <h3 className="text-gray-500 text-sm">Today</h3>
                                        <p className="text-xl font-bold">${earnings.today.toFixed(2)}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-lg shadow p-6">
                                <div className="flex items-center">
                                    <div className="p-3 rounded-full bg-green-100 text-green-600 mr-4">
                                        <FiDollarSign size={20} />
                                    </div>
                                    <div>
                                        <h3 className="text-gray-500 text-sm">This Week</h3>
                                        <p className="text-xl font-bold">${earnings.weekly.toFixed(2)}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-lg shadow p-6">
                                <div className="flex items-center">
                                    <div className="p-3 rounded-full bg-yellow-100 text-yellow-600 mr-4">
                                        <FiDollarSign size={20} />
                                    </div>
                                    <div>
                                        <h3 className="text-gray-500 text-sm">This Month</h3>
                                        <p className="text-xl font-bold">${earnings.monthly.toFixed(2)}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-lg shadow p-6">
                                <div className="flex items-center">
                                    <div className="p-3 rounded-full bg-purple-100 text-purple-600 mr-4">
                                        <FiDollarSign size={20} />
                                    </div>
                                    <div>
                                        <h3 className="text-gray-500 text-sm">Total</h3>
                                        <p className="text-xl font-bold">${earnings.total.toFixed(2)}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-lg shadow overflow-hidden mb-6">
                            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                                <h2 className="text-lg font-semibold text-gray-800">Earnings Overview</h2>
                                <div className="flex space-x-2">
                                    <button
                                        onClick={() => setTimeRange('week')}
                                        className={`px-3 py-1 rounded-md ${timeRange === 'week' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
                                    >
                                        Weekly
                                    </button>
                                    <button
                                        onClick={() => setTimeRange('month')}
                                        className={`px-3 py-1 rounded-md ${timeRange === 'month' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
                                    >
                                        Monthly
                                    </button>
                                    <button
                                        onClick={() => setChartType(chartType === 'bar' ? 'pie' : 'bar')}
                                        className="px-3 py-1 bg-gray-200 text-gray-700 rounded-md"
                                    >
                                        {chartType === 'bar' ? <FiPieChart /> : <FiBarChart2 />}
                                    </button>
                                </div>
                            </div>

                            <div className="p-6 h-80">
                                {chartType === 'bar' ? (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={prepareChartData()}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="name" />
                                            <YAxis />
                                            <Tooltip formatter={(value) => [`$${value}`, 'Earnings']} />
                                            <Legend />
                                            <Bar dataKey="earnings" name="Earnings" fill="#3B82F6" />
                                        </BarChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={prepareChartData().filter(item => item.earnings > 0)}
                                                cx="50%"
                                                cy="50%"
                                                labelLine={false}
                                                outerRadius={80}
                                                fill="#8884d8"
                                                dataKey="earnings"
                                                nameKey="name"
                                                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                            >
                                                {prepareChartData().map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip formatter={(value) => [`$${value}`, 'Earnings']} />
                                            <Legend />
                                        </PieChart>
                                    </ResponsiveContainer>
                                )}
                            </div>
                        </div>

                        <div className="bg-white rounded-lg shadow overflow-hidden">
                            <div className="p-4 border-b border-gray-200">
                                <h2 className="text-lg font-semibold text-gray-800">Recent Transactions</h2>
                            </div>
                            <div className="divide-y divide-gray-200">
                                {transactions.slice(0, 5).map((transaction) => (
                                    <div key={transaction._id} className="p-4">
                                        <div className="flex justify-between">
                                            <div>
                                                <h3 className="font-medium">
                                                    {transaction.departureLocation} → {transaction.arrivalLocation}
                                                </h3>
                                                <p className="text-sm text-gray-500">
                                                    {new Date(transaction.completedAt).toLocaleString()}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-bold text-green-600">+${transaction.fare.total.toFixed(2)}</p>
                                                <p className="text-sm text-gray-500">
                                                    {transaction.passengers.length} passenger(s)
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default Earnings;