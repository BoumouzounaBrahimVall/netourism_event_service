import { Schema, model } from 'mongoose';

const imageSchema = new Schema({
  imageName: String,
  imagePath: String,
  // Any other fields you want to include
});

const Image = model('Image', imageSchema);
export default Image;
