import React, { useState, useEffect, useRef } from "react";
import "../style/home.css";

import { useActiveLink } from "./ActiveLinkContext";

import { motion } from "framer-motion";

export default function Home() {
  const { activeLink, setActiveLink } = useActiveLink();

  const handleScrollToIntro = (event) => {
    event.preventDefault();
    const targetElement = document.getElementById("intro");
    if (targetElement) {
      const elementTop =
        targetElement.getBoundingClientRect().top + window.scrollY;
      const offset = (window.innerHeight - targetElement.offsetHeight) / 2;
      window.scrollTo({
        top: elementTop - offset,
        behavior: "smooth",
      });
    }
  };

  const handleScrollToElement = (event) => {
    event.preventDefault();
    const targetId = event.target.getAttribute("href").slice(1);
    const targetElement = document.getElementById(targetId);
    setActiveLink(targetId);
    if (targetElement) {
      const elementTop =
        targetElement.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({
        top: elementTop - 90,
        behavior: "smooth",
      });
    }
  };

  return (
    <div className="background-effects">
      <main className="main">
        <div className="mainDiv">
          <motion.nav
            initial={{ opacity: 0, y: 0 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 3, ease: "easeInOut" }}
          >
            {["evolution", "ranking", "correlation", "map", "planner"].map(
              (id) => (
                <a
                  key={id}
                  href={`#${id}`}
                  onClick={handleScrollToElement}
                  className={activeLink === `${id}` ? "active" : ""}
                >
                  {id.charAt(0).toUpperCase() + id.slice(1).replace(/_/g, " ")}
                </a>
              )
            )}
          </motion.nav>
          <motion.h1
            className="bigTitle"
            initial={{ opacity: 0, y: 0, scale: 1 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.4, ease: "easeInOut" }}
          >
            <span className="welcomeText"> GreenAce.</span> A Greener{" "}
            <span>
              <img
                src="icons/atp.png"
                width={170}
                height={70}
                style={{
                  transform: "translateY(27%)",
                  padding: "0 12px 0 12px",
                }}
              />
            </span>{" "}
            is possible!
          </motion.h1>
          <motion.h2
            className="subTitle"
            initial={{ opacity: 0, y: 0 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.4, ease: "easeInOut" }}
          >
            A Data-Visualization project to raise awareness about the carbon in
            the tennis industry.
          </motion.h2>
          <motion.h3
            className="subSubTitle"
            initial={{ opacity: 0, y: 0 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 2, ease: "easeInOut" }}
          >
            EPFL - CS 480 - 2024
          </motion.h3>
          <a href="#intro" onClick={handleScrollToIntro}>
            <svg className="arrows">
              <path className="a1" d="M0 0 L30 32 L60 0"></path>
              <path className="a2" d="M0 20 L30 52 L60 20"></path>
              <path className="a3" d="M0 40 L30 72 L60 40"></path>
            </svg>
          </a>
        </div>
      </main>
    </div>
  );
}
