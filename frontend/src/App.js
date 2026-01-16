import React, { useState, useEffect } from 'react';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Calendar, DollarSign, TrendingUp, PlusCircle, Edit2, Trash2, LogOut, User } from 'lucide-react';

const API_URL = 'http://localhost:5000/api';

// Color palette for charts
const COLORS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#14b8a6', '#6366f1'];

function App() {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [currentView, setCurrentView] = useState('dashboard');
  
  // Auth states
  const [isLogin, setIsLogin] = useState(true);
  const [authForm, setAuthForm] = useState({ email: '', password: '', name: '' });
  const [authError, setAuthError] = useState('');
  
  // Expense states
  const [expenses, setExpenses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [summary, setSummary] = useState(null);
  const [editingExpense, setEditingExpense] = useState(null);
  
  // Form states
  const [expenseForm, setExpenseForm] = useState({
    amount: '',
    description: '',
    category_id: '',
    date: new Date().toISOString().split('T')[0]
  });

  // Filter states
  const [dateFilter, setDateFilter] = useState('all');

  useEffect(() => {
    if (token) {
      fetchCategories();
      fetchExpenses();
      fetchSummary();
    }
  }, [token]);

  // Auth functions
  const handleAuth = async () => {
    setAuthError('');
    
    try {
      const endpoint = isLogin ? '/auth/login' : '/auth/register';
      const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(authForm)
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setToken(data.token);
        setUser(data.user);
      } else {
        setAuthError(data.error);
      }
    } catch (error) {
      setAuthError('Connection error. Make sure backend is running on port 5000.');
    }
  };

  const handleLogout = () => {
    setToken(null);
    setUser(null);
  };

  // Fetch functions
  const fetchCategories = async () => {
    try {
      const response = await fetch(`${API_URL}/categories`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setCategories(data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchExpenses = async () => {
    try {
      let url = `${API_URL}/expenses`;
      
      // Add date filters
      if (dateFilter !== 'all') {
        const today = new Date();
        let startDate;
        
        if (dateFilter === 'week') {
          startDate = new Date(today.setDate(today.getDate() - 7));
        } else if (dateFilter === 'month') {
          startDate = new Date(today.setMonth(today.getMonth() - 1));
        }
        
        if (startDate) {
          url += `?startDate=${startDate.toISOString().split('T')[0]}&endDate=${new Date().toISOString().split('T')[0]}`;
        }
      }
      
      const response = await fetch(url, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setExpenses(data);
    } catch (error) {
      console.error('Error fetching expenses:', error);
    }
  };

  const fetchSummary = async () => {
    try {
      let url = `${API_URL}/expenses/summary/stats`;
      
      if (dateFilter !== 'all') {
        const today = new Date();
        let startDate;
        
        if (dateFilter === 'week') {
          startDate = new Date(today.setDate(today.getDate() - 7));
        } else if (dateFilter === 'month') {
          startDate = new Date(today.setMonth(today.getMonth() - 1));
        }
        
        if (startDate) {
          url += `?startDate=${startDate.toISOString().split('T')[0]}&endDate=${new Date().toISOString().split('T')[0]}`;
        }
      }
      
      const response = await fetch(url, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setSummary(data);
    } catch (error) {
      console.error('Error fetching summary:', error);
    }
  };

  useEffect(() => {
    if (token) {
      fetchExpenses();
      fetchSummary();
    }
  }, [dateFilter]);

  // CRUD functions
  const handleSubmitExpense = async () => {
    try {
      const method = editingExpense ? 'PUT' : 'POST';
      const url = editingExpense 
        ? `${API_URL}/expenses/${editingExpense.id}`
        : `${API_URL}/expenses`;
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(expenseForm)
      });
      
      if (response.ok) {
        fetchExpenses();
        fetchSummary();
        setExpenseForm({
          amount: '',
          description: '',
          category_id: '',
          date: new Date().toISOString().split('T')[0]
        });
        setEditingExpense(null);
        setCurrentView('dashboard');
      }
    } catch (error) {
      console.error('Error saving expense:', error);
    }
  };

  const handleEditExpense = (expense) => {
    setEditingExpense(expense);
    setExpenseForm({
      amount: expense.amount,
      description: expense.description,
      category_id: expense.category_id,
      date: expense.date
    });
    setCurrentView('add');
  };

  const handleDeleteExpense = async (id) => {
    if (!window.confirm('Are you sure you want to delete this expense?')) return;
    
    try {
      const response = await fetch(`${API_URL}/expenses/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        fetchExpenses();
        fetchSummary();
      }
    } catch (error) {
      console.error('Error deleting expense:', error);
    }
  };

  // If not logged in, show auth form
  if (!token) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-500 rounded-full mb-4">
              <DollarSign className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-800">Expense Tracker</h1>
            <p className="text-gray-600 mt-2">Manage your finances with ease</p>
          </div>
          
          <div className="flex mb-6 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-2 rounded-md transition ${isLogin ? 'bg-white shadow' : ''}`}
            >
              Login
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-2 rounded-md transition ${!isLogin ? 'bg-white shadow' : ''}`}
            >
              Register
            </button>
          </div>
          
          {authError && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
              {authError}
            </div>
          )}
          
          <div className="space-y-4">
            {!isLogin && (
              <input
                type="text"
                placeholder="Full Name"
                value={authForm.name}
                onChange={(e) => setAuthForm({...authForm, name: e.target.value})}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            )}
            <input
              type="email"
              placeholder="Email"
              value={authForm.email}
              onChange={(e) => setAuthForm({...authForm, email: e.target.value})}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <input
              type="password"
              placeholder="Password"
              value={authForm.password}
              onChange={(e) => setAuthForm({...authForm, password: e.target.value})}
              onKeyPress={(e) => e.key === 'Enter' && handleAuth()}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button
              onClick={handleAuth}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 rounded-lg transition"
            >
              {isLogin ? 'Login' : 'Create Account'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Main app UI
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <DollarSign className="w-8 h-8 text-blue-500" />
            <h1 className="text-2xl font-bold text-gray-800">Expense Tracker</h1>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <User className="w-5 h-5 text-gray-600" />
              <span className="text-gray-700">{user?.name}</span>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Navigation */}
        <div className="flex space-x-4 mb-8">
          <button
            onClick={() => setCurrentView('dashboard')}
            className={`px-6 py-2 rounded-lg font-medium transition ${
              currentView === 'dashboard' 
                ? 'bg-blue-500 text-white' 
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            Dashboard
          </button>
          <button
            onClick={() => setCurrentView('expenses')}
            className={`px-6 py-2 rounded-lg font-medium transition ${
              currentView === 'expenses' 
                ? 'bg-blue-500 text-white' 
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            All Expenses
          </button>
          <button
            onClick={() => {
              setEditingExpense(null);
              setExpenseForm({
                amount: '',
                description: '',
                category_id: '',
                date: new Date().toISOString().split('T')[0]
              });
              setCurrentView('add');
            }}
            className={`px-6 py-2 rounded-lg font-medium transition flex items-center space-x-2 ${
              currentView === 'add' 
                ? 'bg-blue-500 text-white' 
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            <PlusCircle className="w-5 h-5" />
            <span>Add Expense</span>
          </button>
        </div>

        {/* Date Filter */}
        <div className="mb-6 flex space-x-2">
          <button
            onClick={() => setDateFilter('all')}
            className={`px-4 py-2 rounded-lg transition ${
              dateFilter === 'all' ? 'bg-blue-500 text-white' : 'bg-white text-gray-700'
            }`}
          >
            All Time
          </button>
          <button
            onClick={() => setDateFilter('week')}
            className={`px-4 py-2 rounded-lg transition ${
              dateFilter === 'week' ? 'bg-blue-500 text-white' : 'bg-white text-gray-700'
            }`}
          >
            Last 7 Days
          </button>
          <button
            onClick={() => setDateFilter('month')}
            className={`px-4 py-2 rounded-lg transition ${
              dateFilter === 'month' ? 'bg-blue-500 text-white' : 'bg-white text-gray-700'
            }`}
          >
            Last 30 Days
          </button>
        </div>

        {/* Dashboard View */}
        {currentView === 'dashboard' && summary && (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-xl shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm">Total Spending</p>
                    <p className="text-3xl font-bold text-gray-800 mt-2">
                      ${summary.totalSpending.toFixed(2)}
                    </p>
                  </div>
                  <DollarSign className="w-12 h-12 text-blue-500" />
                </div>
              </div>
              
              <div className="bg-white rounded-xl shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm">Total Expenses</p>
                    <p className="text-3xl font-bold text-gray-800 mt-2">
                      {summary.expenseCount}
                    </p>
                  </div>
                  <TrendingUp className="w-12 h-12 text-green-500" />
                </div>
              </div>
              
              <div className="bg-white rounded-xl shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm">Avg per Expense</p>
                    <p className="text-3xl font-bold text-gray-800 mt-2">
                      ${summary.expenseCount > 0 ? (summary.totalSpending / summary.expenseCount).toFixed(2) : '0.00'}
                    </p>
                  </div>
                  <Calendar className="w-12 h-12 text-purple-500" />
                </div>
              </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Bar Chart */}
              <div className="bg-white rounded-xl shadow p-6">
                <h3 className="text-lg font-semibold mb-4">Spending by Category</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={summary.byCategory.filter(c => c.total > 0)}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="total" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Pie Chart */}
              <div className="bg-white rounded-xl shadow p-6">
                <h3 className="text-lg font-semibold mb-4">Category Distribution</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={summary.byCategory.filter(c => c.total > 0)}
                      dataKey="total"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      label
                    >
                      {summary.byCategory.filter(c => c.total > 0).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Recent Expenses */}
            <div className="bg-white rounded-xl shadow p-6">
              <h3 className="text-lg font-semibold mb-4">Recent Expenses</h3>
              <div className="space-y-3">
                {expenses.slice(0, 5).map((expense) => (
                  <div key={expense.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{expense.category_icon}</span>
                      <div>
                        <p className="font-medium text-gray-800">{expense.description || 'No description'}</p>
                        <p className="text-sm text-gray-500">{expense.category_name} • {new Date(expense.date).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <span className="text-lg font-bold text-gray-800">${parseFloat(expense.amount).toFixed(2)}</span>
                  </div>
                ))}
                {expenses.length === 0 && (
                  <p className="text-center text-gray-500 py-8">No expenses yet. Add your first expense!</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* All Expenses View */}
        {currentView === 'expenses' && (
          <div className="bg-white rounded-xl shadow">
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-6">All Expenses</h2>
              <div className="space-y-3">
                {expenses.map((expense) => (
                  <div key={expense.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{expense.category_icon}</span>
                      <div>
                        <p className="font-medium text-gray-800">{expense.description || 'No description'}</p>
                        <p className="text-sm text-gray-500">{expense.category_name} • {new Date(expense.date).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <span className="text-lg font-bold text-gray-800">${parseFloat(expense.amount).toFixed(2)}</span>
                      <button
                        onClick={() => handleEditExpense(expense)}
                        className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition"
                      >
                        <Edit2 className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDeleteExpense(expense.id)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ))}
                {expenses.length === 0 && (
                  <p className="text-center text-gray-500 py-8">No expenses found. Add your first expense!</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Add/Edit Expense View */}
        {currentView === 'add' && (
          <div className="bg-white rounded-xl shadow p-6 max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold mb-6">{editingExpense ? 'Edit Expense' : 'Add New Expense'}</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Amount ($)</label>
                <input
                  type="number"
                  step="0.01"
                  value={expenseForm.amount}
                  onChange={(e) => setExpenseForm({...expenseForm, amount: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                <select
                  value={expenseForm.category_id}
                  onChange={(e) => setExpenseForm({...expenseForm, category_id: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select a category</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.icon} {cat.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  value={expenseForm.description}
                  onChange={(e) => setExpenseForm({...expenseForm, description: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows="3"
                  placeholder="Optional description..."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                <input
                  type="date"
                  value={expenseForm.date}
                  onChange={(e) => setExpenseForm({...expenseForm, date: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div className="flex space-x-4">
                <button
                  onClick={handleSubmitExpense}
                  className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 rounded-lg transition"
                >
                  {editingExpense ? 'Update Expense' : 'Add Expense'}
                </button>
                <button
                  onClick={() => {
                    setCurrentView('dashboard');
                    setEditingExpense(null);
                  }}
                  className="px-6 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-3 rounded-lg transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;