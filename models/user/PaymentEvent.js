const mongoose = require("mongoose");
const {
  defaultStringConfig,
  nonEmptyArrayValidator,
  defaultPriceProperty,
  defaultCurrencyProperty,
  getAlphaNumID,
  defaultBooleanConfig,
} = require(`../../utils/mongoose`);
// const defaultPaymentStatus="pending";
const PaymentEventSchema = new mongoose.Schema(
  {
    payment_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: `payment`,
      required: true,
    },
    payment_status: {
      type: String,
      enum: [`pending`, `paid`, `failed`, `confirmed`, `expired`],
      required: true,
      default: "pending",
    },
    payment_intent: {},
  },
  { timestamps: true }
);
module.exports = mongoose.model("payment_event", PaymentEventSchema);