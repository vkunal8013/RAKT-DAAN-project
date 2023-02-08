import CustomNavbar from "components/CustomNavbar";
import BlockChainContext from "context/BlockChainContext";
import globalContext from "context/GlobalContext";
import { useContext, useState } from "react";
import { Button, Container, Form } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

export default function BloodCollection() {
  const { web3, accounts, contract } = useContext(BlockChainContext);
  const { user } = useContext(globalContext);
  const [data, setData] = useState({
    bloodId: "",
    batchNo: "",
    aadharNo: "",
    bloodGroup: "",

    verified: false,
    collectionDate: new Date().toLocaleString().split(",")[0],
    location: "",
  });

  const navigate = useNavigate();

  function inputChangeHandler(e) {
    const { name, value } = e.target;
    setData((prevVal) => {
      return {
        ...prevVal,
        [name]: value,
      };
    });
  }

  async function formSubmit(e) {
    e.preventDefault();
    console.log(data);
    if (true) {
      try {
        await contract.methods
          .createAsset(
            data.bloodId,
            data.batchNo,
            data.aadharNo,
            // to save blood bank name
            user.name,
            data.bloodGroup,
            new Date(Date.now() + 42 * 86400000)
              .toLocaleString("en-GB")
              .split(" ")[0],
            user.location
          )
          .send({ from: accounts[0] });
        navigate("/bloodbankhome");
      } catch (err) {
        console.log("Error in creation");
      }
    } else {
      alert(`${"Enter Valid credentials"}`);
    }
  }

  return (
    <>
      <CustomNavbar url="bloodBankHome" />
      <Container fluid className="bloodCollectionContainer">
        <Container className="bloodCollectionFormContainer">
          <p className="text-center ">Enter the Following Details</p>
          <Form>
            <Form.Group controlId="bloodIDInput">
              <Form.Label>Blood ID</Form.Label>
              <Form.Control
                name="bloodId"
                type="text"
                placeholder="Enter Blood ID"
                value={data.bloodId}
                onChange={inputChangeHandler}
              ></Form.Control>
            </Form.Group>
            <Form.Group controlId="batchNoInput">
              <Form.Label>Batch No</Form.Label>
              <Form.Control
                name="batchNo"
                type="text"
                placeholder="Enter Batch No"
                value={data.batchNo}
                onChange={inputChangeHandler}
              ></Form.Control>
            </Form.Group>
            <Form.Group controlId="aadharNoInput">
              <Form.Label>Aadhar No</Form.Label>
              <Form.Control
                name="aadharNo"
                type="text"
                placeholder="Enter Aadhar No"
                value={data.aadharNo}
                onChange={inputChangeHandler}
              ></Form.Control>
            </Form.Group>
            <Form.Group controlId="bloodGroupInput">
              <Form.Label>Blood Group</Form.Label>
              <Form.Select
                name="bloodGroup"
                value={data.bloodGroup}
                onChange={inputChangeHandler}
              >
                <option value="select">Select</option>
                <option value="A +ve">A +ve</option>
                <option value="A -ve">A -ve</option>
                <option value="B +ve">B +ve</option>
                <option value="B -ve">B -ve</option>
                <option value="O +ve">O +ve</option>
                <option value="O -ve">O -ve</option>
                <option value="AB +ve">AB +ve</option>
                <option value="AB -ve">AB -ve</option>
              </Form.Select>
            </Form.Group>
            <Button className="mt-2" type="submit" onClick={formSubmit}>
              Submit
            </Button>
          </Form>
        </Container>
      </Container>
    </>
  );
}
