const openai = require("openai");

const url = require("url");
const express = require("express");
const router = express.Router();
const needle = require("needle");
const {translateParagraph} = require("../services/openai")

router.use(express.json());

router.post("/translate", async (req, res) => {
  const { paragraph } = req.body;

  if (!paragraph) {
    return res.status(400).json({
      error: "prompt is required"
    });
  }

  try {
    const result = await translateParagraph(paragraph);

    res.status(200).json({ response: result });

  } catch (error) {

    res.status(500).json({ error: error });

  }
});router.post("/supabase", async (req, res) => {

  const {hash, mode} = req.body;

  if(!hash){

    return res.status(400).json({
      error: 'hash is missing'
    })
  }

  if(!mode){

    return res.status(400).json({
      error: 'mode is missing'
    })
  }
})





module.exports = router;
