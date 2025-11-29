"use client";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import { LatLngExpression } from "leaflet";
import "leaflet/dist/leaflet.css";

type MapComponentProps = {
  selectedLocation: { lat: number; lon: number; name?: string } | null;
};

// 1️⃣ Create a triangle SVG icon
const triangleIcon = L.divIcon({
  html: `<svg width="20" height="20" viewBox="0 0 20 20">
           <polygon points="10,0 0,20 20,20" fill="red" />
         </svg>`,
  className: "", // remove default styles
  iconSize: [20, 20],
});

export default function MapComponent({ selectedLocation }: MapComponentProps) {
  const defaultCenter: LatLngExpression = [3.1390, 101.6869]; // Kuala Lumpur default

  return (
    <div className="mt-4">
      <MapContainer
        center={
          selectedLocation
            ? [selectedLocation.lat, selectedLocation.lon] as LatLngExpression
            : defaultCenter
        }
        zoom={13}
        style={{ height: "400px", width: "100%" }}
        key={selectedLocation ? `${selectedLocation.lat}-${selectedLocation.lon}` : "default"}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        />

        {selectedLocation && (
          <Marker
            position={[selectedLocation.lat, selectedLocation.lon]}
            icon={triangleIcon}
          >
            <Popup>{selectedLocation.name || "Selected Location"}</Popup>
          </Marker>
        )}
      </MapContainer>
    </div>
  );
}
