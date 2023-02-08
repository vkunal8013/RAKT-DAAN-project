import { useContext, useState } from "react";
import globalContext from "../context/GlobalContext";
import BlockChainContext from "../context/BlockChainContext";
import CustomNavbar from "../components/CustomNavbar";
import { Container, Row, Col, Spinner } from "react-bootstrap";
import ProfileHeader from "../components/ProfileContainer";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DonatorCard from "components/DonatorCard";
import FetchFromAadhar from "api/AadharAPI";

export default function BloodBankHome(props) {
  const [data, setData] = useState();
  const [count, setCount] = useState();
  var bCount = 0;

  const { web3, accounts, contract } = useContext(BlockChainContext);
  const { user } = useContext(globalContext);

  const navigate = useNavigate();

  async function fetchData() {
    console.log(data, count);
    console.log(user);
    // Work if comng from Edit Detail Page
    try {
      if (props && props.location !== undefined) {
        console.log(props.location.state);
        // console.log(props.location.state.entireData);
        props.location.state.entireData[
          props.location.state.card_id_to_be_changed
        ]["verified"] = props.location.state.value.toString();

        // console.log(props.location.state.entireData);
        console.log(props.location.state.countdict);

        setData(props.location.state.entireData);
        console.log("Data", data);
        setCount(props.location.state.countdict);
        console.log("dict", count);
      }
      // work if coming from Login
      else {
        try {
          console.log("inside try catch");
          console.log(user.name.toLowerCase().trim());
          const bloodData = [];
          bCount = await contract.methods.getBloodCount().call();
          var bloodcount = {
            "A +ve": 0,
            "A -ve": 0,
            "B +ve": 0,
            "B -ve": 0,
            "O +ve": 0,
            "O -ve": 0,
            "AB +ve": 0,
            "AB -ve": 0,
          };
          for (let i = 1; i <= bCount; i++) {
            const tag1 = await contract.methods.getBlood2(i).call();
            const tag2 = await contract.methods.getStatus(i, tag1["1"]).call();

            if (
              user.name.toLowerCase().trim() === tag2["2"].toLowerCase().trim()
            ) {
              const tag = await contract.methods.getBlood(i).call();

              //check if the blood belongs to the current blood bank and blood is not expired or not
              bloodcount[tag["4"]] = bloodcount[tag["4"]] + 1; //adding count of each blood to dict

              var temp = {
                id: i,
                bloodId: tag["0"],
                batchNo: tag["1"],
                // email: "",
                // name: "",
                adharNo: tag["2"],
                bloodGroup: tag["4"],
                verified: tag2["3"],
                owner: tag2["2"],
                collectionDate: new Date(1000 * tag2["0"])
                  .toLocaleString("en-GB")
                  .split(" ")[0]
                  .replaceAll("/", " / "),
                expiryDate: tag["5"].replaceAll("/", " / "),
              };
              bloodData.push(temp);
            }
          }
          console.log(bloodData);
          bloodData.reverse();
          setCount(bloodcount);
          setData(bloodData);
          console.log(data);
          console.log("out of try catch");
        } catch (err) {
          console.log(err);
          console.log("Error in register!");
        }
      }
    } catch (e) {
      console.log("First Catch error", e);
    }
  }

  function editDetails(e, d, idx) {
    e.preventDefault();

    navigate("/editDetails", {
      state: {
        id: d.id,
        bloodId: d.bloodId,
        batchNo: d.batchNo,
        email: FetchFromAadhar(d.adharNo).Email,
        name: FetchFromAadhar(d.adharNo).Name,
        adharNo: d.adharNo,
        bloodGroup: d.bloodGroup,
        age: FetchFromAadhar(d.adharNo)["Age"] + " Years",
        verified: d.verified,
        collectionDate: d.collectionDate,
        expiryDate: d.expiryDate,
        owner: d.owner,
        currentBloodBank: user.name,
        cardId: idx,
        entireData: d,
        countdict: count,
      },
    });
  }

  useEffect(() => {
    fetchData();
  }, []);

  if (data && count) {
    console.log(data);
    return (
      <>
        <CustomNavbar url="bloodBankHome" />
        <Container fluid>
          <ProfileHeader
            name={user.name.toUpperCase()}
            address={user.add}
            bloodcount={count}
            phone={user.no}
            email={user.email}
          />
          <Container className="donationContainer">
            <p>Donation History</p>
            <Container className="donatorsContainer">
              <Row>
                {data.map((d, idx) => {
                  return (
                    <Col>
                      <DonatorCard
                        no={d.adharNo}
                        collectionDate={d.collectionDate}
                        bloodID={d.bloodId}
                        batchNo={d.batchNo}
                        bloodGroup={d.bloodGroup}
                        verified={d.verified}
                        onClick={(e) => editDetails(e, d, idx)}
                      />
                    </Col>
                  );
                })}
              </Row>
            </Container>
          </Container>
        </Container>
      </>
    );
  } else {
    return (
      <Container className="preLoaderContainer">
        <Container className="text-center">
          <Spinner animation="grow" variant="danger"></Spinner>
          <Spinner animation="grow" variant="danger"></Spinner>
          <Spinner animation="grow" variant="danger"></Spinner>
          <Spinner animation="grow" variant="danger"></Spinner>
          <Spinner animation="grow" variant="danger"></Spinner>
          <p>Loading</p>
        </Container>
      </Container>
    );
  }
}
