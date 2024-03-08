import React, { useState, useEffect } from "react";
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from "chart.js";
import { Radar } from "react-chartjs-2";
import axios from "axios";
import "../style/spider.css";

ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
);
const Spider = ({ dataStringPath }) => {
  const [players, setPlayers] = useState([]);
  const [selectedPlayer, setSelectedPlayer] = useState("Novak Djokovic");
  const [data, setData] = useState({});
  const [chartData, setChartData] = useState({});
  const [chartOptions, setChartOptions] = useState({});

  useEffect(() => {
    // Fetch the initial data
    axios
      .get(dataStringPath)
      .then((response) => {
        if (response.data) {
          setPlayers(Object.keys(response.data)); // Ensure response.data is defined
          setData(response.data);
        } else {
          console.error("No data available");
        }
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
      });
  }, [dataStringPath]);

  useEffect(() => {
    if (selectedPlayer && data[selectedPlayer]) {
      updateChartData(data[selectedPlayer]);
    }
  }, [selectedPlayer, data]);

  const updateChartData = (record) => {
    const data = {
      labels: Object.keys(record),
      datasets: [
        {
          label: selectedPlayer,
          backgroundColor: "rgba(255, 215, 0, 0.2)",
          borderColor: "rgba(255, 215, 0, 1)",
          pointBackgroundColor: "rgba(255, 215, 0, 1)",
          pointBorderColor: "#000",
          pointHoverBackgroundColor: "#000",
          pointHoverBorderColor: "rgba(255, 215, 0, 1)",
          data: Object.values(record),
        },
      ],
    };

    setChartData(data);
    setChartOptions({
      scales: {
        r: {
          pointLabels: {
            font: {
              size: 20,
            },
          },
          angleLines: {
            display: true,
            lineWidth: 2,
          },
          ticks: {
            beginAtZero: true,
            backdropColor: "transparent",
          },
          grid: {
            lineWidth: 2,
          },
        },
      },
      plugins: {
        legend: {
          display: false,
          position: "top",
          labels: {
            font: {
              size: 16,
            },
          },
        },
      },
      elements: {
        line: {
          borderWidth: 3,
        },
      },
      maintainAspectRatio: false,
    });
  };

  return (
    <div>
      <div className="flex">
        <div className="select-dropdown">
          <select
            id="player-select"
            value={selectedPlayer}
            onChange={(e) => setSelectedPlayer(e.target.value)}
            style={{ margin: "10px", width: "200px" }}
          >
            <option value="">Select a player</option>
            {players &&
              players.map((player) => (
                <option key={player} value={player}>
                  {player}
                </option>
              ))}
          </select>
        </div>
        {selectedPlayer && chartData.datasets && (
          <div className="container">
            <Radar data={chartData} options={chartOptions} />
          </div>
        )}
      </div>
    </div>
  );
};

export default Spider;
