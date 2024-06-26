// Example product model using Mongoose

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const productSchema = new Schema({
  name: { type: String, required: true },
  size: { type: String },
  price: { type: String },
  imageUrl: { type: String },
  // Add more fields as needed based on your product data
});

const ProductModel = mongoose.model('Product', productSchema);

module.exports = ProductModel;
