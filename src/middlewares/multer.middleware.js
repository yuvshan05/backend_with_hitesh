//jaa rahe ho to mil ke jaana ===middleware ka kehna hai 
//multer agar sikhna hai to uska documentation to padhna hi padega to padho
//dekho multer ka simple kaam hota hai files ko local storage mein upload karna jo aa rhaa hai 
//cb ka matlab hai call back reference to line 7
//dekho jese ki line 12 mein original hi upload kr diye hai ye galat hai jese ki ho skta hai yuvraj name se 10 file aa jaye to ye replace ho jayegi better hai orginal mein na rakho jo code by default tha uska use kro
import multer from "multer";
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, "./public/temp")
    },
    filename: function (req, file, cb) {
      cb(null, file.originalname)
    }
  })
  
export const upload = multer({ 
    storage,
 })