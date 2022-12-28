const express = require("express");
const Income = require("../models/Income");
const Expense = require("../models/Expense");
const auth = require("../middleware/auth");
const moment = require("moment");
const router = express.Router();

router.get("/", async (req, res, next) => {
  console.log(req.query);
  let { start_date, end_date, category, source, months, selectYear } =
    req.query;
  let incomes,
    expenses,
    thisMonthIncome,
    thisMonthExpenses,
    saving,
    month,
    year;
  try {
    const categories = await Expense.find({ user: req.user._id }).distinct(
      "category"
    );
    const sources = await Income.find({ user: req.user._id }).distinct(
      "source"
    );

    if (start_date && end_date && category === "none" && source === "none") {
      month = null;
      start_date = moment(start_date).toISOString();
      end_date = moment(end_date).toISOString();
      incomes = await Income.find({
        date: { $gte: start_date, $lte: end_date },
        user: req.user._id,
      });

      expenses = await Expense.find({
        date: { $gte: start_date, $lte: end_date },
        user: req.user._id,
      });
      thisMonthIncome = await Income.aggregate([
        {
          $match: {
            date: { $gte: new Date(start_date), $lte: new Date(end_date) },
            user: req.user._id,
          },
        },
        {
          $group: { _id: null, totalAmount: { $sum: "$amount" } },
        },
      ]);
      if (thisMonthIncome.length === 0) {
        thisMonthIncome = [{ _id: null, totalAmount: 0 }];
      }
      thisMonthExpenses = await Expense.aggregate([
        {
          $match: {
            date: { $gte: new Date(start_date), $lte: new Date(end_date) },
            user: req.user._id,
          },
        },
        {
          $group: { _id: null, totalAmount: { $sum: "$amount" } },
        },
      ]);
      if (thisMonthExpenses.length === 0) {
        thisMonthExpenses = [{ _id: "null", totalAmount: 0 }];
      }
      saving =
        thisMonthIncome[0].totalAmount - thisMonthExpenses[0].totalAmount;
      console.log("only show expesnses and income between these dates");
    } else if (start_date && end_date && category && source === "none") {
      month = null;
      start_date = moment(start_date).toISOString();
      end_date = moment(end_date).toISOString();
      expenses = await Expense.find({
        date: { $gte: start_date, $lte: end_date },
        category: category,
        user: req.user._id,
      });
      thisMonthExpenses = await Expense.aggregate([
        {
          $match: {
            date: { $gte: new Date(start_date), $lte: new Date(end_date) },
            category,
            user: req.user._id,
          },
        },
        {
          $group: { _id: null, totalAmount: { $sum: "$amount" } },
        },
      ]);
      if (thisMonthExpenses.length === 0) {
        thisMonthExpenses = [{ _id: "null", totalAmount: 0 }];
      }
      console.log("filter by expenses");
    } else if (start_date && end_date && category === "none" && source) {
      month = null;
      start_date = moment(start_date).toISOString();
      end_date = moment(end_date).toISOString();
      incomes = await Income.find({
        date: { $gte: start_date, $lte: end_date },
        source,
        user: req.user._id,
      });
      thisMonthIncome = await Income.aggregate([
        {
          $match: {
            date: { $gte: new Date(start_date), $lte: new Date(end_date) },
            source,
            user: req.user._id,
          },
        },
        {
          $group: { _id: null, totalAmount: { $sum: "$amount" } },
        },
      ]);
      if (thisMonthIncome.length === 0) {
        thisMonthIncome = [{ _id: null, totalAmount: 0 }];
      }
      console.log("filter by incomes");
    } else if (months && selectYear) {
      month = Number(req.query.months);
      year = Number(req.query.selectYear);
      incomes = await Income.aggregate([
        {
          $project: {
            month: { $month: "$date" },
            year: { $year: "$date" },
            source: 1,
            amount: 1,
            date: 1,
            user: 1,
            name: 1,
          },
        },
        { $match: { month: month, year: year, user: req.user._id } },
      ]);

      expenses = await Expense.aggregate([
        {
          $project: {
            month: { $month: "$date" },
            year: { $year: "$date" },
            category: 1,
            amount: 1,
            date: 1,
            user: 1,
            name: 1,
          },
        },
        { $match: { month: month, year: year, user: req.user._id } },
      ]);
      thisMonthIncome = await Income.aggregate([
        {
          $project: {
            month: { $month: "$date" },
            year: { $year: "$date" },
            amount: 1,
            user: 1,
          },
        },
        { $match: { month: month, year: year, user: req.user._id } },
        { $group: { _id: null, totalAmount: { $sum: "$amount" } } },
      ]);

      if (thisMonthIncome.length === 0) {
        thisMonthIncome = [{ _id: null, totalAmount: 0 }];
      }

      thisMonthExpenses = await Expense.aggregate([
        {
          $project: {
            month: { $month: "$date" },
            year: { $year: "$date" },
            amount: 1,
            user: 1,
          },
        },
        { $match: { month: month, year, user: req.user._id } },
        { $group: { _id: null, totalAmount: { $sum: "$amount" } } },
      ]);

      if (thisMonthExpenses.length === 0) {
        thisMonthExpenses = [{ _id: "null", totalAmount: 0 }];
      }

      saving =
        thisMonthIncome[0].totalAmount - thisMonthExpenses[0].totalAmount;
      console.log("filter by months");
    } else if (!start_date && !end_date && category === "none" && source) {
      incomes = await Income.find({ source: source, user: req.user._id });
      console.log("filter by soruce");
    } else if (!start_date && !end_date && category && source === "none") {
      expenses = await Expense.find({ category, user: req.user._id });
      console.log("filter by expense category");
    } else {
      (start_date = null), (end_date = null);
      month = Number(moment(new Date()).format("M"));
      year = Number(moment(new Date()).format("Y"));
      incomes = await Income.aggregate([
        {
          $project: {
            year: { $year: "$date" },
            month: { $month: "$date" },
            amount: 1,
            name: 1,
            source: 1,
            user: 1,
            date: 1,
          },
        },
        { $match: { year: year, month: month, user: req.user._id } },
      ]);

      expenses = await Expense.aggregate([
        {
          $project: {
            year: { $year: "$date" },
            month: { $month: "$date" },
            amount: 1,
            name: 1,
            category: 1,
            user: 1,
            date: 1,
          },
        },
        { $match: { year: year, month: month, user: req.user._id } },
      ]);

      thisMonthIncome = await Income.aggregate([
        {
          $project: {
            year: { $year: "$date" },
            month: { $month: "$date" },
            amount: 1,
            user: 1,
          },
        },
        { $match: { year: year, month: month, user: req.user._id } },
        { $group: { _id: null, totalAmount: { $sum: "$amount" } } },
      ]);

      if (thisMonthIncome.length === 0) {
        thisMonthIncome = [{ _id: null, totalAmount: 0 }];
      }
      thisMonthExpenses = await Expense.aggregate([
        {
          $project: {
            year: { $year: "$date" },
            month: { $month: "$date" },
            amount: 1,
            user: 1,
          },
        },
        { $match: { year: year, month: month, user: req.user._id } },
        { $group: { _id: null, totalAmount: { $sum: "$amount" } } },
      ]);
      if (thisMonthExpenses.length === 0) {
        thisMonthExpenses = [{ _id: "null", totalAmount: 0 }];
      }

      saving =
        thisMonthIncome[0].totalAmount - thisMonthExpenses[0].totalAmount;
      console.log("normal");
    }
    res.status(200).render("dashboard", {
      incomes,
      expenses,
      moment,
      thisMonthIncome,
      thisMonthExpenses,
      saving,
      categories,
      sources,
      month,
      start_date,
      end_date,
    });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
