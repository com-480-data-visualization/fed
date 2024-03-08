import React, { useEffect, useState } from "react";
import axios from "axios";
import "../style/player-card.css";

const endpointUrl = "https://en.wikipedia.org/w/api.php";

// Function to fetch image URL from Wikipedia
const fetchWikipediaImage = async (playerName) => {
  try {
    let title = await resolveTitle(playerName);
    if (!title) {
      console.error("Unable to resolve title for:", playerName);
      return "missing.jpeg";
    }

    const params = {
      action: "query",
      format: "json",
      titles: title,
      prop: "pageimages",
      pithumbsize: 500,
      origin: "*",
    };

    const response = await axios.get(endpointUrl, { params });
    const pages = response.data.query.pages;
    const pageId = Object.keys(pages)[0]; // Get the first page ID

    if (
      pageId !== "-1" &&
      pages[pageId].thumbnail &&
      pages[pageId].thumbnail.source
    ) {
      return pages[pageId].thumbnail.source;
    } else {
      console.error("No image found for:", title);
      return "missing.jpeg";
    }
  } catch (error) {
    console.error("Failed to fetch image from Wikipedia:", error);
    return "missing.jpeg";
  }
};

// Function to resolve the correct title with diacritical marks
const resolveTitle = async (query) => {
  const searchParams = {
    action: "query",
    format: "json",
    list: "search",
    srsearch: query,
    origin: "*",
  };

  try {
    const response = await axios.get(endpointUrl, { params: searchParams });
    const searchResults = response.data.query.search;
    return searchResults.length > 0 ? searchResults[0].title : null;
  } catch (error) {
    console.error("Error searching Wikipedia for:", query, error);
    return null;
  }
};

function resolveName(fullName) {
  const parts = fullName.trim().split(" ");
  const firstName = parts.shift();
  const lastName = parts.join(" ");

  return { firstName, lastName };
}

const PlayerCard = ({ _, co2, name, km, tournaments, country, pos }) => {
  const [imageUrl, setImageUrl] = useState("missing.jpeg");
  let cardClass = "";
  let titleClass = "";
  if (pos <= 3) {
    cardClass = `player-card-color-${pos % 11}`;
    titleClass = `title-color-${pos % 11}`;
  } else {
    cardClass = "player-card-color";
    titleClass = "title-color";
  }

  const averageCo2 = 4.6;
  const co2Ratio = co2 / averageCo2;

  useEffect(() => {
    fetchWikipediaImage(name).then(setImageUrl);
  }, [name]);

  const parsedName = resolveName(name);

  return (
    <div className={`player-card ${cardClass}`}>
      <h1 className={`${titleClass}`}># {pos}</h1>
      <h2 className="player-name">
        {" "}
        {parsedName.firstName} {parsedName.lastName} {country}
      </h2>
      <div className="content">
        <div className="image-container">
          <img src={imageUrl} alt={`${name}`} />
        </div>
        <div className="info">
          <b style={{ fontWeight: "800" }}>💨 {co2.toFixed(2)}</b> CO2 tons
          <p>⚠️ {co2Ratio.toFixed(1)}x more than average person</p>
          <p>✈️ {km.toLocaleString()} km</p>
          <p>🎾 {tournaments} tournaments played</p>
        </div>
      </div>
    </div>
  );
};

export default PlayerCard;
