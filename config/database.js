const mongoose = require('mongoose');

mongoose.connect("mongodb+srv://sukh94650:sukh94650@cluster.d07ai3i.mongodb.net/coaching", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});
mongoose.connection.on('connected', () => {
    console.log('Connected to MongoDB on localhost');
});

mongoose.connection.on('error', (err) => {
    console.error('MongoDB connection error: ${err}');
});




