const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const incomeSchema = new Schema(
  {
    name: { type: String, required: true },
    source: { type: String, required: true },
    amount: { type: Number, required: true },
    date: { type: Date, default: Date.now(), required: true },
    user: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Income", incomeSchema);
