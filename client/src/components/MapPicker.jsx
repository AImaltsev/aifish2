// src/components/MapPicker.jsx
import { YMaps, Map, Placemark } from "@pbe/react-yandex-maps";

export default function MapPicker({ lat, lon, onChange }) {
  const defaultState = {
    center: [lat || 53.15538, lon || 48.47412],
    zoom: 10,
  };

  return (
    <YMaps query={{ apikey: "58ca7fe7-347f-45a6-83d5-cd66a68a8cf1" }}>
      <Map
        state={defaultState}
        width="100%"
        height={300}
        onClick={e => {
          const coords = e.get("coords");
          onChange({ lat: coords[0], lon: coords[1] });
        }}
      >
        {(lat && lon) && <Placemark geometry={[lat, lon]} />}
      </Map>
    </YMaps>
  );
}
