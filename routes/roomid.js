const express = require("express");
const router = express.Router();

router.get("/api/roomid", (req, res) => {
  res.send(roomId);
});
router.post("/api/roomid", (req, res) => {});

module.exports = router;
