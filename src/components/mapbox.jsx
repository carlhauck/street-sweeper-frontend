import "mapbox-gl/dist/mapbox-gl.css";
import "react-map-gl-geocoder/dist/mapbox-gl-geocoder.css";
import React, { useState, useRef, useCallback } from "react";
import MapGL from "react-map-gl";
import Geocoder from "react-map-gl-geocoder";

import API from '../api';


const MAPBOX_TOKEN = process.env.REACT_APP_MAPBOX_TOKEN;

const Mapbox = () => {
  const [viewport, setViewport] = useState({
    latitude: 41.8781,
    longitude: -87.6298,
    zoom: 11,
  });
  const [zoneData, setZoneData] = useState([]);
  const mapRef = useRef();
  const geocoderContainerRef = useRef();

  const handleResult = (e) => {
    console.log(e.result.place_name);
    API.get("api/zones", {
      params: {
        address: e.result.place_name
      }
    })
      .then(res => {
        console.log(res.data.sort((a, b) => a.month_number - b.month_number));
        setZoneData(res.data.sort((a, b) => a.month_number - b.month_number));
      })
  };

  const handleViewportChange = useCallback(
    (newViewport) => setViewport(newViewport),
    []
  );

  // if you are happy with Geocoder default settings, you can just use handleViewportChange directly
  const handleGeocoderViewportChange = useCallback(
    (newViewport) => {
      const geocoderDefaultOverrides = { transitionDuration: 1000 };

      return handleViewportChange({
        ...newViewport,
        ...geocoderDefaultOverrides
      });
    },
    [handleViewportChange]
  );

  return (
    <div style={{ height: "50vh" }}>
      <div
        style={{
          height: 50,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          width: "100vw",
          background: "darkgray",
        }}
      >
        <div
          ref={geocoderContainerRef}
          style={{
            display: "flex",
            width: "100vw",
            paddingLeft: 4,
          }}
        />
      </div>
      <MapGL
        ref={mapRef}
        {...viewport}
        width="100%"
        height="100%"
        onViewportChange={handleViewportChange}
        mapboxApiAccessToken={MAPBOX_TOKEN}
      >
        <Geocoder
          mapRef={mapRef}
          containerRef={geocoderContainerRef}
          onViewportChange={handleGeocoderViewportChange}
          mapboxApiAccessToken={MAPBOX_TOKEN}
          onResult={handleResult}
          bbox={[-87.95897540987545, 41.63939121520151, -87.51939354167332, 42.02923118657451]}
        />
      </MapGL>
      <div
      // style={{
      //   position: "absolute",
      //   width: "200px",
      //   top: 0,
      //   right: 0,
      //   zIndex: 5,
      // }}
      >
        {zoneData.map(r => {
          let schedule = <p key={r.id} id={r.id}>{r.month_number} - {r.dates}</p>
          return schedule
        })}
      </div>
    </div>
  );
};

export default Mapbox;
