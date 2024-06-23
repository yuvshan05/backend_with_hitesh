import mongoose,{Schema} from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";
//ye aggregate kiya krta hia ki limited number of videos ko hi ek page pe rakhta hai taaki alag alg page pe ho

const videoSchema = new Schema({
    videoFile:{
        type:String,//cloudinary URL
        required:true
    },
    thumbnail:{
        type:String,//cloudinary URL
        required:true
    },
    title:{
        type:String,
        required:true
    },
    description:{
        type:String,
        required:true
    },
    duration:{
        type:Number,
        required:true
    },
    views:{
        type:Number,
        default:0
    },
    isPublished:{
        type:Boolean,
        default:true
    },
    owner:{
        type:Schema.Types.ObjectId,
        ref:"User"
    }
},{timestamps:true});

videoSchema.plugin(mongooseAggregatePaginate) 

export const Video = mongoose.model("Video",videoSchema);