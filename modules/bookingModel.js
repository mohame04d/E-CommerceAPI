const mongoose=require('mongoose');
const product = require('./productModel');
const { path } = require('../app');
const bookingSchema=new mongoose.Schema({
    product:[{
        type:mongoose.Schema.ObjectId,
        ref:'product',
        required:[true,'booking must belong to a product']
    }],
    user:{
        type:mongoose.Schema.ObjectId,
        ref:'user',
        required:[true,'booking must belong to a user']
    },
    paymentMethod:{
        type:String,
        default:'card'
    },
    price:{type:Number,
        required:[true,'booking must have a price']
    },
    createdAt:{
        type:Date,
        default:Date.now()
    },
    paymentStaus:{
        type:String,
        default:'paid'
    }
})
bookingSchema.pre(/^find/,function(next){
    this.populate('user').populate({
        path:'product',
        select:'name'
    })
    next()
})
const booking=mongoose.model('booking',bookingSchema);
module.exports=booking;