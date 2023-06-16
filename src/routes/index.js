const {
  sendMessage,
} = require("../app/index");
const { Router } = require("express");
const router = Router();

router.get("/enviarmensaje", sendMessage);

router.post("/enviarmensaje", sendMessage);

module.exports = router;
