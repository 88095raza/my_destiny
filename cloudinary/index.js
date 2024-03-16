const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

cloudinary.config({
    cloud_name: process.env.CLOUDINART_CLOUD_NAME ,
    api_key:process.env.CLOUDINART_KEY,
    api_secret:process.env.CLOUDINART_SECRET
})

const storage=  new CloudinaryStorage({
    cloudinary,
    params: {
    folder: 'camp',
    allowedFormats:['jpeg','png','jpg'],
    transformation: [
        { width: 400, height: 300, gravity: "auto", crop: "fill" },
    ],
    format:'jpg'
    }
})
module.exports = {
cloudinary,
storage
}