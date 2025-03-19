import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

// Expenses API
export const fetchExpenses = async () => {
    try {
        const response = await axios.get(`${API_URL}/expenses`);
        return response.data;
    } catch (error) {
        console.error('Error fetching expenses:', error);
        throw error;
    }
};

export const fetchExpenseById = async (id) => {
    try {
        const response = await axios.get(`${API_URL}/expenses/${id}`);
        return response.data;
    } catch (error) {
        console.error(`Error fetching expense with id ${id}:`, error);
        throw error;
    }
};

export const createExpense = async (expenseData) => {
    try {
        const response = await axios.post(`${API_URL}/expenses`, expenseData);
        return response.data;
    } catch (error) {
        console.error('Error creating expense:', error);
        throw error;
    }
};

export const updateExpense = async (id, expenseData) => {
    try {
        const response = await axios.put(`${API_URL}/expenses/${id}`, expenseData);
        return response.data;
    } catch (error) {
        console.error(`Error updating expense with id ${id}:`, error);
        throw error;
    }
};

export const deleteExpense = async (id) => {
    try {
        const response = await axios.delete(`${API_URL}/expenses/${id}`);
        return response.data;
    } catch (error) {
        console.error(`Error deleting expense with id ${id}:`, error);
        throw error;
    }
};

export const fetchExpenseStats = async () => {
    try {
        const response = await axios.get(`${API_URL}/expenses/stats/summary`);
        return response.data;
    } catch (error) {
        console.error('Error fetching expense statistics:', error);
        throw error;
    }
};

export const fetchMonthlyExpenses = async () => {
    try {
        const response = await axios.get(`${API_URL}/expenses/stats/monthly`);
        return response.data;
    } catch (error) {
        console.error('Error fetching monthly expenses:', error);
        throw error;
    }
};

// Categories API
export const fetchCategories = async () => {
    try {
        const response = await axios.get(`${API_URL}/categories`);
        return response.data;
    } catch (error) {
        console.error('Error fetching categories:', error);
        throw error;
    }
};

export const createCategory = async (categoryData) => {
    try {
        const response = await axios.post(`${API_URL}/categories`, categoryData);
        return response.data;
    } catch (error) {
        console.error('Error creating category:', error);
        throw error;
    }
};

export const updateCategory = async (id, categoryData) => {
    try {
        const response = await axios.put(`${API_URL}/categories/${id}`, categoryData);
        return response.data;
    } catch (error) {
        console.error(`Error updating category with id ${id}:`, error);
        throw error;
    }
};

export const deleteCategory = async (id) => {
    try {
        const response = await axios.delete(`${API_URL}/categories/${id}`);
        return response.data;
    } catch (error) {
        console.error(`Error deleting category with id ${id}:`, error);
        throw error;
    }
};