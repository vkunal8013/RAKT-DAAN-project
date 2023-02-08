import React, { useState } from "react";
import GlobalContext from "./GlobalContext";

const GlobalState = (props) => {
  const [user, setUser] = useState({});

  const setUserHelper= (user) => {
    setUser(user);
  };

  return (
    <GlobalContext.Provider value={{ user, setUserHelper }}>
      {props.children}
    </GlobalContext.Provider>
  );
};

export default GlobalState;

