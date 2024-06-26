const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const router = express.Router(); 
const UserModel = require('./models/model.user') 
const bcrypt = require('bcrypt');
const saltRounds = 10;
const jwt = require('jsonwebtoken');
const app = express(); 
app.use(express.json())
app.use(cors())
require('dotenv').config();

const { isAuthenticated } = require('./middlewares/jwt.middleware'); 

mongoose.connect(`${process.env.MONGODB_URI}`)

let privateKey = `${process.env.PRIVATE_KEY}`;



app.get('/', (req, res) => { 
res.json('Hello World')
}); 

app.delete('/delete', async (req, res) => { 
    const { email } = req.body
    try {
        const userDeleted = await UserModel.findOneAndDelete({
                email: email,
        }
        );
        res.status(200).json(userDeleted);
    } catch (err) {
        console.error("Database Error:", err.message); 
        res.status(500).json(err.message)
    }
}); 

app.post('/register', async (req, res) => { 
    const { username, email, password } = req.body;
    console.log('Received data:', { username, email });

    try {
        const salt = bcrypt.genSaltSync(saltRounds);
        const hash = bcrypt.hashSync(password, salt);
        console.log('Generated hash:', hash);

        const newUser = await UserModel.create({ username, email, password: hash });
        const user = newUser.toObject();
        res.status(201).json({ user });
    } catch (err) {
        console.error("Database Error:", err.message); 
        res.status(500).json(err.message);
    }
}); 

app.post('/login', async (req, res) => { 
    const { email, password } = req.body;

    try {
        const foundUser = await UserModel.findOne({ email });

        if (!foundUser) {
            return res.status(404).json("no user found");
        }

        const isPasswordCorrect = bcrypt.compareSync(password, foundUser.password);

        if (isPasswordCorrect) {
            const token = jwt.sign({ _id: foundUser._id, email: foundUser.email }, privateKey, { expiresIn: '1h' });
            res.status(200).json({ token });
        } else {
            res.status(401).json("password incorrect");
        }
    } catch (err) {
        console.error("Database Error:", err.message);
        res.status(500).json(err.message);
    }
});



// // Add a product to favorites
// router.post('/favorites', isAuthenticated, async (req, res) => {
//     const { productId } = req.body;
//     const userId = req.payload._id; // Assuming payload contains user id
  
//     try {
//       // Check if the product ID is provided
//       if (!productId) {
//         return res.status(400).json({ message: "Product ID is required" });
//       }
  
//       // Check if the user exists
//       const user = await UserModel.findById(userId);
//       if (!user) {
//         return res.status(404).json({ message: "User not found" });
//       }
  
//       // Check if the product is already in favorites
//       const existingFavorite = await FavoriteModel.findOne({ user: userId, product: productId });
//       if (existingFavorite) {
//         return res.status(400).json({ message: "Product already in favorites" });
//       }
  
//       // Create a new favorite entry
//       const newFavorite = new FavoriteModel({ user: userId, product: productId });
//       await newFavorite.save();
  
//       res.status(201).json(newFavorite);
//     } catch (error) {
//       console.error("Error adding favorite:", error);
//       res.status(500).json({ message: "Internal server error" });
//     }
//   });
  
//   // Get user's favorites
//   app.get('/favorites', isAuthenticated, async (req, res) => {
//     try {
//       const favorites = await FavoriteModel.find({ user: req.payload._id });
//       res.status(200).json(favorites);
//     } catch (err) {
//       console.error("Database Error:", err.message); 
//       res.status(500).json(err.message);
//     }
//   });

app.listen(process.env.port || 3001); 
console.log('Running at Port 3001'); 

module.exports = app;