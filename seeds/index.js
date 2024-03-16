const mongoose = require('mongoose');
const cities = require('./cities');
const { places, descriptors } = require('./seedHelpers');
const Campground = require('../models/campground');

mongoose.connect('mongodb://127.0.0.1:27017/campi', {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true
});

const db = mongoose.connection;

db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});

const sample = array => array[Math.floor(Math.random() * array.length)];


const seedDB = async () => {
    await Campground.deleteMany({});
    for (let i = 0; i < 200; i++) {
        const random1000 = Math.floor(Math.random() * 1000);
        const price=Math.floor(Math.random() * 20)+10
        const camp = new Campground({
            author:'65c667462e4c4534404229e9',
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            title: `${sample(descriptors)} ${sample(places)}`,
            image: 'https://source.unsplash.com/collection/483251',
            description:'Lorem ipsum dolor sit amet consectetur adipisicing elit',
            price,
            geometry:{
                type:"Point",
                coordinates:[
                cities[random1000].longitude,
                cities[random1000].latitude,
                ]
            },
            image: [
                {
                    url: 'https://res.cloudinary.com/dlam59idj/image/upload/v1709558615/camp/qh1vrfrfrgjhees7xeqt.jpg',
                    filename: 'camp/qh1vrfrfrgjhees7xeqt'
                },
                {
                    url: 'https://res.cloudinary.com/dlam59idj/image/upload/v1709558644/camp/uxw4mvtnh6xtmevnip96.jpg',
                  filename: 'camp/uxw4mvtnh6xtmevnip96'
                }
            ]
        })
        await camp.save();
    }
}

seedDB().then(() => {
    mongoose.connection.close();
})

    