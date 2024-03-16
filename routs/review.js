const express=require("express");
const router= express.Router({mergeParams:true});
const { reviewSchema } = require('../schema.js');

const Campground = require('../models/campground');
const Review = require('../models/review');

const catchAsync= require('../utils/catchAsync');
const ExpressError= require('../utils/ExpressError.js');
const { isLoggedin,isreviewAuthor } = require("../middleware.js");

const validateReview=(req,res,next)=>{
    const{ error }=reviewSchema.validate(req.body)
    if(error){
        const msg=error.details.map(el =>el.message).join(',')
        throw new ExpressError(msg, 400)
    }else{
        next();
    }
}

router.post('/', validateReview, catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    const review = new Review(req.body.review);
    review.author = req.user._id;
    campground.reviews.push(review);
    await review.save();
    await campground.save();
    req.flash('seccess','created a new reviews')
    res.redirect(`/campgrounds/${campground._id}`);
}))

router.delete('/:reviewId', isLoggedin,isreviewAuthor,catchAsync(async (req, res) => {
    const { id, reviewId } = req.params;
    await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);
    res.redirect(`/campgrounds/${id}`);
}))

module.exports=router;