const express = require("express")
const cookieParser = require("cookie-parser");
const mongoose = require("mongoose")
const cors = require("cors")
const app = express()
app.use(cookieParser());
app.use(cors({
    origin: 'http://localhost:5173', // or your frontend URL
    credentials: true
}))
app.use(express.json())
app.use(express.urlencoded({ extended: true }));




const authRoutes = require("./src/routes/authRoutes");
const userRoutes = require("./src/routes/UserRoutes")
app.use(userRoutes)

const rideRoutes = require("./src/routes/RideRoute")
app.use("/api/rides", rideRoutes)



const driverRoutes = require("./src/routes/driverRoutes");
app.use("/api/drivers", driverRoutes)
app.use("/api/auth", authRoutes);





mongoose.connect("mongodb://localhost:27017/node_intern_25", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => {
    console.log("MongoDB connected");
}).catch((err) => {
    console.error("MongoDB connection error:", err);
});


const PORT = 3000
app.listen(PORT, () => {
    console.log("server is running on port" + PORT);

})