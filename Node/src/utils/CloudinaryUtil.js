const cloundinary = require("cloudinary").v2;


const uploadFileToCloudinary = async (file) => {

    //conif
        cloundinary.config({
        cloud_name:"desm0vlcb",
        api_key:"452832321263661",
        api_secret:"zCO0BvZ0pj8yq9qWAUnXAdZCDNE"
    })

    const cloundinaryResponse = await cloundinary.uploader.upload(file.path);
    return cloundinaryResponse;



};
module.exports = {
    uploadFileToCloudinary
}