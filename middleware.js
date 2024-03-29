const { campgroundSchema } = require('./schema.js');
const ExpressError= require('./utils/ExpressError');
const Campground = require('./models/campground');
const Review = require('./models/review.js');

module.exports.isLoggedin = (req,res,next)=>{
    if(!req.isAuthenticated()){
        req.flash('error','You must be signed in first')
        return res.redirect('/login')
    }
    next()
}

module.exports.campgroundValidate=(req,res,next) =>{

    const { error }=campgroundSchema.validate(req.body)
    if(error){
        const msg=error.details.map(el =>el.message).join(',')
        throw new ExpressError(msg, 400)
    }else{
        next();
    }
}


module.exports.isAuthor = async(req,res,next)=>{
const { id } = req.params;
const campground=await Campground.findById(id)
if(!campground.author.equals(req.user._id)){
    req.flash('error','you do not have permission to do that')
   return res.redirect(`/camgrounds/${id}`)
}
next();
}

module.exports.isreviewAuthor = async(req,res,next)=>{
const {id, reviewId } = req.params;
const review=await Review.findById(reviewId)
if(!review.author.equals(req.user._id)){
    req.flash('error','you do not have permission to do that')
   return res.redirect(`/camgrounds/${id}`)
}
next();
}