import express from "express";
const router = express.Router();
router.get("/v", (req, res) => {
  res.redirect("https://loudness.info");
});

router.get("/cs", (req, res) => {
  res.redirect("https://lkt-asiaeast-web.jointell.net/rooms/cs");
});

export default router;
