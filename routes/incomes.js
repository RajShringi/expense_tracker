const express = require("express");
const router = express.Router();
const Income = require("../models/Income");
const Expense = require("../models/Expense");
const auth = require("../middleware/auth");
var moment = require("moment");

router.use(auth.isUserLogged);

router.get("/new", (req, res, next) => {
  res.render("addIncome");
});

router.post("/", async (req, res, next) => {
  try {
    req.body.user = req.user._id;
    req.body.source =
      req.body.source[0].toUpperCase() + req.body.source.slice(1);
    const income = await Income.create(req.body);
    res
      .status(200)
      .redirect(
        `/dashboards?months=${moment(income.date).format(
          "M"
        )}?selectYear=${moment(income.date).format("YYYY")}`
      );
  } catch (err) {
    return next(err);
  }
});

router.get("/:id/edit", async (req, res, next) => {
  try {
    const id = req.params.id;
    const income = await Income.findById(id);
    res.status(200).render("editIncome", { income, moment });
  } catch (err) {
    return next(err);
  }
});

router.post("/:id", async (req, res, next) => {
  try {
    const id = req.params.id;
    const findIncome = await Income.findById(id);
    if (String(findIncome.user) === String(req.user._id)) {
      const income = await Income.findByIdAndUpdate(id, req.body);
      res
        .status(200)
        .redirect(
          `/dashboards?months=${moment(income.date).format(
            "M"
          )}?selectYear=${moment(income.date).format("YYYY")}`
        );
    } else {
      res.redirect("/login");
    }
  } catch (error) {
    return next(error);
  }
});

router.get("/:id/delete", async (req, res, next) => {
  try {
    const id = req.params.id;
    const findIncome = await Income.findById(id);
    if (String(findIncome.user) === String(req.user._id)) {
      const income = await Income.findByIdAndDelete(id);
      res
        .status(200)
        .redirect(
          `/dashboards?months=${moment(income.date).format(
            "M"
          )}?selectYear=${moment(income.date).format("YYYY")}`
        );
    } else {
      res.redirect("/login");
    }
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
