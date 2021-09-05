import "mapbox-gl/dist/mapbox-gl.css";
import "react-map-gl-geocoder/dist/mapbox-gl-geocoder.css";
import React, { useState, useRef, useCallback } from "react";
import MapGL, { Layer, Source } from "react-map-gl";
import Geocoder from "react-map-gl-geocoder";

import API from '../api';


const MAPBOX_TOKEN = process.env.REACT_APP_MAPBOX_TOKEN;

const Mapbox = () => {
  const [viewport, setViewport] = useState({
    latitude: 41.8781,
    longitude: -87.6298,
    zoom: 11,
    minzoom: 10,
    maxzoom: 17
    // style: {
    //   "version": 8,
    // "name": "{name}",
    // "metadata": "{metadata}",
    // "sprite": "mapbox://sprites/mapbox/bright-v8",
    // "glyphs": "mapbox://fonts/{username}/{fontstack}/{range}.pbf",
    // "layers": ["{layers}"],
    // }
    // style: "mapbox://styles/carlhauck/ckt6sp1v101w017s2qzfv739x",
  });
  const [zoneData, setZoneData] = useState([]);
  const [zoneCoordinates, setZoneCoordinates] = useState([]);
  const [addressPoint, setAddressPoint] = useState([]);
  const mapRef = useRef();
  const geocoderContainerRef = useRef();

  const handleResult = useCallback(
    (e) => {
      // console.log(e.result.place_name);
      // console.log(e.result.center)
      API.get("api/zones", {
        params: {
          lat: e.result.center[1],
          lng: e.result.center[0]
        }
      })
        .then(res => {
          if (res.data === "ZONE NOT FOUND") {
            // console.log("ZONE NOT FOUND");
          } else {
            setAddressPoint(e.result.center)
            // console.log(res.data);
            setZoneData(res.data.schedules.sort((a, b) => a.month_number - b.month_number));
            setZoneCoordinates(res.data.coordinates)
          }
        })
    }, []
  )

  const handleViewportChange = useCallback(
    (newViewport) => setViewport(newViewport),
    []
  );

  // if you are happy with Geocoder default settings, you can just use handleViewportChange directly
  const handleGeocoderViewportChange = useCallback(
    (newViewport) => {
      const geocoderDefaultOverrides = { transitionDuration: 1000, zoom: 15 };

      return handleViewportChange({
        ...newViewport,
        ...geocoderDefaultOverrides,
      });
    },
    [handleViewportChange]
  );

  return (
    <div className="flex">
      <div className="w-2/3 h-screen">
        <div
          style={{
            height: 52,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            width: "100%",
            background: "darkgray",
          }}
        >
          <div
            ref={geocoderContainerRef}
            style={{
              display: "flex",
              width: "100%",
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
            clearOnBlur={true}
            bbox={[-87.95897540987545, 41.63939121520151, -87.51939354167332, 42.02923118657451]}
          />

          <Source id="sweep-zone" type="geojson" data={
            {
              "type": "Feature",
              "geometry": {
                "type": "Polygon",
                "coordinates": [zoneCoordinates]
              },
              "properties": {
                "prop0": "value0",
                "prop1": { "this": "that" }
              }
            }
          }>
            <Layer
              type="fill"
              paint={{
                "fill-color": "#0091cd",
                "fill-opacity": 0.2,
              }}
            />
          </Source>

          <Source id="input-address" type="geojson" data={
            {
              "type": "Feature",
              "geometry": {
                "type": "Point",
                "coordinates": addressPoint
              },
              "properties": {
                "name": "Home",
              }
            }
          }>
            {/* <Layer
              type='symbol'
              source='point'
              layout={{
                'icon-image': 'store-icon',
                'icon-size': 0.5
              }}
              paint={{
                'icon-color': '#ffffff'
              }}
            /> */}
            <Layer
              type='circle'
              paint={{
                'circle-color': '#222222'
              }}
            />
          </Source>

        </MapGL>
      </div >
      {zoneData &&
        <div className="w-1/3 text-green-600">
          {zoneData.map(r => {
            let schedule = <p key={r.id} id={r.id}>{r.month_number} - {r.dates}</p>
            return schedule
          })}
        </div>
      }
    </div>
  );
};

export default Mapbox;
