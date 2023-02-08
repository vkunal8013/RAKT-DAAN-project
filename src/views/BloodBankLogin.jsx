import { Button, Container, Form } from "react-bootstrap";
import CustomNavbar from "../components/CustomNavbar";
import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import BlockChainContext from "../context/BlockChainContext";
import globalContext from "../context/GlobalContext";

export default function BloodBankLogin() {
  const [emailInput, setEmail] = useState("");
  const [passInput, setPass] = useState("");

  const { web3, accounts, contract } = useContext(BlockChainContext);
  const { setUserHelper } = useContext(globalContext);

  const navigate = useNavigate();

  useEffect(() => {
    addBloodBanks();
  }, []);

  async function addBloodBanks() {
    let data = [
      {
        name: "Vijayee Blood Bank",
        id: "0xfa5467EF027d8Ac60c94281fC2DcC980103Fe1b2",
        email: "bb1@gmail.com",
        pass: "1234",
        type: "1", // Blood bank
        add: "Sector 22, Nerul, Navi Mumbai, Maharashtra 400706",
        no: "+91 8446417448",
        loc: "19.031413,73.016422",
      },
      {
        name: "Prabodhan Blood Bank",
        id: "0x069fd32BF5273A3A993e11b45C4d8a26dF72D9Db",
        email: "bb2@gmail.com",
        pass: "1234",
        type: "1", // Blood bank
        add: "Piramal Nagar, Goregaon West, Mumbai, Maharashtra 400104",
        no: "+91 8446417448",
        loc: "19.159587,72.845633",
      },
      {
        name: "Ridhi sidhi Blood Bank",
        id: "0xA185E5b84e0Fcf643D03E6d57E4e597Af729409d",
        email: "bb3@gmail.com",
        pass: "1234",
        type: "1", // Blood bank
        add: "Sector 8, Nerul, Navi Mumbai, Maharashtra 400706",
        no: "+91 8446417448",
        loc: "19.043413,73.015516",
      },
      {
        name: "Bloodline Blood Bank",
        id: "0x91747F539e803b584435C6444c031FDA04a9a783",
        email: "bb4@gmail.com",
        pass: "1234",
        type: "1", // Blood bank
        add: "Dr Ambedkar Rd, Thane West, Thane, Maharashtra 400601",
        no: "+91 8446417448",
        loc: "19.200753,72.974882",
      },
      {
        name: "Samarpan Blood Centre",
        id: "0xD856C173371a6189637334AFEDe18513C21313b6",
        email: "bb5@gmail.com",
        pass: "1234",
        type: "1", // Blood bank
        add: "Lal Bahadur Shastri Rd, Ghatkopar West, Mumbai, Maharashtra 400086",
        no: "+91 8446417448",
        loc: "19.09339,72.913659",
      },
    ];
    for (var i = 0; i < data.length; i++) {
      if (data[i]["id"] === accounts[0]) {
        try {
          console.log(contract);
          await contract.methods
            .addidentity(
              data[i]["name"],
              accounts[0],
              data[i]["email"],
              data[i]["pass"],
              data[i]["type"],
              data[i]["add"],
              data[i]["no"],
              data[i]["loc"]
            )
            .send({ from: accounts[0] });

          var ad = await contract.methods.getUserCount().call();
          console.log(ad);
        } catch (err) {
          console.log("Error in creation", err);
        }
      }
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
        navigate("/bloodBankHome");
      } catch (err) {
        console.log("Cannot login ", err);
      }
    }
  }

  return (
    <>
      <CustomNavbar url="loginBloodBank" />
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
