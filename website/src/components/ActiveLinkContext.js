import React, { createContext, useContext, useState, useEffect } from "react";

const ActiveLinkContext = createContext();

export const useActiveLink = () => useContext(ActiveLinkContext);

export const ActiveLinkProvider = ({ children }) => {
  const [activeLink, setActiveLink] = useState("");
  useEffect(() => {
    console.log("Active Link Updated:", activeLink); // Log the active link changes
  }, [activeLink]);
  return (
    <ActiveLinkContext.Provider value={{ activeLink, setActiveLink }}>
      {children}
    </ActiveLinkContext.Provider>
  );
};
