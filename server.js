const express = require('express');
const fetch = require('node-fetch');
require('dotenv').config();
const app = express();
app.use(express.json({limit: '10mb'}));

app.post('/caption', async (req, res) => {
  const { image } = req.body;
  if (!image) return res.status(400).json({ error: 'No image provided' });
  try {
    const response = await fetch('https://api-inference.huggingface.co/models/Salesforce/blip-image-captioning-base', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.HUGGINGFACE_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ inputs: { image } })
    });
    const data = await response.json();
    const text = (Array.isArray(data) && data[0]?.generated_text) ? data[0].generated_text : 'No description';
    res.json({ description: text });
  } catch(err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to caption image' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
