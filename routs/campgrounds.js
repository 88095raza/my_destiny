const express=require("express");
const router= express.Router();
const catchAsync= require('../utils/catchAsync');
const Campground = require('../models/campground');
const {isLoggedin,isAuthor,campgroundValidate} = require('../middleware')
const multer  = require('multer')
const {  storage } = require('../cloudinary')
const upload = multer({ storage })
const { cloudinary } = require('../cloudinary')

const mapBoxToken = process.env.MAP_BOX; 
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const geocoder = mbxGeocoding({ accessToken: mapBoxToken });

router.get('/', catchAsync(async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', { campgrounds })
}));

router.get('/new',isLoggedin, (req, res) => {
    res.render('campgrounds/new');
})

router.post('/', isLoggedin,upload.array('imagee'),campgroundValidate, catchAsync(async(req, res, next) => {
   const geoData= await geocoder.forwardGeocode({
        query : req.body.campground.location,
        limit: 1
    }).send()
    const campground = new Campground(req.body.campground);
    campground.geometry=geoData.body.features[0].geometry
    campground.image = req.files.map(f => ({ url: f.path, filename: f.filename }));
    campground.author = req.user._id  //when we create a new campground.logged in author name shown
    await campground.save();
    console.log(campground)
    req.flash('success','Succesfully made a camp ground')
    res.redirect(`/campgrounds/${campground._id}`)
}))






router.get('/:id',catchAsync(async(req, res,) => {
    const campground = await Campground.findById(req.params.id).populate({
        path:'reviews',
        populate:{
            path:'author'
        }
    }).populate('author');
    if (!campground) {
        req.flash('error', 'Cannot find that campground!');
        return res.redirect('/campgrounds');
    }
    res.render('campgrounds/show', { campground });
}));

router.get('/:id/edit',isLoggedin,isAuthor, catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id)
    if (!campground) {
        req.flash('error', 'Cannot find that campground!');
        return res.redirect('/campgrounds');
    }
    res.render('campgrounds/edit', { campground });
}))

router.put('/:id',isLoggedin,isAuthor,upload.array('image'),campgroundValidate, catchAsync(async (req, res) => {
    const { id } = req.params;
    const geoData = await geocoder
      .forwardGeocode({
        query: req.body.campground.location,
        limit: 1,
      })
      .send();
    const campground = await Campground.findByIdAndUpdate(id, {
      ...req.body.campground,
    });
    const imgs = req.files.map((f) => ({ url: f.path, filename: f.filename }));
    campground.image.push(...imgs);
    campground.geometry = geoData.body.features[0].geometry;
    await campground.save();
    if (req.body.deleteImages) {
      for (let filename of req.body.deleteImages) {
        await cloudinary.uploader.destroy(filename);
      }
      await campground.updateOne({
        $pull: { images: { filename: { $in: req.body.deleteImages } } },
      });
    }
    console.log(campground);
    req.flash("success", "Successfully update a campground");
    res.redirect(`/campgrounds/${campground._id}`);
}));

router.delete('/:id', isLoggedin,isAuthor,catchAsync(async (req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    req.flash('success', 'Successfully deleted campground')
    res.redirect('/campgrounds');
}))

module.exports=router