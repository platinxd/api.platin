const express = require('express');
const axios = require('axios');
const app = express();
const PORT = 3000;

// Middleware for CORS and JSON
app.use(express.json());
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

// Site durum kontrol endpoint'i
app.get('/api/check-site', async (req, res) => {
  const siteUrl = req.query.url;
  
  if (!siteUrl) {
    return res.status(400).json({
      status: "error",
      message: "URL parametresi gereklidir. Örnek: /api/check-site?url=https://example.com"
    });
  }
  try {
    let formattedUrl = siteUrl;
    if (!siteUrl.startsWith('http://') && !siteUrl.startsWith('https://')) {
      formattedUrl = `https://${siteUrl}`;
    }

    // Siteye istek atıyoruz
    const response = await axios.get(formattedUrl, { 
      timeout: 5000,
      validateStatus: function (status) {
        return true; // Tüm status kodlarını kabul et
      }
    });
    
    // HTTP durum kodu 200-399 arasındaysa site up kabul ediyoruz
    if (response.status >= 200 && response.status < 400) {
      res.json({ 
        status: "up",
        message: "Site aktif olarak çalışıyor",
        siteUrl: formattedUrl,
        statusCode: response.status,
        timestamp: new Date().toISOString()
      });
    } else {
      res.json({ 
        status: "down",
        message: `Siteye erişilebiliyor ancak hata kodu dönüyor: ${response.status}`,
        siteUrl: formattedUrl,
        statusCode: response.status,
        timestamp: new Date().toISOString()
      });
    }
  } catch (error) {
    res.json({
      status: "down",
      message: error.message || "Siteye erişilemiyor",
      siteUrl: formattedUrl || siteUrl,
      statusCode: null,
      timestamp: new Date().toISOString()
    });
  }
});
app.listen(PORT, () => {
  console.log(`xd`);
});
