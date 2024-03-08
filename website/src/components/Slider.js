import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import "../style/slider.css";

import axios from "axios";
import React, { useState, useEffect, useRef } from "react";
import { useActiveLink } from "./ActiveLinkContext";

import Slider from "react-slick";
import PlayerCard from "./PlayerCard";

const CardSlider = () => {
  const [year, setYear] = useState(new Date().getFullYear() - 1);
  const [data, setData] = useState([]);

  useEffect(() => {
    axios
      .get(`data/polluter/${year}_with_co2.csv`)
      .then((response) => {
        const parsedData = parseCSV(response.data);
        setData(parsedData);
      })
      .catch((error) => console.error("Error fetching data: ", error));
  }, [year]);

  const parseCSV = (csvData) => {
    const rows = csvData.split("\n").slice(1);
    const formattedData = rows
      .map((row) => {
        const [
          player,
          co2,
          km,
          tournaments,
          rank,
          name,
          ioc,
          country,
          matches,
        ] = row.split(",");
        return {
          player,
          co2: parseFloat(co2),
          name,
          km: Math.round(parseFloat(km)),
          tournaments: parseInt(tournaments),
          country,
        };
      })
      .sort((a, b) => b.co2 - a.co2)
      .slice(0, 10);
    return formattedData;
  };

  const settings = {
    dots: true,
    dotsClass: "button-dots",
    infinite: false,
    speed: 1000,
    slidesToShow: 3,
    slidesToScroll: 3,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 3,
          slidesToScroll: 3,
          infinite: true,
          dots: true,
        },
      },
      {
        breakpoint: 600,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 2,
          initialSlide: 2,
        },
      },
      {
        breakpoint: 480,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
        },
      },
    ],
  };

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
            setActiveLink("ranking");
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
    <div className="ranking" id="ranking" ref={ref}>
      <h1 className="fancy title">Hall of Shame</h1>
      <div className="ranking-title">
        <h2 className="ranking-subtitle">
          Tennis Players and Their Carbon Footprint
        </h2>
        <select
          defaultValue={year}
          className="year_selector"
          onChange={(e) => setYear(e.target.value)}
        >
          {[...Array(24)].map((_, index) => (
            <option key={2000 + index} value={2000 + index}>
              {2000 + index}
            </option>
          ))}
        </select>
      </div>
      <p className="ranking-description">
        As the tennis season unfolds, each match leaves behind more than just
        scores and highlights — it also leaves a trail of carbon emissions. Our
        Environmental Impact Leaderboard brings these unseen traces into the
        spotlight by ranking the top 10 players based on their travel-related
        CO2 emissions. This narrative unfolds through the lens of data,
        revealing not just numbers but the stories behind them: which players
        are the largest contributors to the sport’s environmental impact and how
        their travel decisions shape the ecological landscape of professional
        tennis.
      </p>
      <div className="slider">
        <Slider {...settings}>
          {data.map((item, index) => (
            <PlayerCard
              key={index}
              co2={item.co2}
              name={item.name}
              km={item.km}
              tournaments={item.tournaments}
              country={item.country}
              pos={index + 1}
            />
          ))}
        </Slider>
      </div>
    </div>
  );
};

export default CardSlider;
