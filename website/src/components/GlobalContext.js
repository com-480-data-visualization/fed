import React, { createContext, useContext, useState } from "react";

const AppContext = createContext();

export const useAppContext = () => useContext(AppContext);

export const AppProvider = ({ children }) => {
  const [selectedTournaments, setSelectedTournaments] = useState([]);
  const [cities, setCities] = useState({ startCity: "", endCity: "" });

  return (
    <AppContext.Provider
      value={{ selectedTournaments, setSelectedTournaments, cities, setCities }}
    >
      {children}
    </AppContext.Provider>
  );
};
