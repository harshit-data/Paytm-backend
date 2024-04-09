const express = require("express")
const zod = require("zod")
const bcrypt = require('bcrypt');
const saltRounds = 10;
const userRouter = express.Router()
const JWT_SECRET = require("../config")
const { User, Account } = require("./../db")
const jwt = require("jsonwebtoken")
const authMiddleware = require("./../middleware")
const signupSchema = zod.object({
    userEmail: zod.string().email(),
    firstName: zod.string().trim().min(3),
    lastName: zod.string().trim().min(3),
    password: zod.string().trim().min(6),
})
const signinSchema = zod.object({
    userEmail: zod.string().email(),
    password: zod.string().trim().min(6),
})
userRouter.post("/signup", async (req, res) => {
    const input = req.body;
    const result = signupSchema.safeParse(input)
    if (result.success) {
        const find = await User.find({ userEmail: input.userEmail });
        if (find.length == 0) {
            const salt = await bcrypt.genSalt(saltRounds);
            const hashedPassword = await bcrypt.hash(input.password, salt);
            const newUser = new User({ ...input, password: hashedPassword });
            await newUser.save();
            const newUserAccount = await new Account({ userId: newUser._id, balance: Math.floor(Math.random() * 1000000) })
            newUserAccount.save()
            const user = await User.findOne({ userEmail: input.userEmail });
            let token = jwt.sign({
                data: {
                    userId: user._id
                }
            }
                , JWT_SECRET
            );
            res.status(200).send({
                message: "User created successfully",
                token: token
            })
        } else {
            res.status(411).send("userEmaiil already taken")
        }
    }
    else {
        res.status(411).send("Incorrect inputs")
    }

})

userRouter.post("/signin", async (req, res) => {
    console.log("signing in")
    const body = req.body
    const parse = signinSchema.safeParse(body)
    if (parse.success) {
        const find = await User.find({ userEmail: body.userEmail });
        if (find.length == 0) {
            res.status(411).send("Email is not registerd")
        }
        else {
            const user = await User.findOne({ userEmail: body.userEmail });
            bcrypt.compare(body.password, user.password).then((result) => {
                if (result) {
                    let token = jwt.sign({
                        data: {
                            userId: user._id
                        }
                    }
                        , JWT_SECRET
                    );
                    res.status(200).send({
                        token
                    })
                }
                else {
                    res.status(411).send("incorrect password")
                }
            });
        }
    }
    else {
        res.status(411).send("Invalid inputs")
    }

})
userRouter.put("/", authMiddleware, async (req, res) => {
    const body = req.body;
    const user = await User.updateOne({ _id: req.userId }, body)
    res.status(200).send("user updated successfully")
})
userRouter.get("/bulk", authMiddleware, async (req, res) => {
    const filter = req.query.filter || "";
    const users = await User.find({ $or: [{ firstName: { $regex: `^${filter}` } }, { lastName: { $regex: `^${filter}` } }] })
    res.send({
        users: users.map((item, index) => {
                return {
                    firstName: item.firstName,
                    lastName: item.lastName,
                    userId: item._id
                }
        })
    })
})
module.exports = userRouter;