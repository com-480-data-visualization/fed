import React, { useRef, useState, useEffect } from "react";
import { useActiveLink } from "./ActiveLinkContext";
import Spider from "./Spider";

import "../style/correlation.css";

const Correlation = () => {
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
            setActiveLink("correlation");
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
    <div id="correlation" ref={ref}>
      <h1 className="fancy title">Correlation Analysis</h1>
      <p className="correlation-description">
        Dive into the depths of data with our Radar Chart Analysis, where we
        intricately map the relationship between CO2 emissions and various
        performance metrics such as ATP rankings and number of matches played.
        This visualization not only highlights direct correlations but also
        unveils complex patterns that could inform more sustainable practices
        within the tennis circuit. Explore these interactive charts to gain a
        comprehensive understanding of how different factors intertwine with
        environmental impacts, offering a clearer path towards reducing the
        carbon footprint of professional tennis.
      </p>
      <div>
        <Spider dataStringPath="data/spider/2023.json" />
      </div>
    </div>
  );
};

export default Correlation;
