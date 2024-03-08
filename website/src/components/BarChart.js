import * as React from "react";
import { BarChart } from "@mui/x-charts/BarChart";
import { axisClasses } from "@mui/x-charts/ChartsAxis";
import { chartsGridClasses } from "@mui/x-charts/ChartsGrid";

export default function BasicBars() {
  const otherSetting = {
    yAxis: [
      {
        label: "Average CO2 Emissions per Sport (tons)",
        scaleType: "linear",
        valueFormatter: (value) => `${value / 1000}k`,
      },
    ],
  };

  return (
    <BarChart
      sx={{
        [`.${axisClasses.root}`]: {
          [`.${axisClasses.label}`]: {
            transform: "translateX(-10px) !important",
          },
        },
        [`& .${axisClasses.left} .${axisClasses.label}`]: {
          transform: "translateX(-10px)",
        },
        [`& .${chartsGridClasses.line}`]: {
          strokeDasharray: "5 3",
          strokeWidth: 3,
        },
      }}
      grid={{ horizontal: true }}
      xAxis={[
        {
          scaleType: "band",
          data: ["NFL", "MLS", "NBA", "ATP", "F1"],
          colorMap: {
            type: "ordinal",
            colors: ["#FFC30B", "#DAA520", "#FFF44F", "#FFDB58", "#737000"],
          },
        },
      ]}
      series={[{ data: [3726.4, 8972.6, 1123.4, 2200.8, 13029.2] }]}
      width={700}
      height={400}
      slotProps={{
        bar: {
          clipPath: `inset(0px round 8px 8px 0px 0px)`,
        },
      }}
      {...otherSetting}
    />
  );
}
