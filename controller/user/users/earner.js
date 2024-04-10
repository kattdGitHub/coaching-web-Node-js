const User = require('../../../models/user/User');
const EarnerScreen = require('../../../models/user/EarnerScreen');
const EarnerLocation = require('../../../models/user/EarnerLocation');
const Instruction = require('../../../models/user/Instructions');
const screenAlot = require('../../../models/user/screenAlot');
/**
 * Handles the sign-up process. 
 * @param {*} req - The request object.
 * @param {*} res - The response object.
 * @param {*} next - The next middleware function in the stack.
 * @returns {Promise<void>} A Promise that resolves when the sign-up process is complete.
 */


/**************** Create Screen *************/
async function createScreen(req, res, next) {
  try {
      const userId = req.userId; // Assuming userId is extracted from the authentication token middleware
      let minPrice = 10;
      let maxPrice = 100;
      let price = Math.floor(Math.random() * (maxPrice - minPrice + 1)) + minPrice;// Apply formula for price here

      let photo = req.file.path;
      let singlephoto
      if (photo) {
          singlephoto = photo
      }

      

      // Check if userId is valid
      if (!userId) {
          return res.status(401).json({ statusCode: 401, message: "Invalid authentication token" });
      }

      const { name, description, dimension_height, dimension_width, location, latitude, longitude, uniqueId } = req.body;

      // Validate fields for signup
      const requiredFields = validateFields({ name, description, uniqueId });

      // If any errors exist, return them
      if (requiredFields && requiredFields.length > 0) {
          return res.status(404).json({ statusCode: 404, message: requiredFields.join(", ") });
      }

      // Check if uniqueId already exists
      const existingScreen = await EarnerScreen.findOne({ uniqueId });

      // If uniqueId already exists, return appropriate response
      if (existingScreen) {
          return res.status(400).json({ statusCode: 400, message: "Screen with this uniqueId already exists" });
      }

      // Create a new Data entry
      const newData = new EarnerScreen({ userId, name, description, dimension_height, dimension_width, location, latitude, longitude, photo: singlephoto, status: 'pending', uniqueId,price });

      // Save the Data to the database
      const savedData = await newData.save();

      // Send success response with token
      return res.status(200).json({ statusCode: 200, message: "Data added successfully", data: savedData }); // Created
  } catch (error) {
      console.error("Caught error:", error); // Log the caught error
      return res.status(500).json({ statusCode: 500, error });
  }
}


/**************** get instructions *************/
async function instructions(req, res, next) {
  try {  
    const instructions = await Instruction.find({}, 'earner_instruction'); 
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

/**************** List of Screens************/
async function screensList(req, res, next) {
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
    const data = await EarnerScreen.find({ userId })
                                   .skip(skip)
                                   .limit(limit);

    // Count total number of screens for the given userId
    const totalScreenCount = await EarnerScreen.countDocuments({ userId });

    // Calculate total number of pages
    const totalPages = Math.ceil(totalScreenCount / limit);

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

/**************** List of advertisement************/
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
    const data = await screenAlot
      .find({ earner_id: userId })
      .select('advertisement_id screen_id -_id') // Projection query to include only advertisement_id and screen_id fields
      .populate('advertisement_id')
      .populate('screen_id')
      .skip(skip)
      .limit(limit);

    // Count total number of screens for the given userId
    const totalScreenCount = await screenAlot.countDocuments({ earner_id: userId });

    // Calculate total number of pages
    const totalPages = Math.ceil(totalScreenCount / limit);
    // Modify the keys of the data object
    const modifiedData = data.map(item => ({
      advertisement: item.advertisement_id,
      screen: item.screen_id
    }));
    
    // Send success response with the modified keys, current page number, and total number of pages
    return res.status(200).json({
      statusCode: 200,
      message: "Data retrieved successfully",
      page: page,
      totalPages: totalPages,
      data: modifiedData
    });
  } catch (error) {
    console.error("Caught error:", error); // Log the caught error
    return res.status(500).json({ statusCode: 500, error });
  }
}


/**************** Detail of Screen *************/
async function screenDetail(req, res, next) {
  try {
    const userId = req.userId; // Assuming userId is extracted from the authentication token middleware
    const requestId = req.query.screen_id; // Assuming the request screen_id is passed in the URL parameters

    // Check if userId is valid
    if (!userId) {
      return res.status(401).json({ statusCode: 401, message: "Invalid authentication token" });
    }

    // Check if requestId is valid
    if (!requestId) {
      return res.status(401).json({ statusCode: 401, message: "Invalid Screen Id" });
    }

      // Find the data with the given _id and userId
    const data = await EarnerScreen.findOne({ _id: requestId, userId });

    // Check if data exists
    if (!data) {
      return res.status(404).json({ statusCode: 404, message: "Data not found for the given userId" });
    }

    // Send success response with the data
    return res.status(200).json({ statusCode: 200, message: "Data retrieved successfully", data: data });
  } catch (error) {
    console.error("Caught error:", error); // Log the caught error
    return res.status(500).json({ statusCode: 500, error });
  }
}

/**************** Edit Screen*************/
async function EditScreen(req, res, next) {
  try {
    const userId = req.userId;
    const requestId = req.body.screen_id;

    // Check if userId is valid
    if (!userId) {
      return res.status(401).json({ statusCode: 401, message: "Invalid authentication token" });
    }

    // Check if requestId is valid
    if (!requestId) {
      return res.status(401).json({ statusCode: 401, message: "Invalid Screen Id" });
    }

    const { name, description, dimension_height, dimension_width, location, latitude, longitude, is_active } = req.body;

    // Find existing document
    let existingData = await EarnerScreen.findOne({ userId, _id: requestId });

    // If no existing document found, return 404
    if (!existingData) {
      return res.status(404).json({ statusCode: 404, message: "Data not found for the user" });
    }

    // Prepare update fields
    const updateFields = {};
    if (name !== undefined) updateFields.name = name;
    if (description !== undefined) updateFields.description = description;
    if (dimension_height !== undefined) updateFields.dimension_height = dimension_height;
    if (dimension_width !== undefined) updateFields.dimension_width = dimension_width;
    if (location !== undefined) updateFields.location = location;
    if (latitude !== undefined) updateFields.latitude = latitude;
    if (longitude !== undefined) updateFields.longitude = longitude;
    if (is_active !== undefined) updateFields.status = is_active;

    // Update the document
    const updatedData = await EarnerScreen.findOneAndUpdate(
      { userId, _id: requestId },
      { $set: updateFields }, // Only set the fields that are provided
      { new: true }
    );

    // Send success response with updated data
    return res.status(200).json({ statusCode: 200, message: "Location updated successfully", data: updatedData });
  } catch (error) {
    console.error("Caught error:", error);
    return res.status(500).json({ statusCode: 500, error });
  }
}



/**************** Add Location*************/
async function addLocation(req, res, next) {
  try {
      const userId = req.userId; // Assuming userId is extracted from the authentication token middleware

      // Check if userId is valid
      if (!userId) {
          return res.status(401).json({ statusCode: 401, message: "Invalid authentication token" });
      }

      const { address, latitude, longitude, zip_code, state, building_number, street, city, nearby_address } = req.body;

      // Validate fields for location
      const requiredFields = validateLocationFields({ zip_code, state });

      // If any errors exist, return them
      if (requiredFields && requiredFields.length > 0) {
          return res.status(404).json({ statusCode: 404, message: requiredFields.join(", ") });
      }

      // Check if a location entry already exists for the user
      let existingData = await EarnerLocation.findOne({ userId });

      if (existingData) {
          // Update existing location
          existingData.address = address;
          existingData.latitude = latitude;
          existingData.longitude = longitude;
          existingData.zip_code = zip_code;
          existingData.state = state;
          existingData.building_number = building_number;
          existingData.street = street;
          existingData.city = city;
          existingData.nearby_address = nearby_address;

          // Save the updated data to the database
          const updatedData = await existingData.save();

          // Send success response with updated data
          return res.status(200).json({ statusCode: 200, message: "Location updated successfully", data: updatedData });
      } else {
          // Create a new location entry
          const newData = new EarnerLocation({ userId, address, latitude, longitude, zip_code, state, building_number, street, city, nearby_address });

          // Save the new data to the database
          const savedData = await newData.save();

          // Send success response with saved data
          return res.status(200).json({ statusCode: 200, message: "Location saved successfully", data: savedData });
      }
  } catch (error) {
      console.error("Caught error:", error); // Log the caught error
      return res.status(500).json({ statusCode: 500, error });
  }
}


/**************** Delete Screen*************/
async function deleteScreen(req, res, next) {
  try {
      const userId = req.userId; // Assuming userId is extracted from the authentication token middleware
      const screenId = req.body.screen_id;

      // Check if userId is valid
      if (!userId) {
          return res.status(401).json({ statusCode: 401, message: "Invalid authentication token" });
      }

      // Check if screenId is valid
      if (!screenId) {
          return res.status(400).json({ statusCode: 400, message: "Invalid Screen Id" });
      }

      // Find and delete the EarnerScreen document
      const deletedData = await EarnerScreen.findOneAndDelete({_id: screenId });

      // If no document found with the given userId and screenId
      if (!deletedData) {
          return res.status(404).json({ statusCode: 404, message: "Data not found for the user and screen ID" });
      }

      // Send success response
      return res.status(200).json({ statusCode: 200, message: "Data deleted successfully"});
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

  // Check if uniqueId is provided
  if (!fields.uniqueId) {
    errors.push("Please provide uniqueId");
  }
  

  return errors; // Return the array of errors
}


/****************  Validation Function for add location *************/
function validateLocationFields(fields) {
  const errors = [];

  // Check if zip_code is provided
  if (!fields.zip_code) {
    errors.push("Please provide zip_code");
  }
  
  // Check if state is provided
  if (!fields.state) {
    errors.push("Please provide state");
  }
  return errors; // Return the array of errors
}

module.exports = {
  createScreen,
  advertisementList,
  screensList,
  screenDetail,
  addLocation,
  EditScreen,
  deleteScreen,
  instructions,
};
