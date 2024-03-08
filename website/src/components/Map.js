import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import MapInfo from './MapInfo';

import { useActiveLink } from './ActiveLinkContext';

import 'mapbox-gl/dist/mapbox-gl.css';
import '../style/map.css';

mapboxgl.accessToken =
  'pk.eyJ1IjoiYm96dTEyMDYiLCJhIjoiY2x2N3JxbmRlMGNvZzJsbXpmb3U3MW9xYSJ9.uEELFQocoXgVtPhpAreqpA';

const MAP_SETTINGS = {
  style: 'mapbox://styles/mapbox/streets-v12',
  center: [153.026, -27.4705], // Longitude, Latitude of Brisbane
  zoom: 1.5,
};

const loadJsonData = async (filePath) => {
  const response = await fetch(filePath);
  return await response.json();
};

const fetchRoute = async (fromCoords, toCoords) => {
  const query = await fetch(
    `https://api.mapbox.com/directions/v5/mapbox/driving-traffic/${fromCoords.lon},${fromCoords.lat};${toCoords.lon},${toCoords.lat}?geometries=geojson&access_token=${mapboxgl.accessToken}`,
    { method: 'GET' }
  );

  const json = await query.json();
  return json.routes[0].geometry;
};

const alternativeRoute = async (fromCoords, toCoords, profile = 'driving') => {
  const url = `https://api.mapbox.com/directions/v5/mapbox/${profile}/${fromCoords.lon},${fromCoords.lat};${toCoords.lon},${toCoords.lat}?geometries=geojson&steps=true&access_token=${mapboxgl.accessToken}`;
  const response = await fetch(url, { method: 'GET' });

  if (!response.ok) {
    return { duration: -1, distance: -1, profile: profile };
  }

  const json = await response.json();

  if (json.routes.length === 0) {
    return { duration: -1, distance: -1, profile: profile };
  }

  const route = json.routes[0];

  return {
    duration: route.duration,
    distance: route.distance,
    profile: route.profile,
  };
};

const getCitiesGeoJson = async () => {
  const citiesData = await loadJsonData('data/preprocessed/cities.json');

  const features = Object.entries(citiesData).map(
    ([city, coordinates], index) => ({
      type: 'Feature',
      properties: {
        city,
        index: index + 1,
      },
      geometry: {
        type: 'Point',
        coordinates: [coordinates.lon, coordinates.lat],
      },
    })
  );

  return {
    type: 'FeatureCollection',
    features,
  };
};

const addMapLayers = async (map, routesData, setInfo) => {
  const cityData = await getCitiesGeoJson();
  map.addSource('points', {
    type: 'geojson',
    data: cityData,
  });
  map.addLayer({
    id: 'points',
    type: 'circle',
    source: 'points',
    paint: {
      'circle-radius': 4,
      'circle-color': '#000',
    },
  });

  map.addLayer({
    id: 'city-labels',
    type: 'symbol',
    source: 'points',
    layout: {
      'text-field': '{index}',
      'text-size': 17,
      'text-offset': [0, 0.6],
      'text-anchor': 'top',
    },
    paint: {
      'text-color': '#000',
      'text-weight': 'bold',
    },
  });

  for (const [routeName, route] of Object.entries(routesData)) {
    let routeGeometry;

    if (route.mode !== 'airplane') {
      try {
        routeGeometry = await fetchRoute(route.from_coords, route.to_coords);
      } catch (error) {
        continue;
      }
    } else {
      routeGeometry = {
        type: 'LineString',
        coordinates: [
          [route.from_coords.lon, route.from_coords.lat],
          [route.to_coords.lon, route.to_coords.lat],
        ],
      };
    }

    const alternativeRouteData = await alternativeRoute(
      route.from_coords,
      route.to_coords
    );

    const routeId = `route-${routeName}`;
    const hoverRouteId = `hover-${routeName}`;

    map.addSource(routeId, {
      type: 'geojson',
      data: {
        type: 'Feature',
        properties: {
          mode: route.mode,
          distance: route.dist,
          duration: route.duration,
          co2: route.co2,
          from: route.from,
          to: route.to,
          iata_from: route.iata_from,
          iata_to: route.iata_to,
          alternative_mode: alternativeRouteData.profile,
          alternative_distance: alternativeRouteData.distance,
          alternative_duration: alternativeRouteData.duration,
          fromCoords: route.from_coords,
          toCoords: route.to_coords,
        },
        geometry: routeGeometry,
      },
    });

    // Main route layer
    map.addLayer({
      id: routeId,
      type: 'line',
      source: routeId,
      layout: {
        'line-join': 'round',
        'line-cap': 'round',
      },
      paint: {
        'line-color': [
          'match',
          ['get', 'mode'],
          'car',
          '#FFCC00', // Yellow for cars
          'airplane',
          '#CC3333', // Red for airplanes
          '#339933', // Default green color for other modes
        ],
        'line-width': ['match', ['get', 'mode'], 'car', 4, 'airplane', 3, 4],
      },
    });

    map.addLayer({
      id: hoverRouteId,
      type: 'line',
      source: routeId,
      layout: {
        'line-join': 'round',
        'line-cap': 'round',
      },
      paint: {
        'line-color': 'transparent',
        'line-width': 20,
      },
    });

    map.on('click', hoverRouteId, (e) => {
      map.flyTo({
        center: [route.to_coords.lon, route.to_coords.lat],
        zoom: 5,
        essential: true,
      });
    });

    map.on('mouseenter', hoverRouteId, (e) => {
      map.getCanvas().style.cursor = 'pointer';
      const cursorX = e.point.x;
      const mapWidth = map.getCanvas().clientWidth;
      const infoSide = cursorX > mapWidth / 2 ? 'left' : 'right';
      let infoPositionStyle;
      if (infoSide === 'left') {
        infoPositionStyle = { left: `${cursorX + 20}px` };
      } else {
        infoPositionStyle = { left: `${cursorX - 300}px` };
      }

      const props = e.features[0].properties;
      setInfo(props, infoPositionStyle);
    });

    map.on('mouseleave', hoverRouteId, () => {
      map.getCanvas().style.cursor = '';
      setInfo('');
    });
  }
};

const loadAndDisplayRoutes = async (map, setInfo) => {
  const routesData = await loadJsonData('data/preprocessed/routes.json');
  await addMapLayers(map, routesData, setInfo);
};

const MapWithPopup = () => {
  const mapContainer = useRef(null);
  const [info, setInfo] = useState('');

  useEffect(() => {
    const map = new mapboxgl.Map({
      container: mapContainer.current,
      ...MAP_SETTINGS,
    });

    map.on('load', async () => {
      await loadAndDisplayRoutes(map, setInfo);
    });

    return () => map.remove();
  }, []);

  const ref = useRef(null);
  const { setActiveLink } = useActiveLink();

  useEffect(() => {
    if (!ref.current) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveLink('map');
          }
        });
      },
      { rootMargin: '0px', threshold: 0.4 }
    );

    observer.observe(ref.current);

    return () => {
      observer.disconnect();
    };
  }, [setActiveLink]);

  return (
    <div className='map-section' id='map' ref={ref}>
      <div className='map-title'>
        <h1 className='fancy title'>
          Mapping the Journeys: A Greener Path Forward
        </h1>
      </div>
      <p className='map-description'>
        Journey across the globe with our interactive 3D globe Visualization,
        which not only traces the routes of ATP players through their season but
        also highlights the ecological costs associated with their travels. This
        dynamic map goes a step further by presenting alternative travel options
        by train and car, offering paths with potentially lower CO2 emissions.
        Explore these greener routes and see the difference they could make. The
        presented travel road is one carefully crafted: it is the one comprising
        of the most tournaments possible while keeping the carbon footprint as
        low as possible. Engage with each line drawn on the globe, not just as a
        route, but as a story of possible change, inviting you to reimagine how
        sustainable decisions can shape the environmental impact of professional
        tennis.
      </p>
      <div className='parent-map-container'>
        <div ref={mapContainer} className='mapContainer' />
        <MapInfo info={info} />
      </div>
    </div>
  );
};

export default MapWithPopup;
