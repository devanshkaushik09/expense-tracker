const xlsx = require('xlsx');
const Income = require("../models/Income")
const path = require("path");
const fs = require("fs");

// Add Income Source
exports.addIncome = async (req, res) => {
    const userId = req.user.id;
    
    try {
        const { icon, source, amount, date } = req.body;
        
        if (!source || !amount || !date) {
            return res.status(400).json({ message: "All fields are required" });
        }
        
        const newIncome = new Income({
            userId,
            icon,
            source,
            amount,
            date: new Date(date)
        });
        
        await newIncome.save();
        res.status(200).json(newIncome);
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

// Get all incomes for a user
exports.getAllIncome = async (req, res) => {
    const userId = req.user.id;
    try {
        const incomes = await Income.find({ userId}).sort({ date: -1 });
        res.status(200).json(incomes);
    } catch (error) {
        res.status(500).json({ message: "Error fetching incomes", error: error.message });
    }
};

// Delete income by ID
exports.deleteIncome = async (req, res) => {
    try {
        await Income.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: "Income deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error deleting income", error: error.message });
    }
};

// Download Excel
exports.downloadIncomeExcel = async (req, res) => {
    const userId = req.user.id;
    try {
        const income = await Income.find({ userId }).sort({ date: -1 });

        // Prepare data for Excel
        const data = income.map((item) => ({
            Source: item.source,
            Amount: item.amount,
            Date: item.date,
        }));

        const wb = xlsx.utils.book_new();
        const ws = xlsx.utils.json_to_sheet(data);
        xlsx.utils.book_append_sheet(wb, ws, "Income");
        xlsx.writeFile(wb, 'income_details.xlsx');
        res.download('income_details.xlsx');
    } catch (error) {
        res.status(500).json({ message: "Server Error" });
    }
}


