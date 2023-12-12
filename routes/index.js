import express from 'express';
import Photo from '../models/photo.js';
import {IP} from '../config.js';

const router = express.Router();



const apiResponse = (results,status) => {
    console.log(results);
  return JSON.stringify({ status: status, error: null, message: results });
};


export default function Index(upload) {
    
    // code for image upload endpoint remains unchanged
    router.post('/upload', upload.single('image'), async (req, res) => {
      try {
        const imageName = req.file.filename; 
        const imagePath = req.file.path;
        const lat =req.body.lat;
        const long = req.body.long;
        const postData = {
          lat: lat,
          lon: long
        };
        
        const url = 'http://localhost:3003/locations/add'; // Replace with your actual endpoint URL
        
        fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(postData)
        })
          .then(response => {
            if (!response.ok) {
              throw new Error('Network response was not ok');
            }
            return response.json();
          })
          .then(data => {
            console.log('Place added successfully:', data.message);
            // Handle success, if needed
          })
          .catch(error => {
            console.error('There was a problem adding the place:', error.message);
            // Handle error appropriately
          });
        // Save image details to MongoDB
        const newImage = new Photo({ imageName, imagePath });
        await newImage.save();
  
        res.send(apiResponse({status:200, message: req.file.path }));
      } catch (err) {
        res.status(500).send(apiResponse({status:500, message: 'Error uploading image' }));
      }
    });
    
    // New endpoint to get images by lat-long pattern
    router.get('/images/:lat/:long', async (req, res) => {
      try {
        
        const { lat, long } = req.params;
        // Fetch images with names that match the lat-long pattern
        const images = await Photo.find({
          imageName: { $regex: `${long}-${lat}-`, $options: 'i' }, // Using regex to match the pattern
        });
  
        if (images.length === 0) {
          return res.send(apiResponse({status:200, message: 'No images found for this lat-long' }));
        }
  
        const imagePaths = images.map((image) => 'http://'+IP+':8000/uploads/'+image.imageName);
        res.send(apiResponse({ imagePaths }));
      } catch (err) {
        res.status(500).send(apiResponse({status:500, message: 'Error fetching images' }));
      }
    });


    router.get('/images/:lat/:long/:dist', async (req, res) => {
      try {
        
        const { lat, long, dist } = req.params;

        const location_response = await fetch(`http://localhost:3003/locations/place/${lat}/${long}/${dist}`);
       
        let locations=[];
        locations = await  location_response.json();
        if(locations.length===0){
          return res.send(apiResponse({status:401, message: 'No location around found for this lat-long' }));

        }
        const regexQueries = [];
        // Construct regex queries for each pair of latitude and longitude
        for (let i = 0; i < locations.length; i++) {
          regexQueries.push({
            imageName: { $regex: `${locations[i].point.coordinates[1]}-${locations[i].point.coordinates[0]}-`, $options: 'i' }
          });
        }
       
        // Fetch images with names that match the lat-long pattern
        // Combine all regex queries using $or operator
        let images=[];
        if(regexQueries.length!==0){
          images = await Photo.find({ $or: regexQueries });
        }
  
        if (images.length === 0) {
          return res.send(apiResponse({status:401, message: 'No images found for this lat-long' }));
        }
  
        const imagePaths = images.map((image) => 'http://'+IP+':8000/uploads/'+image.imageName);
        res.send(apiResponse({status:200, imagePaths }));
      } catch (err) {
        console.log(err);
        res.status(500).send(apiResponse({status:500, message: 'Error fetching images' }));
      }
    });
    return router;
  };

//export default  indexRouter(upload);

