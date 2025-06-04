const express = require('express');
const router = express.Router();
const axios = require('axios');

const YANDEX_API_KEY = process.env.YANDEX_API_KEY;

function getKind(obj) {
  return obj?.metaDataProperty?.GeocoderMetaData?.kind || '';
}

function getName(obj) {
  return obj?.name || '';
}

router.get('/', async (req, res) => {
  const { lat, lon } = req.query;
  if (!lat || !lon) return res.status(400).json({ error: "lat/lon required" });

  try {
    const url = `https://geocode-maps.yandex.ru/1.x/?apikey=${YANDEX_API_KEY}&format=json&lang=ru_RU&geocode=${lon},${lat}`;
    const resp = await axios.get(url);
    const features = resp.data.response.GeoObjectCollection.featureMember || [];

    let water = null;
    let locality = null;

    for (const f of features) {
      const kind = getKind(f.GeoObject);
      if (!water && (kind === "hydro")) water = getName(f.GeoObject);
      if (!locality && (
        kind === "locality" ||
        kind === "area" ||
        kind === "province"
      )) locality = getName(f.GeoObject);
      if (water && locality) break;
    }

    let place;
    if (water && locality) place = `${water}, ${locality}`;
    else if (water) place = water;
    else if (locality) place = locality;
    else place = features[0]?.GeoObject?.name || "Не найдено";

    res.json({ place, raw: resp.data });
  } catch (e) {
    console.error('YANDEX GEOCODER ERROR:', e?.response?.data || e.message || e);
    res.status(500).json({
      error: "Ошибка Яндекс геокодера",
      detail: e?.response?.data || e.message || e
    });
  }
});

module.exports = router;
