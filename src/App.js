import { Route, Routes } from "react-router-dom";
import "./App.scss";
import "bootstrap/dist/css/bootstrap.min.css";
import Home from "./views/Home";
import { useEffect, useState } from "react";
import Web3 from "web3";
import freelance from "../src/build/contracts/AssetTracker.json";
import BlockchainContext from "./context/BlockChainContext";
import GlobalState from "./context/GlobalState";
import BloodBankLogin from "./views/BloodBankLogin";
import BloodBankHome from "views/BloodBankHome";
import BloodCollection from "views/BloodCollection";
import EditDetail from "views/EditDetails";
import HospitalLogin from "views/HospitalLogin";
import HospitalHome from "views/HospitalHome";

const getWeb3 = async () => {
  let tempWeb3 = undefined;
  if (window.ethereum) {
    tempWeb3 = new Web3(window.ethereum);
    try {
      // Request account access if needed
      await window.ethereum.enable();
      // console.log(tempWeb3);
      //console.log(web3.eth.getAccounts());
      // Acccounts now exposed
    } catch (error) {
      // User denied account access...
    }
  }
  // Legacy dapp browsers...
  else if (tempWeb3) {
    tempWeb3 = new Web3(tempWeb3.currentProvider);
    // console.log(tempWeb3);
    // Acccounts always exposed
  }
  // Non-dapp browsers...
  else {
    console.log(
      "Non-Ethereum browser detected. You should consider trying MetaMask!"
    );
  }

  return tempWeb3;
};

function App() {
  const [web3, setWeb3] = useState(undefined);
  const [accounts, setAccounts] = useState([]);
  const [contract, setContract] = useState();

  useEffect(() => {
    const init = async () => {
      // load web3
      const tempWeb3 = await getWeb3();
      // loadBlockchainData
      const tempAccounts = await tempWeb3.eth.getAccounts();
      const networkId = await tempWeb3.eth.net.getId();
      let freelancecon;

      const listener = (accs) => {
        setAccounts(accs);
      };

      window.ethereum.on("accountsChanged", listener);

      const networkdata = freelance.networks[networkId];
      if (networkdata) {
        const abi = freelance.abi;
        // console.log("freelance.abi", freelance.abi);
        freelancecon = new tempWeb3.eth.Contract(abi, networkdata.address);
      }

      // saving this to states
      setWeb3(tempWeb3);
      setAccounts(tempAccounts);
      setContract(freelancecon);
      // console.log("contract init", contract);
      // console.log("accounts", accounts);
      // console.log("web3", web3);
    };

    init();
  }, []);

  return (
    <>
      <GlobalState>
        <BlockchainContext.Provider value={{ web3, accounts, contract }}>
          <Routes>
            <Route path="/" element={<Home />}></Route>
            <Route path="/loginBloodBank" element={<BloodBankLogin />}></Route>
            <Route path="/bloodBankhome" element={<BloodBankHome />}></Route>
            <Route path="/bloodCollection" element={<BloodCollection />} />
            <Route path="/editDetails" element={<EditDetail />}></Route>
            <Route path="/loginHospital" element={<HospitalLogin />} />
            <Route path="/hospitalHome" element={<HospitalHome />} />
          </Routes>
        </BlockchainContext.Provider>
      </GlobalState>
    </>
  );
}

export default App;
