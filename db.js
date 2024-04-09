const mongoose = require("mongoose")


async function connect() {
    try {
        await mongoose.connect("mongodb://localhost:27017/paytm")
        console.log("connection successful")
    }
    catch (error) {
        console.log("problem in connection", error)
    }
}
connect();

const userSchema = mongoose.Schema({
    userEmail: String,
    firstName: String,
    lastName: String,
    password: String
})
const User = mongoose.model("User", userSchema); 


//! here ref user is used so that there can't be a entry for a user in the accounts table that user doesn't exist in the user table
const accountSchema = mongoose.Schema({
    userId:
        {
            type:mongoose.Schema.Types.ObjectId,
            ref: "User",
            required:true
        },
    balance: {
        type: Number,
        required:true
    }
})
const Account = mongoose.model("Account", accountSchema)
module.exports = {
    User, Account
};