import React from "react";
import {
  VerticalTimeline,
  VerticalTimelineElement,
} from "react-vertical-timeline-component";
import "react-vertical-timeline-component/style.min.css";

function cleanDate(date) {
  const [year, month, day] = date.split("-");
  return `${day}/${month}/${year}`;
}

const MyTimeline = ({ tournaments, cities, routes }) => (
  <VerticalTimeline lineColor="#121212">
    <VerticalTimelineElement
      className="vertical-timeline-element--work"
      contentStyle={{
        background: "rgba(255, 255, 255, 0.2)",
        color: "#000",
        borderRadius: "16px",
        boxShadow: "0 4px 30px rgba(0, 0, 0, 0.1)",
        backdropFilter: "blur(5px)",
        border: "2px solid rgba(255, 255, 255, 0.3)",
      }}
      contentArrowStyle={{
        borderRight: "7px solid rgba(255, 255, 255, 0.2)",
      }}
      iconStyle={{ background: "#000", color: "#000" }}
    >
      <h3 className="vertical-timeline-element-title">Start of your Season</h3>
      <h4 className="vertical-timeline-element-subtitle">
        {cities.startCity.city}
      </h4>
    </VerticalTimelineElement>
    {tournaments.map((tournament, index) => {
      const route = routes[index][0];
      const mode = route.mode ? route.mode : "driving/train";
      const name = route.mode ? route.from : route.from.name;
      const CO2 = route.mode
        ? (parseFloat(route.CO2) / 1000 / 1000).toFixed(2)
        : (parseFloat(route.CO2) / 1000).toFixed(2);
      const dist = (parseFloat(route.distance) / 1000).toFixed(2);
      let icon = null;
      let width = 90;
      let height = 110;
      switch (tournament.cat) {
        case "ATP 250":
          icon = "icons/250.png";
          break;
        case "ATP 500":
          icon = "icons/500.png";
          break;
        case "ATP 1000":
          icon = "icons/1000.svg";
          break;
        case "Grand Slam":
          switch (tournament.city) {
            case "Melbourne":
              icon = "icons/ao.png";
              width = 100;
              height = 100;
              break;
            case "Paris":
              icon = "icons/rg.svg";
              break;
            case "London":
              icon = "icons/wimbledon.svg";
              width = 110;
              break;
            case "New York":
              icon = "icons/uso.svg";
              width = 110;
              break;
          }
      }
      return (
        <VerticalTimelineElement
          key={index}
          className="vertical-timeline-element--work"
          contentStyle={{
            background: "rgba(255, 255, 255, 0.2)",
            color: "#000",
            borderRadius: "16px",
            boxShadow: "0 4px 30px rgba(0, 0, 0, 0.1)",
            backdropFilter: "blur(5px)",
            border: "2px solid rgba(255, 255, 255, 0.3)",
          }}
          contentArrowStyle={{
            borderRight: "7px solid rgba(255, 255, 255, 0.2)",
          }}
          iconStyle={{ background: "#000", color: "#000" }}
        >
          <div
            className="title-container"
            style={{
              display: "flex",
              flexDirection: "row",
              flexWrap: "nowrap",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div>
              <h2
                className="vertical-timeline-element-title"
                style={{ color: "#ffd700" }}
              >
                {" "}
                {tournament.cat}{" "}
              </h2>
              <h3 className="vertical-timeline-element-title">
                {tournament.city}, {tournament.country}
              </h3>
              <h4 className="vertical-timeline-element-subtitle">
                {cleanDate(tournament.from_dt)} - {cleanDate(tournament.to_dt)}
              </h4>
            </div>
            <div>
              <img src={icon} alt="icon" width={width} height={height} />
            </div>
          </div>

          <p>
            You have traveled from {name}, using {mode} and emitting {CO2} tons
            of CO2 in {dist} km.
          </p>
        </VerticalTimelineElement>
      );
    })}
    <VerticalTimelineElement
      className="vertical-timeline-element--work"
      contentStyle={{
        background: "rgba(255, 255, 255, 0.2)",
        color: "#000",
        borderRadius: "16px",
        boxShadow: "0 4px 30px rgba(0, 0, 0, 0.1)",
        backdropFilter: "blur(5px)",
        border: "2px solid rgba(255, 255, 255, 0.3)",
      }}
      contentArrowStyle={{
        borderRight: "7px solid rgba(255, 255, 255, 0.2)",
      }}
      iconStyle={{ background: "#000", color: "#000" }}
    >
      <h3 className="vertical-timeline-element-title">End of your Season</h3>
      <h4 className="vertical-timeline-element-subtitle">
        {cities.endCity.city}
      </h4>
    </VerticalTimelineElement>
  </VerticalTimeline>
);

export default MyTimeline;
