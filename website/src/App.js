import React, { useState, useEffect, useRef } from "react";

import { AppProvider } from "./components/GlobalContext";

import "./style.css";
import ProgressBar from "./components/Progress";
import Home from "./components/Home";
import Introduction from "./components/Introduction";
import ChartContainer from "./components/Chart";
import CardSlider from "./components/Slider";
import Calendar from "./components/Calendar";
import MapWithPopup from "./components/Map";
import Footer from "./components/Footer";
import Conclusion from "./components/Conclusion";
import Correlation from "./components/Correlation";
import { ActiveLinkProvider } from "./components/ActiveLinkContext";

const App = () => {
  const targetRef = useRef(null);

  useEffect(() => {
    document.body.style.overflow = "hidden";

    const timer = setTimeout(() => {
      document.body.style.overflow = "auto";
    }, 800);

    return () => {
      document.body.style.overflow = "auto";
      clearTimeout(timer);
    };
  }, []);

  return (
    <div>
      <ActiveLinkProvider>
        <ProgressBar />
        <Home />
        <div style={{ margin: "80px", marginTop: "50vh" }}>
          <Introduction />
          <ChartContainer />
          <CardSlider />
          <Correlation />
          <MapWithPopup />
          <AppProvider>
            <Calendar />
          </AppProvider>
          <Conclusion />
        </div>
        <Footer />
      </ActiveLinkProvider>
    </div>
  );
};

export default App;
