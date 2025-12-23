const mongoose = require('mongoose') // interacts with MongoDB database
const bycrypt = require("bcryptjs") // encrypt passwords

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        minlength: 3,
        maxlength: 20
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    }, 
    password: {
        type: String,
        required: true,
        minlength: 6
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

userSchema.pre("Save", async function(next) {
   return await bcrypt.compare(candidatePassword, this.password); 
});

module.exports = mongoose.model("User", userSchema);