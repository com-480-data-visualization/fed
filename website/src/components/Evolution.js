import axios from "axios";
import React, { useState, useEffect } from "react";

import { LineChart } from "@mui/x-charts/LineChart";
import { useDrawingArea } from "@mui/x-charts/hooks";

import "../style/evolution.css";

const Colorswitch = () => {
  const { top, height, bottom } = useDrawingArea();
  const svgHeight = top + bottom + height;

  return (
    <>
      <defs>
        <linearGradient
          id="paint_linear"
          x1="300.25"
          y1="46.9999"
          x2="300.25"
          y2={`${svgHeight}px`}
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#ffd700" stopOpacity="0.2" />
          <stop offset="1" stopColor="#ffd700" stopOpacity="0.05" />
        </linearGradient>
      </defs>
    </>
  );
};

export default function Evolution() {
  const [data, setData] = useState({ x: [], y: [] });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get("data/polluter/co2_median.csv");
        const rows = response.data.split("\n");
        const x = [];
        const y = [];

        rows.forEach((row, index) => {
          if (row && index > 0) {
            const columns = row.split(",");
            x.push(columns[0]);
            y.push(parseFloat(columns[1]));
          }
        });

        setData({ x, y });
      } catch (error) {
        console.error("Error fetching CSV data: ", error);
      }
    };

    fetchData();
  }, []);

  const customize = {
    legend: { hidden: false },
    margin: { top: 15 },
    stackingOrder: "descending",
  };

  const otherSetting = {
    yAxis: [{ label: "Median CO2 Emissions per Player (tons)" }],
  };

  return (
    <LineChart
      xAxis={[
        {
          valueFormatter: (value) => value.toString(),
          label: "Year",
          data: data.x,
          min: 2000,
          max: 2023,
        },
      ]}
      series={[
        {
          color: "#FFD700",
          showMark: true,
          data: data.y,
          area: {
            visible: true,
          },
        },
      ]}
      {...customize}
      width={700}
      height={400}
      {...otherSetting}
      className="chart"
      sx={{
        "& .MuiLineElement-root": {
          strokeWidth: 4,
        },
        "& .MuiAreaElement-root": {
          fill: "url(#paint_linear)",
        },
      }}
    >
      <Colorswitch />
    </LineChart>
  );
}
