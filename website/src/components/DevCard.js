import React from "react";
import "../style/devcard.css";

const DevCard = ({ name, description, imageUrl }) => {
  return (
    <div className="dev-card">
      <div className="dev-card-image">
        <img src={imageUrl} alt={name} />
      </div>
      <div className="dev-card-info">
        <h2 style={{ whiteSpace: "pre-wrap" }}>{name}</h2>
        <p>{description}</p>
      </div>
    </div>
  );
};

export default DevCard;
