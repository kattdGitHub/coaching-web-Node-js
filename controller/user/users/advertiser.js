const User = require('../../../models/user/User');
const Advertisement = require('../../../models/user/Advertisement');
const Instruction = require('../../../models/user/Instructions');
const EarnerScreen = require('../../../models/user/Institute');
const screenAlot = require('../../../models/user/screenAlot');
const geoapifyApiKey = process.env.GEOAPIFY_KEY;


const NodeGeocoder = require('node-geocoder');
const axios = require('axios');
const mongoose = require('mongoose');
const { ObjectId } = require('mongoose').Types;

// Configure geocoder
const geocoderOptions = {
  provider: 'openstreetmap' // You can use other providers like 'google', 'here', etc.
};

const geocoder = NodeGeocoder(geocoderOptions);

/**
 * Handles the sign-up process. 
 * @param {*} req - The request object.
 * @param {*} res - The response object.
 * @param {*} next - The next middleware function in the stack.
 * @returns {Promise<void>} A Promise that resolves when the sign-up process is complete.
 */


/**************** Create Advertisement *************/
async function createAdvertisement(req, res, next) {
  try {
      const userId = req.userId; // Assuming userId is extracted from the authentication token middleware
    let photos = req.files.photos;
    let video = req.files.video;

    let veedio
    if(video){
    let videos =  video[0]?.path;
    if(videos){
      veedio=videos
    }
  }
  else{
    veedio=null
  }

  if(photos){
     photoPaths = photos.map(photo => photo.path); // Extract paths from photo files
  }
  else{
     photoPaths = []; 
  }
   
    // Check if userId is valid
      if (!userId) {
          return res.status(401).json({ statusCode: 401, message: "Invalid authentication token" });
      }

      const { name, description, campaign_link } = req.body;

      // Validate fields for signup
      const requiredFields = validateFields({ name, description, campaign_link });

      // If any errors exist, return them
      if (requiredFields && requiredFields.length > 0) {
          return res.status(404).json({ statusCode: 404, message: requiredFields.join(", ") });
      }

      // Create a new Data entry
      const newData = new Advertisement({ userId, name, description, campaign_link,video:veedio,status:'pending' , photos:photoPaths});

      // Save the Data to the database
      const savedData = await newData.save();

      // Send success response with token
      return res.status(200).json({ statusCode: 200, message: "Data added successfully", data: savedData }); // Created
  } catch (error) {
      console.error("Caught error:", error); // Log the caught error
      return res.status(500).json({ statusCode: 500,error 
  })
}
}

/**************** List of Advertisements************/
async function advertisementList(req, res, next) {
  try {
    const userId = req.userId; // Assuming userId is extracted from the authentication token middleware

    // Check if userId is valid
    if (!userId) {
      return res.status(401).json({ statusCode: 401, message: "Invalid authentication token" });
    }

    // Pagination parameters
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10; // Default limit is 10

    // Calculate skip
    const skip = (page - 1) * limit;

    // Find the data with the given userId, applying pagination
    const data = await Advertisement.find({ userId }).skip(skip).limit(limit);

    // Count total number of advertisements for the given userId
    const totalAdCount = await Advertisement.countDocuments({ userId });

    // Calculate total number of pages
    const totalPages = Math.ceil(totalAdCount / limit);

    // Send success response with the data, current page number, and total number of pages
    return res.status(200).json({ 
      statusCode: 200, 
      message: "Data retrieved successfully", 
      page: page, 
      totalPages: totalPages,
      data: data 
    });
  } catch (error) {
    console.error("Caught error:", error); // Log the caught error
    return res.status(500).json({ statusCode: 500, error });
  }
}

/**************** Detail of Advertisement *************/
async function AdvertisementDetail(req, res, next) {
  try {
    const userId = req.userId; // Assuming userId is extracted from the authentication token middleware
    const requestId = req.query.id; // Assuming the request id is passed in the URL parameters

    // Check if userId is valid
    if (!userId) {
      return res.status(401).json({ statusCode: 401, message: "Invalid authentication token" });
    }

    // Check if requestId is valid
    if (!requestId) {
      return res.status(401).json({ statusCode: 401, message: "Invalid Advertisement Id" });
    }

      // Find the data with the given _id and userId
    const data = await Advertisement.findOne({ _id: requestId, userId });

    // Check if data exists
    if (!data) {
      return res.status(404).json({ statusCode: 404, message: "Data not found for the given Advertisement Id" });
    }

    // Send success response with the data
    return res.status(200).json({ statusCode: 200, message: "Data retrieved successfully", data: data });
  } catch (error) {
    console.error("Caught error:", error); // Log the caught error
    return res.status(500).json({ statusCode: 500, error });
  }
}


//**************************** get-screen-according-to-distance **********************************/
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radius of the Earth in kilometers
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
          Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
          Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c; // Distance in kilometers
  return d; // Distance in kilometers
}

// Function to convert degrees to radians
function deg2rad(deg) {
  return deg * (Math.PI/180);
}


//**************************** alot-screen **********************************/
async function alotScreen(req, res, next) {
  try {
    const advertisementId = req.query.advertisement_id;
    // Pagination parameters
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10; // Default limit is 10

    // Extract latitude and longitude from request query parameters
    const latitude = parseFloat(req.query.latitude);
    const longitude = parseFloat(req.query.longitude);

    if (isNaN(latitude) || isNaN(longitude)) {
      return res.status(400).json({ statusCode: 400, message: "Latitude and longitude are required." });
    }

    // Find all data with conditions
    const dataCount = await EarnerScreen.countDocuments(); // Count total number of screens
    const totalPages = Math.ceil(dataCount / limit); // Calculate total number of pages

    let advertisement = await Advertisement.findById(advertisementId);
    let starttime = advertisement?.start_time;
    let endtime = advertisement?.end_time;

    const data = await EarnerScreen.find().populate({
      path: 'ismatch',
      select: { start_time: 1, end_time: 1 }
    });

    // Prepare array to store screens with distance and ismatch
    let dataWithDistanceAndMatch = [];

    // Calculate distance and include ismatch for each screen
    data.forEach(screen => {
      const distance = calculateDistance(latitude, longitude, screen.latitude, screen.longitude);
      if (distance < 500) { // Only include screens with distance less than 50
        const screenWithDistanceAndMatch = { ...screen.toObject(), distance: distance, ismatch: screen.ismatch };
        dataWithDistanceAndMatch.push(screenWithDistanceAndMatch);
      }
    });

    // Filter screens with different cases
    const filteredScreens1 = [];
    dataWithDistanceAndMatch.forEach(screen => {  
      if (!screen?.ismatch ||
        (screen?.ismatch?.start_time !== starttime && screen?.ismatch?.end_time !== endtime) ||
        (screen?.ismatch?.end_time !== endtime) ||
        (screen?.ismatch?.start_time !== starttime) ||
        (screen?.ismatch?.start_time <= starttime )) {
        filteredScreens1.push(screen);
      }
    });

    const filteredScreens2 = [];
    filteredScreens1.forEach(screen => {  
       if (!screen?.ismatch ||
            (screen?.ismatch?.start_time <= starttime && screen?.ismatch?.end_time <= endtime)) {
            filteredScreens2.push(screen);
        }
    });

    const filteredScreens3 = [];
    filteredScreens2.forEach(screen => {  
       if (!screen?.ismatch ||
            (screen?.ismatch?.start_time <= starttime && screen?.ismatch?.end_time <= endtime)) {
            filteredScreens3.push(screen);
        }
    });

    const filteredScreens = [];
    filteredScreens3.forEach(screen => {  
       if (!screen?.ismatch ||
            (screen?.ismatch?.start_time <= starttime && screen?.ismatch?.end_time <= starttime)) {
            filteredScreens.push(screen);
        }
    });

    
    // Sort filtered screens by distance
    filteredScreens.sort((a, b) => a.distance - b.distance);

    /************************* start calculation to apply formula **************************/ 
    const startTimeString = starttime; // Example start time
    const endTimeString = endtime; // Example end time

     if(filteredScreens.length>0){
      // Parse start time
      const startTimeParts = startTimeString.split(":");
      const startTimeHours = parseInt(startTimeParts[0], 10);
      const startTimeMinutes = parseInt(startTimeParts[1], 10);
      const startTimeMilliseconds = ((startTimeHours * 60 + startTimeMinutes) * 60) * 1000;
      
      // Parse end time
      const endTimeParts = endTimeString.split(":");
      const endTimeHours = parseInt(endTimeParts[0], 10);
      const endTimeMinutes = parseInt(endTimeParts[1], 10);
      const endTimeMilliseconds = ((endTimeHours * 60 + endTimeMinutes) * 60) * 1000;
      
      // Calculate the duration in milliseconds
      let durationMilliseconds = endTimeMilliseconds - startTimeMilliseconds;
      
      // If duration is negative, add 24 hours
      if (durationMilliseconds < 0) {
        durationMilliseconds += 24 * 60 * 60 * 1000; // 24 hours in milliseconds
      }
      
      // Convert duration to hours
      let durationHours = durationMilliseconds / (1000 * 60 * 60);      

    // If duration is negative, add 24 hours
    if (durationHours <= 0) {
      durationHours += 24;
    }

    const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const dates = advertisement?.date;
    const day = new Date(dates).getDay();
    const dayName = daysOfWeek[day];
     
    // Geocode the latitude and longitude
    const locationRes = await axios.get(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=AIzaSyCxOWb1qXqzYQwVQe9xEB3l5WDp1ZW8hw0`);

    const locationData = locationRes.data;
    // Extract location name
    const location_name = locationData.results[0].formatted_address;

    // Get the population using fetchPopulation function
    const heatmap = await fetchPopulation(location_name);

    /************************* end calculation to apply formula **************************/ 

    /************************* apply formula **************************/ 

    // hour *************** how many hour screen play ****************
    // heatmap *************** how many crowd on place ****************
    // day *************** how many days screen will play ****************
    // $5  *************** indicate for base price ****************

    /*************** according to hour ****************/
    // 1 if duration between  16 to 24
    // 2 if duration between 8 to 16
    // 3 if duration between 1 to 8

    /*************** according to days ****************/
    // 1 if day is sunday or saturday
    // 2 if day is tuesday or thursday
    // 3 if day is wednesday or monday

    /*************** according to heatmap ****************/
    // 1 if count of crowd density percentage between 60 to 100
    // 2 if count of crowd density percentage between 40 to 60
    // 3 if count of crowd density percentage between 10 to 40

    // Check the range of durationHours and set durationStage
    
    if (durationHours >= 16 && durationHours <= 24) {
      durationStage = 3; // durationHours between 16 to 24
    } else if (durationHours >= 8 && durationHours < 16) {
      durationStage = 2; // durationHours between 8 to 16
    } else if (durationHours >= 0 && durationHours < 8) {
      durationStage = 1; // durationHours between 1 to 8
    } else {
      console.log("Invalid duration"); // Handle invalid duration
    }

    // Check the range of heatmap and set heatmap
    if (heatmap >= 60 && heatmap <= 100) {
      heatmapStage = 3; // heatmap between 60 to 100
    } else if (heatmap >= 40 && heatmap < 60) {
      heatmapStage = 2; // heatmap between 40 to 60
    } else if (heatmap > 0 && heatmap < 40) {
      heatmapStage = 1; // heatmap between 10 to 40
    } else {
      console.log("Invalid heatmap"); // Handle invalid heatmap
    }

      // Check the dayName and log the appropriate message
    if (dayName === "Sunday" || dayName === "Saturday") {
       countday = 3; // Sunday or Saturday
    } else if (dayName === "Tuesday" || dayName === "Thursday") {
      countday = 2; // Tuesday or Thursday
    } else if (dayName === "Wednesday" || dayName === "Monday" || dayName === "Friday") {
       countday = 1; // Wednesday or Monday
    } else {
      console.log("Invalid day"); // Handle invalid day
    }

  
    /*************** formula to calculate price according to per hour **************/ 
    price_per_hour = 5 + (durationStage * durationHours) + (heatmapStage * heatmap) + countday;
    total_price =  price_per_hour * durationHours;
  }
      // Send success response with filtered data including distance and ismatch
      return res.status(200).json({
        statusCode: 200,
        message: "Screens data retrieved successfully",
        data: filteredScreens.length > 0 ? {
          ...filteredScreens[0], // Include existing data
          price: total_price // Include screen price
        } : null
      });
  } 

catch (error) {
    console.error("Caught error:", error); // Log the caught error
    return res.status(500).json({ statusCode: 500, error });
  }
}


//**************************** get-screen-according-to-distance **********************************/

// Function to estimate crowd density
async function estimateCrowdDensity(req, res) {
  try {
      const { lat, long } = req.query;

      if (!lat || !long) {
          return res.status(400).json({ error: 'Latitude and Longitude are required.' });
      }

      // Geocode the latitude and longitude
      const locationRes = await axios.get(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${long}&key=AIzaSyCxOWb1qXqzYQwVQe9xEB3l5WDp1ZW8hw0`);

      const locationData = locationRes.data;
      if (locationData.status !== 'OK' || locationData.results.length === 0) {
          return res.status(404).json({ error: 'Location not found.' });
      }

      // Extract location name
      const location = locationData.results[0].formatted_address;
      const popularityPercentage = await fetchPopulation(location);  

          res.status(200).json({ 
              statusCode: 200, 
              message: "Population Percentage retrieved successfully", 
              data: [
                  { 
                      location: location, 
                      popularity_percentage: popularityPercentage, 
                      latitude: req.query.lat, 
                      longitude: req.query.long 
                  }
              ]
          });    
  } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ error: 'Internal server error' });
  }
}

/**************** get instructions *************/
async function instructions(req, res, next) {
  try {  
    const instructions = await Instruction.find({}, 'advertiser_instruction'); 
    // Send success response
    if (instructions) {
      res.status(200).json({ statusCode: 200, message: "Instructions retrieved successfully", instructions });
    } else {
      res.status(404).json({ statusCode: 404, message: "Instructions not found" });
    }
  } catch (error) {
    console.error("Caught error:", error);
    next(error);
  }
}


/**************** Delete advertisement*************/
async function deleteAdvertisement(req, res, next) {
  try {
      const userId = req.userId; // Assuming userId is extracted from the authentication token middleware
      const deleteAdvertisementId = req.body.advertisement_id;

      // Check if userId is valid
      if (!userId) {
          return res.status(401).json({ statusCode: 401, message: "Invalid authentication token" });
      }

      // Check if Advertisement is valid
      if (!deleteAdvertisementId) {
          return res.status(400).json({ statusCode: 400, message: "Invalid Advertisement Id" });
      }

      // Find and delete the Advertisement document
      const deletedData = await Advertisement.findOneAndDelete({_id: deleteAdvertisementId });

      // If no document found with the given userId and deleteAdvertisementId
      if (!deletedData) {
          return res.status(404).json({ statusCode: 404, message: "Data not found for the user and Advertisement ID" });
      }

      // Send success response
      return res.status(200).json({ statusCode: 200, message: "Data deleted successfully"});
  } catch (error) {
      console.error("Caught error:", error); // Log the caught error
      return res.status(500).json({ statusCode: 500, error });
  }
}

async function fetchPopulation(location_name) {
   try {
    const apiKey = geoapifyApiKey // Replace this with your actual API ke
    const encodedLocation = encodeURIComponent(location_name);
    const geocodingResult = await fetch(`https://api.geoapify.com/v1/geocode/search?text=${encodedLocation}&format=json&apiKey=${apiKey}`)
      .then(resp => resp.json());

    const population = Math.floor((geocodingResult.results[0].rank.popularity / 10) * 100);
    console.log(population);
    return population;
  } catch (error) {
    console.error("Error fetching population data:", error);
    // Handle the error as needed
    return null;
  }
}


/**************** add location to Advertisement*************/
async function AddLocationadvertisement(req, res, next) {
  try {
     const userId = req.userId; // Assuming userId is extracted from the authentication token middleware
     const requestId = req.body.advertisement_id; 

     // Check if userId is valid
     if (!userId) {
         return res.status(401).json({ statusCode: 401, message: "Invalid authentication token" });
     }

     // Check if requestId is valid
    if (!requestId) {
      return res.status(404).json({ statusCode: 404, message: "Invalid Advertisement Id" });
    }
     const { location, latitude, longitude, date, start_time,end_time,screen_id,payment_response } = req.body;

     // Validate if location is provided
     if (!location) {
         return res.status(400).json({ statusCode: 400, message: "Location is required" });
     }
     // Find and update the Advertisement document
     const updatedData = await Advertisement.findOneAndUpdate(
         { userId, status: 'approved' ,_id: requestId},
         { $set: { location,latitude, longitude, date,status:'active',start_time,end_time} },
         { new: true }
     );
     
     if (!updatedData) {
      return res.status(404).json({ statusCode: 404, message: "Data not found for the user" });
  }
     // First, you need to find the earnerScreen document matching the screen_id
      const earnerScreenData = await EarnerScreen.findOne({ _id: screen_id });   

         // Create a new Data entry
        const screenAlotdata = new screenAlot({ earner_id:earnerScreenData.userId , advertiser_id:userId, screen_id,payment_response,advertisement_id:requestId,start_time,end_time});

        const savedData = await screenAlotdata.save();

        // Send success response with updated data
        return res.status(200).json({ statusCode: 200, message: "Location updated successfully", data: updatedData, screenData:savedData });
  } catch (error) {
      console.error("Caught error:", error); // Log the caught error
      return res.status(500).json({ statusCode: 500, error });
  }
}


/****************  Validation Function *************/
function validateFields(fields) {
  const errors = [];

  // Check if name is provided
  if (!fields.name) {
    errors.push("Please provide name");
  }

  // Check if description is provided
  if (!fields.description) {
    errors.push("Please provide description");
  }

  // Check if campaign_link is provided
  if (!fields.campaign_link) {
    errors.push("Please provide Link");
  }
  
  return errors; // Return the array of errors
}

module.exports = {
  createAdvertisement,
  advertisementList,
  deleteAdvertisement,
  AdvertisementDetail,
  instructions,
  alotScreen,
  estimateCrowdDensity,
  AddLocationadvertisement
};
