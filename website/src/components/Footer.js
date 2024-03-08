import React from "react";
import DevCard from "./DevCard";

import "../style/footer.css";

const Footer = () => {
  const devs = [
    {
      id: 1,
      name: "François Dumoncel",
      description: "MSc Student in Data Science",
      imageUrl: "fran.jpeg",
    },
    {
      id: 2,
      name: "Alexandre Doukhan",
      description: "MSc Student in Cybersecurity",
      imageUrl: "doukhan.jpeg",
    },
    {
      id: 3,
      name: "Edouard\nMichelin",
      description: "MSc Student in Cybersecurity",
      imageUrl: "edouard.jpeg",
    },
  ];

  return (
    <footer>
      <div className="footer-title">
        <h1>Made with ❤️ by the team</h1>
      </div>
      <div className="devs">
        {devs.map((dev) => (
          <DevCard
            key={dev.id}
            name={dev.name}
            description={dev.description}
            imageUrl={dev.imageUrl}
          />
        ))}
      </div>
      <div className="copyright" style={{ color: "rgba(12, 12, 12, 0.5)" }}>
        <h5>© EPFL - 2024</h5>
      </div>
    </footer>
  );
};

export default Footer;
