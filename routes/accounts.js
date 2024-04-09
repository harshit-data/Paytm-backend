const express = require("express")
const { Account } = require("../db")
const authMiddleware = require("../middleware")
const router = express.Router()
const zod = require("zod")
const mongoose = require("mongoose")
router.use(express.json())

const transferSchema = zod.object({
    to: zod.string().trim().min(1),
    amount: zod.number().int().positive().gt(1)
})
router.get("/balance", authMiddleware, async (req, res) => {
    const user = await Account.findOne({ userId: req.userId })
    console.log(req.userId)
    if (user) {
        res.send({
            balance: user.balance
        })
    }
    else {
        res.status(404).send("user not found")
    }
})

router.post("/transfer", authMiddleware, async (req, res) => {
    console.log(typeof(req.body.to),typeof(req.body.amount));
    const body = req.body;
    const session = await mongoose.startSession()
    const parse = transferSchema.safeParse(body);
    if (parse.error) {
        return res.status(400).json({
            messsage:"invalid data"
        })
    }
    session.startTransaction();
    const user1 = await Account.findOne({ userId: req.userId });
    if (user1.balance < body.amount) {
        await session.abortTransaction();
        return res.status(400).json({
            message:"insufficient balance"
        });
    }
    const user2 = await Account.findOne({ userId: body.to });
    if (!user2) {
        await session.abortTransaction();
        return res.status(404).json({message:"user doesn't exist"});
    }
    await Account.updateOne(user1, { balance: user1.balance - body.amount });
    await Account.updateOne(user2, { balance: user2.balance + body.amount });
    await session.commitTransaction()
    await session.endSession();
    res.json({message:"transfer succesful"})
})
module.exports = router;