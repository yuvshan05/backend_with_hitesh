//multer ke through file ko local server pe rakh denge next step mein cloudinary ka use krke local server se lenge and upload kr denge wese v kr skte hai lekin production grade mein aese hi hota hai 
//clodinary file ka path deta hai and phir usko local server se remove kr denge
//fs (file system) node ke saath aata hai file system manage karta hai open read write etc mainly need for path
//unlink ka mtlb hota hai file ko unlink kr do file system se aese hi koi file remove hoti hai 
 
import {v2 as cloudinary} from "cloudinary"
import fs from "fs"


// Configuration
cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploadOnCloudinary = async (localFilePath)=> {
    try {
        if(!localFilePath) return null
        //upload file on cloudinary
        const response = await cloudinary.uploader.upload(localFilePath,{
            resource_type:"auto"
        })
        //file has been uploaded successfully
        //console.log("file has been uploaded successfully " ,response.url);
        fs.unlinkSync(localFilePath);
        return response;
    } catch (error) {
        fs.unlinkSync(localFilePath)//remove the locally saved temporary file as the upload operation got failed 
        return null;
    }
}

export {uploadOnCloudinary};
