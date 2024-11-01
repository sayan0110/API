const express = require ("express");
const router = express.Router();

router.get("/signup", (req, res) => {
    res.status(200).send("comments signup");
})

router.get("/login", (req, res) => {
    res.send("comments login")
})
module.exports = router;