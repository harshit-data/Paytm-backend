const express = require("express");
const router = require("./routes/index")
const cors = require("cors")
const app = express();
app.use(cors())
app.use(express.json())
app.use("/api/v1", router);
const port = 3000;

app.listen(port, () => {
    console.log("listening to port 3000")
})

