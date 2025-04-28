const openai = require("openai");

const url = require("url");
const express = require("express");
const router = express.Router();
const needle = require("needle");
const {translateParagraph} = require("../services/openai")
const {checkForTranslationinSupabase, postTranslation} = require("../services/supabase")

router.use(express.json());

router.get("/translate", async (req, res) => {
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
});

router.post("/supabase", async (req, res) => {

  const {hash, mode, translation} = req.body;

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

  if(!translation){

    return res.status(400).json({
      error: 'translation is missing'
    })
  }

  try{

    const result = await postTranslation(hash, mode, translation)
    res.status(200).json({response: result})

  }catch(error){

    res.status(500).json({error: error})
    
  }

})

router.get("/supabase", async (req, res) => {
  const {hash, mode } = req.body

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

  try {
    const result = await checkForTranslationinSupabase(hash, mode)

      return res.status(200).json({
        translation: result
      })

  } catch (error) {
      return res.status(500).json({
        error: error
      })
  }
})




module.exports = router;
