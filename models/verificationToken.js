const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const bcrypt = require("bcrypt");

const verificationTokenSchema = new Schema({
  owner: { type: Schema.Types.ObjectId, ref: "User", required: true },
  token: { type: String, required: true },
  createdAt: { type: Date, expires: 3600, default: Date.now() },
});

verificationTokenSchema.pre("save", function (next) {
  if (this.token && this.isModified("token")) {
    bcrypt.hash(this.token, 10, (err, hashed) => {
      if (err) return next(err);
      this.token = hashed;
      return next();
    });
  } else {
    return next();
  }
});

verificationTokenSchema.methods.verifyToken = function (token, cb) {
  bcrypt.compare(token, this.token, (err, result) => {
    return cb(err, result);
  });
};

module.exports = mongoose.model("VerificationToken", verificationTokenSchema);
