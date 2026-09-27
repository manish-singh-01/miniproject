const express = require("express");

const app = express();

const PORT = 5000;


// Middleware
app.use(express.json());


// Test Route
app.get("/", (req, res) => {
    res.send("Disaster Management Portal Backend is Running 🚨");
});


// Start Server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});