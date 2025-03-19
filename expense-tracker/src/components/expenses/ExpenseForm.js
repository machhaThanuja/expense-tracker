import React, { useState, useEffect } from 'react';
import { fetchCategories, createExpense, updateExpense } from '../../services/api';
import styles from './ExpenseForm.module.css';

const ExpenseForm = ({ expense = null, onSave, onCancel }) => {
    const [formData, setFormData] = useState({
        description: '',
        amount: '',
        category: '',
        date: new Date().toISOString().split('T')[0]
    });
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [categoryLoading, setCategoryLoading] = useState(true);

    // Load categories when component mounts
    // Update this useEffect in ExpenseForm.js
    useEffect(() => {
        const getCategories = async () => {
            try {
                setCategoryLoading(true);
                const data = await fetchCategories();
                console.log('Categories loaded:', data);
                setCategories(data);

                // Set default category if available and none is already set
                if (data.length > 0 && !formData.category) {
                    setFormData(prev => ({ ...prev, category: data[0].name }));
                }
                setCategoryLoading(false);
            } catch (err) {
                console.error('Error loading categories:', err);
                setError('Failed to load categories. Please try again.');
                setCategoryLoading(false);
            }
        };

        getCategories();

        // If editing an expense, populate form with expense data
        if (expense) {
            setFormData({
                description: expense.description,
                amount: expense.amount.toString(),
                category: expense.category,
                date: expense.date.split('T')[0]
            });
        }
    }, [expense, formData.category]); // Add formData.category to dependency array

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            // Validate form
            if (!formData.description || !formData.amount || !formData.category || !formData.date) {
                throw new Error('Please fill out all fields');
            }

            const expenseData = {
                ...formData,
                amount: parseFloat(formData.amount)
            };

            let result;
            if (expense) {
                // Update existing expense
                result = await updateExpense(expense.id, expenseData);
            } else {
                // Create new expense
                result = await createExpense(expenseData);
            }

            onSave(result);
            setLoading(false);
        } catch (err) {
            console.error('Error saving expense:', err);
            setError(err.message || 'Failed to save expense. Please try again.');
            setLoading(false);
        }
    };

    return (
        <div className={styles.formContainer}>
            <h2 className={styles.formTitle}>{expense ? 'Edit Expense' : 'Add New Expense'}</h2>

            {error && <div className={styles.errorMessage}>{error}</div>}

            <form onSubmit={handleSubmit} className={styles.form}>
                <div className={styles.formGroup}>
                    <label htmlFor="description">Description</label>
                    <input
                        type="text"
                        id="description"
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        placeholder="What did you spend on?"
                        required
                    />
                </div>

                <div className={styles.formGroup}>
                    <label htmlFor="amount">Amount</label>
                    <input
                        type="number"
                        id="amount"
                        name="amount"
                        value={formData.amount}
                        onChange={handleChange}
                        placeholder="0.00"
                        step="0.01"
                        min="0"
                        required
                    />
                </div>

                <div className={styles.formGroup}>
                    <label htmlFor="category">Category</label>
                    {categoryLoading ? (
                        <div className={styles.loadingText}>Loading categories...</div>
                    ) : (
                        <select
                            id="category"
                            name="category"
                            value={formData.category}
                            onChange={handleChange}
                            required
                        >
                            <option value="">Select a category</option>
                            {categories.map(category => (
                                <option key={category.id} value={category.name}>
                                    {category.name}
                                </option>
                            ))}
                        </select>
                    )}
                </div>

                <div className={styles.formGroup}>
                    <label htmlFor="date">Date</label>
                    <input
                        type="date"
                        id="date"
                        name="date"
                        value={formData.date}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className={styles.formActions}>
                    <button
                        type="button"
                        className={styles.cancelButton}
                        onClick={onCancel}
                        disabled={loading}
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className={styles.submitButton}
                        disabled={loading || categoryLoading}
                    >
                        {loading ? 'Saving...' : (expense ? 'Update Expense' : 'Add Expense')}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ExpenseForm;