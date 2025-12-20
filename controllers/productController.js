const mongoose = require('mongoose');
const product = require('../modules/productModel');
const ApiFeatures = require('../utlis/apiFeatures');

exports.gettopratedproduct = async (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-ratingAverage,price';
  next();
};

exports.getAllproducts = async (req, res) => {
  const features = new ApiFeatures(product.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .pagination();
  let products = await features.query;
  if (req.query.name) products = await product.find({ name: req.query.name });
  res.status(200).json({
    status: 'success',
    result: products.length,
    data: { products },
  });
};

exports.createProducts = async (req, res) => {
  const newproduct = await product.create(req.body);
  res.status(201).json({ status: 'success', data: { newproduct } });
};

exports.getoneProduct = async (req, res) => {
  const oneProduct = await product.findById(req.params.id);
  res.status(200).json({
    status: 'success',
    data: { oneProduct },
  });
};

exports.updateProduct = async (req, res) => {
  const updatedProduct = await product.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  );
  res.status(200).json({
    status: 'success',
    data: { updatedProduct },
  });
};

exports.deleteProduct = async (req, res) => {
  const deletedProduct = await product.findByIdAndDelete(req.params.id);
  res.status(204).json({ data: null });
};

exports.getproductsstats = async (req, res) => {
  const stats = await product.aggregate([
    {
      $group: {
        _id: '$category',
        numProducts: { $sum: 1 },
        numratingQuantity: { $sum: '$ratingQuantity' },
        avreagePrice: { $avg: '$price' },
        minprice: { $min: '$price' },
        maxprice: { $max: '$price' },
      }},
     { $sort: { numProducts: -1 }},
  ]);
  res.status(200).json({status:'success',
    result:stats.length,
    data:{stats}
  })
};
