const express = require("express");
const axios = require("axios");
const cors = require("cors");
const app = express();
app.use(cors());

app.get("/proxy", async (req, res) => {
  const targetUrl = req.query.url;
  if (!targetUrl) return res.status(400).send("Missing URL");

  try {
    const response = await axios.get(targetUrl, {
      responseType: targetUrl.endsWith(".m3u8") ? "text" : "stream",
      headers: {
        "User-Agent": "Mozilla/5.0",
        "Referer": "https://iptv.example/",
        "Origin": "https://iptv.example/"
      }
    });

    let contentType = response.headers["content-type"] || "application/octet-stream";
    if (targetUrl.endsWith(".m3u8")) {
      contentType = "application/vnd.apple.mpegurl";
    }

    res.set({
      "Access-Control-Allow-Origin": "*",
      "Content-Type": contentType
    });

    if (targetUrl.endsWith(".m3u8")) {
      let body = response.data;
      // Rewrite all .ts segments to go through proxy
      body = body.replace(/(https?:\/\/[^\s]+)/g, (match) => {
        if (match.endsWith(".ts") || match.includes(".ts?")) {
          return `https://udptv-proxy-server.onrender.com/proxy?url=${encodeURIComponent(match)}`;
        }
        return match;
      });
      res.send(body);
    } else {
      response.data.pipe(res);
    }

  } catch (err) {
    res.status(500).send("Proxy failed: " + err.message);
  }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log("UDPTV Proxy running on port " + PORT);
});
