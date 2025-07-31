const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();
const port = process.env.PORT || 10000;

app.use(cors());

app.get("/proxy", async (req, res) => {
  const targetUrl = req.query.url;

  if (!targetUrl) return res.status(400).send("Missing URL");

  try {
    const response = await axios.get(targetUrl, {
      responseType: "stream",
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115 Safari/537.36",
        "Referer": "http://ott.udptv.net/",
        "Origin": "http://ott.udptv.net/"
      }
    });

    res.set(response.headers);
    response.data.pipe(res);
  } catch (error) {
    console.error("Proxy error:", error.message);
    res.status(error.response?.status || 500).send(
      "Proxy failed: " + (error.response?.statusText || error.message)
    );
  }
});

app.listen(port, () => {
  console.log(`UDPTV Proxy running on port ${port}`);
});
