import axios from 'axios';

const API_URL = 'http://localhost:5001/api'; // Use the port your server is running on

// Create axios instance
const api = axios.create({
    baseURL: API_URL
});

// Add request interceptor to include token with every request
api.interceptors.request.use(
    config => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    error => {
        return Promise.reject(error);
    }
);

// Add response interceptor to handle 401 errors
api.interceptors.response.use(
    response => response,
    error => {
        if (error.response && error.response.status === 401) {
            // Clear token and redirect to login if unauthorized
            localStorage.removeItem('token');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// Auth API
export const login = async (email, password) => {
    try {
        const response = await api.post('/users/login', { email, password });
        return response.data;
    } catch (error) {
        console.error('Login error:', error);
        throw error;
    }
};

export const register = async (name, email, password) => {
    try {
        const response = await api.post('/users/register', { name, email, password });
        return response.data;
    } catch (error) {
        console.error('Registration error:', error);
        throw error;
    }
};

export const getProfile = async () => {
    try {
        const response = await api.get('/users/profile');
        return response.data;
    } catch (error) {
        console.error('Error fetching profile:', error);
        throw error;
    }
};

export const updateProfile = async (userData) => {
    try {
        const response = await api.put('/users/profile', userData);
        return response.data;
    } catch (error) {
        console.error('Error updating profile:', error);
        throw error;
    }
};

// Expenses API
export const fetchExpenses = async () => {
    try {
        const response = await api.get('/expenses');
        return response.data;
    } catch (error) {
        console.error('Error fetching expenses:', error);
        throw error;
    }
};

export const fetchExpenseById = async (id) => {
    try {
        const response = await api.get(`/expenses/${id}`);
        return response.data;
    } catch (error) {
        console.error(`Error fetching expense with id ${id}:`, error);
        throw error;
    }
};

export const createExpense = async (expenseData) => {
    try {
        const response = await api.post('/expenses', expenseData);
        return response.data;
    } catch (error) {
        console.error('Error creating expense:', error);
        throw error;
    }
};

export const updateExpense = async (id, expenseData) => {
    try {
        const response = await api.put(`/expenses/${id}`, expenseData);
        return response.data;
    } catch (error) {
        console.error(`Error updating expense with id ${id}:`, error);
        throw error;
    }
};

export const deleteExpense = async (id) => {
    try {
        const response = await api.delete(`/expenses/${id}`);
        return response.data;
    } catch (error) {
        console.error(`Error deleting expense with id ${id}:`, error);
        throw error;
    }
};

// Add or update these functions in your api.js file if needed

export const fetchExpenseStats = async () => {
    try {
        const response = await api.get('/expenses/stats/summary');
        return response.data;
    } catch (error) {
        console.error('Error fetching expense statistics:', error);
        return { totalExpenses: 0, topCategory: null };
    }
};

export const fetchMonthlyExpenses = async () => {
    try {
        const response = await api.get('/expenses/stats/monthly');
        return response.data;
    } catch (error) {
        console.error('Error fetching monthly expenses:', error);
        return [];
    }
};

// Categories API
export const fetchCategories = async () => {
    try {
        const response = await api.get('/categories');
        return response.data;
    } catch (error) {
        console.error('Error fetching categories:', error);
        throw error;
    }
};

export const createCategory = async (categoryData) => {
    try {
        const response = await api.post('/categories', categoryData);
        return response.data;
    } catch (error) {
        console.error('Error creating category:', error);
        throw error;
    }
};

export const updateCategory = async (id, categoryData) => {
    try {
        const response = await api.put(`/categories/${id}`, categoryData);
        return response.data;
    } catch (error) {
        console.error(`Error updating category with id ${id}:`, error);
        throw error;
    }
};

export const deleteCategory = async (id) => {
    try {
        const response = await api.delete(`/categories/${id}`);
        return response.data;
    } catch (error) {
        console.error(`Error deleting category with id ${id}:`, error);
        throw error;
    }
};

// Budget API
export const fetchBudgets = async () => {
    try {
        const response = await api.get('/budgets');
        return response.data;
    } catch (error) {
        console.error('Error fetching budgets:', error);
        throw error;
    }
};

export const fetchBudgetsByMonth = async (month) => {
    try {
        const response = await api.get(`/budgets/${month}`);
        return response.data;
    } catch (error) {
        console.error(`Error fetching budgets for month ${month}:`, error);
        throw error;
    }
};

export const createOrUpdateBudget = async (budgetData) => {
    try {
        const response = await api.post('/budgets', budgetData);
        return response.data;
    } catch (error) {
        console.error('Error saving budget:', error);
        throw error;
    }
};

export const deleteBudget = async (id) => {
    try {
        const response = await api.delete(`/budgets/${id}`);
        return response.data;
    } catch (error) {
        console.error(`Error deleting budget with id ${id}:`, error);
        throw error;
    }
};

export const fetchBudgetAnalysis = async (month) => {
    try {
        const response = await api.get(`/budgets/analysis/${month}`);
        return response.data;
    } catch (error) {
        console.error(`Error fetching budget analysis for ${month}:`, error);
        throw error;
    }
};


// Add or modify this in src/services/api.js

export const fetchTotalBudgetAmount = async () => {
    try {
        // Fetch the current month's budgets
        const now = new Date();
        const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

        const budgets = await fetchBudgetsByMonth(currentMonth);

        // Calculate total budget
        const totalAmount = budgets.reduce((sum, budget) => sum + parseFloat(budget.amount || 0), 0);

        return totalAmount;
    } catch (error) {
        console.error('Error calculating total budget:', error);
        return 0;  // Return 0 if there's an error, not 2000
    }
};