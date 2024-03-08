import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import mapboxgl from "mapbox-gl";
import TextField from "@mui/material/TextField";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { BeatLoader } from "react-spinners";
import { useActiveLink } from "./ActiveLinkContext";
import "../style/tournaments-list.css";
import "../style/calendar.css";

import { useAppContext } from "./GlobalContext";
import MyTimeline from "./Timeline";

const SearchCity = ({ debut }) => {
  const { cities, setCities } = useAppContext();
  const [city, setCity] = useState("");
  const [coordinates, setCoordinates] = useState(null);
  const cityNameKey = debut ? "startCity" : "endCity";
  const verb = debut ? "start" : "end";

  useEffect(() => {
    const handleSearch = async () => {
      if (city.length > 2) {
        // Ajoutez une condition pour éviter des requêtes trop fréquentes
        try {
          const apiKey = "68e0d2b484a24b1fba42d6aa772852d2";
          const url = `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(
            city
          )}&key=${apiKey}`;
          const response = await axios.get(url);
          const coords = response.data.results[0].geometry;
          setCoordinates(coords);
          setCities((prev) => ({
            ...prev,
            [cityNameKey]: { city, ...coords },
          }));
        } catch (error) {
          console.error("Error fetching data: ", error);
          setCoordinates(null);
        }
      }
    };

    const timer = setTimeout(() => {
      handleSearch();
    }, 500); // Déclenche la recherche 500ms après le dernier caractère saisi

    return () => clearTimeout(timer); // Nettoie le timer lors du démontage du composant
  }, [city]); // Se déclenche chaque fois que 'city' change

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        p: 2,
        gap: 2,
        "& fieldset": { border: "none" },
        "& .MuiInputBase-root.MuiFilledInput-root": {
          backgroundColor: "red",
        },
      }}
    >
      <TextField
        style={{
          width: "500px",
          border: "none",
        }}
        inputProps={{
          disableUnderline: true,
          style: {
            backgroundColor: "#f1f1f1",
            borderRadius: "15px",
            border: "none",
          },
        }}
        label={"Enter your " + verb + "ing" + " city"}
        variant="outlined"
        value={city}
        onChange={(e) => setCity(e.target.value)}
        fullWidth
      />
      {coordinates && (
        <Typography variant="body1">
          You will {verb} your season at{" "}
          {city.charAt(0).toUpperCase() + city.slice(1)}.
        </Typography>
      )}
    </Box>
  );
};

const TournamentsList = () => {
  const { selectedTournaments, setSelectedTournaments } = useAppContext();
  const [categories, setCategories] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get("data/preprocessed/tournaments.json");
        const data = response.data;
        const sortedByCategory = {};
        Object.keys(data).forEach((key) => {
          data[key].forEach((tournament) => {
            if (!sortedByCategory[tournament.cat]) {
              sortedByCategory[tournament.cat] = [];
            }
            sortedByCategory[tournament.cat].push(tournament);
          });
        });
        setCategories(sortedByCategory);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  const handleCheckboxChange = (tournament) => {
    const tournamentId = `${tournament.from_dt}-${tournament.to_dt}-${tournament.city}`;
    setSelectedTournaments((prev) => {
      const isAlreadySelected = prev.some(
        (t) => t.tournamentId === tournamentId
      );

      if (isAlreadySelected) {
        return prev.filter((t) => t.tournamentId !== tournamentId);
      } else {
        // Vérifier s'il y a un overlap exact des dates de début et de fin
        const index = prev.findIndex(
          (t) =>
            t.from_dt === tournament.from_dt && t.to_dt === tournament.to_dt
        );
        if (index !== -1) {
          // Replace the conflicting tournament
          let newSelectedTournaments = [...prev];
          newSelectedTournaments.splice(index, 1); // Remove the conflicting tournament
          return [...newSelectedTournaments, { ...tournament, tournamentId }]; // Add the new tournament
        }
        // No overlap, add the tournament to the selected list
        return [...prev, { ...tournament, tournamentId }];
      }
    });
  };

  const categoryOrder = [
    "ATP 250",
    "ATP 500",
    "ATP 1000",
    "Grand Slam",
    "ATP Finals",
    "NextGen",
  ];

  const handleDateFormat = (date) => {
    const [year, month, day] = date.split("-");
    return `${day}/${month}/${year}`;
  };

  return (
    <div>
      {categoryOrder.map(
        (category) =>
          categories[category] && (
            <div key={category}>
              <h3>{category}</h3>
              <div className="grid">
                {categories[category].map((tournament) => {
                  const tournamentId = `${tournament.from_dt}-${tournament.to_dt}-${tournament.city}`;
                  const isSelected = selectedTournaments.some(
                    (t) => t.tournamentId === tournamentId
                  );
                  return (
                    <div
                      key={tournamentId}
                      className={`card ${isSelected ? "selected" : ""}`}
                    >
                      <input
                        type="checkbox"
                        id={tournamentId}
                        checked={isSelected}
                        onChange={() => handleCheckboxChange(tournament)}
                      />
                      <label htmlFor={tournamentId}>
                        {tournament.city}
                        <br />
                        <span className="date">
                          {handleDateFormat(tournament.from_dt)} -{" "}
                          {handleDateFormat(tournament.to_dt)}
                        </span>
                      </label>
                    </div>
                  );
                })}
              </div>
            </div>
          )
      )}
    </div>
  );
};

function parseCoords(coords) {
  // Parse the coordinates from the string: "(lat, lon)"
  const [lat, lon] = coords
    .slice(1, -1)
    .split(",")
    .map((coord) => parseFloat(coord));
  return { lat, lon };
}

function haversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371e3; // Earth radius in meters
  const φ1 = (lat1 * Math.PI) / 180; // φ, λ in radians
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // in meters
}

function computeAirTravel(from, to, distance) {
  const speed = 800000 / 3600; // in meters/second
  const duration = distance / speed; // in seconds

  const CO2 = (distance / 1000) * 180; // in grams

  return {
    mode: "airplane",
    distance: distance, // in meters
    duration: duration, // in seconds
    geometry: null,
    CO2: CO2, // in grams
    from: from.name,
    to: to.name,
    from_coords: from,
    to_coords: to,
    steps: [],
  };
}

async function computeRoute(from, to) {
  mapboxgl.accessToken =
    "pk.eyJ1IjoiYm96dTEyMDYiLCJhIjoiY2x2N3JxbmRlMGNvZzJsbXpmb3U3MW9xYSJ9.uEELFQocoXgVtPhpAreqpA";
  const url = `https://api.mapbox.com/directions/v5/mapbox/driving-traffic/${from.lon},${from.lat};${to.lon},${to.lat}?steps=true&geometries=geojson&access_token=${mapboxgl.accessToken}`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    // Format the route data as needed
    const routes = data.routes.map((route) => ({
      distance: route.distance, // in meters
      duration: route.duration, // in seconds
      geometry: route.geometry, // GeoJSON format
      CO2: route.distance * 0.00012, // in tons
      fromName: from.name,
      toName: to.name,
      from: from,
      to: to,
      steps: route.legs[0].steps.map((step) => ({
        instruction: step.maneuver.instruction,
        distance: step.distance,
        duration: step.duration,
      })),
    }));

    console.log(routes);

    if (routes.length === 0) {
      // Compute air travel as the fallback
      const distance = haversineDistance(from.lat, from.lon, to.lat, to.lon);
      const airTravel = computeAirTravel(from, to, distance);
      console.log(airTravel);
      return [airTravel]; // Return as a list for consistency
    }

    return routes;
  } catch (error) {
    // Assume only airplane routes are available

    // Compute air travel as the fallback
    const distance = haversineDistance(from.lat, from.lon, to.lat, to.lon);
    const airTravel = computeAirTravel(from, to, distance);
    console.log(airTravel);
    return [airTravel]; // Return as a list for consistency
  }
}

async function fetchAllRoutes(path) {
  // Create an array of promises for each route calculation
  const routePromises = path
    .slice(0, -1)
    .map((_, i) => computeRoute(path[i], path[i + 1]));

  // Resolve all promises concurrently
  const allRoutes = await Promise.all(routePromises);

  // Iterate over the resolved routes and print details
  allRoutes.forEach((route, i) => {
    const from = path[i];
    const to = path[i + 1];
    console.log("Route between", from.name, "and", to.name);
    console.log("=====================================");
    console.log("Distance:", route[0].distance);
    console.log("Duration:", route[0].duration);
    console.log("CO2 emissions:", route[0].CO2);
    console.log("=====================================");
  });

  // If you need to use the routes outside, you can return them
  return allRoutes;
}

async function computeGraph(cities, selectedTournaments) {
  // Sort selected tournaments based on date (From_dt and to_dt)
  selectedTournaments.sort((a, b) => {
    const dateA = new Date(a.from_dt);
    const dateB = new Date(b.from_dt);
    return dateA - dateB;
  });

  console.log("Sorted Selected tournaments", selectedTournaments);
  // ===============================
  const departure = {
    name: cities.startCity.city,
    lat: cities.startCity.lat,
    lon: cities.startCity.lng,
  };
  const arrival = {
    name: cities.endCity.city,
    lat: cities.endCity.lat,
    lon: cities.endCity.lng,
  };

  const playedTournaments = selectedTournaments.map((tournament) => ({
    name: tournament.city,
    lat: parseCoords(tournament.coords).lat,
    lon: parseCoords(tournament.coords).lon,
  }));

  const path = [departure, ...playedTournaments, arrival];
  return await fetchAllRoutes(path);
}

const Calendar = () => {
  const loaderRef = useRef(null); // Étape 1
  const { selectedTournaments, cities } = useAppContext();
  const [routes, setRoutes] = useState([]);
  const [tml, setTml] = useState(false);
  const [load, setLoader] = useState(false);
  const [startingPoint, setStartingPoint] = useState(false);

  const handleComputeClick = async () => {
    setLoader(true);
    const routes = await computeGraph(cities, selectedTournaments);
    setRoutes(routes);
    setTml(true);
    setLoader(false);
  };

  useEffect(() => {
    if (cities.startCity && cities.endCity) {
      setStartingPoint(true);
    }
  }, [cities]);

  useEffect(() => {
    if (load && loaderRef.current) {
      loaderRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [load]); // Dépendance pour réexécuter l'effet quand isLoaded change

  const events = ["Lausanne", "Hong Kong", "Adelaide"];

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
            setActiveLink("planner");
          }
        });
      },
      { rootMargin: "0px", threshold: 0.4 }
    );

    observer.observe(ref.current);

    return () => {
      observer.disconnect();
    };
  }, [setActiveLink]);

  return (
    <div id="planner" ref={ref}>
      <h1 className="fancy title">Plan your season!</h1>
      <p className="calendar-description">
        Imagine planning a tennis season where every decision not only
        strategizes for victory but also champions sustainability. Our Player’s
        Calendar feature empowers athletes and teams to visualize the
        environmental impact of their chosen tournaments throughout the ATP
        season. This tool aims to help player in choosing a greener season.
        Select your starting and ending points. Select the tournaments you want
        to attend. That's all. Our tools will compute the best path for you.
      </p>
      {!tml && !load && (
        <h2 className="calendar-subtitle">
          1. Select the cities where you want to start and end your season
        </h2>
      )}
      {!tml && !load && (
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            alignContent: "space-evenly",
            justifyContent: "space-evenly",
            marginBottom: "50px",
          }}
        >
          <div>
            <SearchCity debut={1} />
          </div>
          <div>
            <SearchCity debut={0} />
          </div>
        </div>
      )}
      {!tml && startingPoint && !load && (
        <h2 className="calendar-subtitle">
          2. Select the tournaments you want to attend
        </h2>
      )}
      {!tml && startingPoint && !load && <TournamentsList />}
      {!tml && !load && startingPoint && (
        <div className="generate-button">
          <button className="compute-button" onClick={handleComputeClick}>
            Let the magic happen!
          </button>
        </div>
      )}

      {load && (
        <div ref={loaderRef} className="loader">
          <div>
            <BeatLoader loading size={25} color="#FFd700" />
          </div>
        </div>
      )}

      {tml && !load && (
        <MyTimeline
          cities={cities}
          tournaments={selectedTournaments}
          routes={routes}
        />
      )}
    </div>
  );
};

export default Calendar;
