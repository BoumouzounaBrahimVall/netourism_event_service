import express from 'express';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';
import multer from 'multer';
import path from 'path';
import Index from './routes/index.js';
import {IP} from './config.js';
const app = express();
const router = express.Router();
import { registerWithEureka } from './eureka-helper.js';

//const eurekaHelper = require('./eureka-helper');
// MongoDB Connection Setup
mongoose
  .connect(`mongodb://root:rootpassword@${IP}/demodb?authSource=admin&directConnection=true`, {
   // useNewUrlParser: true,
   // useUnifiedTopology: true,
  })
  .then(console.log('Connected to database'))
  .catch((err) => console.log("here we are : "+err));


// Middleware
app.use(bodyParser.json());
const __dirname = path.resolve();
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads',express. static('uploads'));

// Multer Setup
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads');
  },
  filename: function (req, file, cb) {
    const lat = req.body.lat;
    const long = req.body.long;
    cb(null, lat + '-' + long + '-' + Date.now()+ '-' + file.originalname);
  },
});
const upload = multer({ storage: storage });

// Routes
//const indexRouter = require('./routes/index');
app.use('/events', Index(upload));

// Server
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});

//registerWithEureka('event-service', 8000);




