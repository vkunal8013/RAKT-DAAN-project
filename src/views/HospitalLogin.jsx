import { Button, Container, Form } from "react-bootstrap";
import CustomNavbar from "../components/CustomNavbar";
import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import BlockChainContext from "../context/BlockChainContext";
import globalContext from "../context/GlobalContext";

export default function HospitalLogin() {
  const [emailInput, setEmail] = useState("");
  const [passInput, setPass] = useState("");

  const { web3, accounts, contract } = useContext(BlockChainContext);
  const { setUserHelper } = useContext(globalContext);

  const navigate = useNavigate();

  useEffect(() => {
    addHospitals();
  }, []);

  async function addHospitals() {
    try {
      await contract.methods
        .addidentity(
          "ANKUR MULTISPECIALITY HOSPITAL",
          "0xB4FE5b49f871C3bDAb59fC50C5f86000DC2122fE",
          "hsp@gmail.com",
          "1234",
          "0", //hospital
          "RB2 Central Railway Quarters, Jain Society, Sion, Mumbai",
          "+91 8446417448",
          "19.036607,72.860112"
        )
        .send({ from: accounts[0] });

      var ad1 = await contract.methods.getUserCount().call();
      console.log(ad1);
    } catch (err) {
      console.log("Error in creation", err);
    }
  }

  async function formSubmit(e) {
    e.preventDefault();

    if (emailInput.trim() !== "" && passInput.trim() !== "") {
      try {
        var accountData = await contract.methods
          .getLogin(accounts[0], emailInput.toString(), passInput.toString())
          .call();

        var currentUser = {
          name: accountData[0],
          email: emailInput.toString(),
          type: accountData[1],
          add: accountData[2],
          no: accountData[3],
          location: accountData[4],
        };

        setUserHelper(currentUser);
        navigate("/hospitalHome");
      } catch (err) {
        console.log("Cannot login ", err);
      }
    }
  }

  return (
    <>
      <CustomNavbar url="loginHospital" />
      <Container fluid className="loginContainer">
        <Container className="loginBox">
          <Form>
            <Form.Group controlId="emailInput">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                placeholder="Enter Email"
                value={emailInput}
                onChange={(e) => setEmail(e.target.value)}
              ></Form.Control>
            </Form.Group>
            <Form.Group controlId="passInput">
              <Form.Label>Password</Form.Label>
              <Form.Control
                type="password"
                placeholder="Enter Password"
                value={passInput}
                onChange={(e) => setPass(e.target.value)}
              ></Form.Control>
            </Form.Group>
            <Button className="my-3" type="submit" onClick={formSubmit}>
              Login
            </Button>
          </Form>
        </Container>
      </Container>
    </>
  );
}
