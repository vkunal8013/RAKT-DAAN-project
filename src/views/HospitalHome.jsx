import BlockChainContext from "context/BlockChainContext";
import globalContext from "context/GlobalContext";
import { createRef, useContext, useEffect, useRef, useState } from "react";
import GetDistance from "api/GetDistance";
import FetchFromAadhar from "api/AadharAPI";
import CustomNavbar from "components/CustomNavbar";
import {
  Badge,
  Button,
  Col,
  Container,
  FormSelect,
  Modal,
  ModalBody,
  Row,
} from "react-bootstrap";
import ProfileHeader from "components/ProfileContainer";
import { sha256 } from "js-sha256";
import QrReader from "react-qr-reader";
import Pdf from "react-to-pdf";

const ref = createRef();

export default function HospitalHome() {
  const { web3, accounts, contract } = useContext(BlockChainContext);
  const { user } = useContext(globalContext);

  const [bloodToBeSearched, setBloodToBeSearched] = useState({
    selectedBloodGroup: "select",
    name: "",
  });
  const [loading, setLoading] = useState(false);
  const [modal, setModal] = useState(false);
  const [bloodbankCord, updateBloodbankCord] = useState();

  const qrRef = useRef(null);
  const [code, setCode] = useState("");
  const [hash, setHash] = useState();

  function handleChange(e) {
    const { name, value } = e.target;
    setBloodToBeSearched((prevVal) => {
      return {
        ...prevVal,
        [name]: value,
      };
    });
  }

  function handleUpload() {
    console.log(qrRef);
    if (qrRef && qrRef.current) qrRef.current.openImageDialog();
  }

  function handleScan(data) {
    if (data) {
      setCode(data);
    }
    console.log("data", qrRef);
    // reader.current.reader.result
    console.log("data", qrRef.current.reader.result);
    var h = bloodToBeSearched.adharNo
      .replaceAll(" ", "")
      .concat(bloodToBeSearched.bloodId)
      .concat(bloodToBeSearched.batchNo);
    console.log("h", h);
    setHash(sha256(h));
    console.log("hash", hash);
    console.log("code", code);
    // alert(code)
  }

  function handleError(err) {
    console.error(err);
  }

  async function search(e) {
    e.preventDefault();
    setLoading(true);
    if (bloodToBeSearched.selectedBloodGroup !== "select") {
      // 1.1 . search for nearest blood banks
      var b_count = await contract.methods.getBloodCount().call();
      var temp_dict_1 = {};
      var nearest = "";
      var temp_loc = "";
      var bloodToBeSearched_copy = {};

      console.log("Finding Nearest");
      for (let i = 1; i <= b_count; ++i) {
        const tag = await contract.methods.getBlood(i).call();
        const tag1 = await contract.methods.getBlood2(i).call();
        const tag2 = await contract.methods.getStatus(i, tag1["1"]).call();

        if (
          bloodToBeSearched.selectedBloodGroup === tag["4"] &&
          tag2["2"].toString().toLowerCase().includes("blood") &&
          tag2["3"].toString() === "1"
        ) {
          //checking blood bank hi hai na 👆
          // hospital ka dist -> user.location
          // bb ka loc -> tag2['1']

          temp_dict_1[tag2["2"].trim()] = [
            tag2["1"], //string containaing lat long
            (temp_dict_1[tag2["2"].trim()] || [0, 0])[1] + 1, //bld count
          ];
        }
      }

      var temp_arr_1 = [];
      for (let key in temp_dict_1) {
        let gd = GetDistance(
          parseFloat(user.location.split(",")[0]),
          parseFloat(temp_dict_1[key][0].split(",")[0]),
          parseFloat(user.location.split(",")[1]),
          parseFloat(temp_dict_1[key][0].split(",")[1])
        );
        if (temp_dict_1[key][1] > 0) {
          temp_arr_1.push([
            gd, //dist
            temp_dict_1[key][1], // bld count
            temp_dict_1[key][0], // loc as a string
            key, // name of bb
          ]);
        }
      }

      temp_arr_1.sort(function (a, b) {
        let x = a[0] / a[1],
          y = b[0] / b[1];
        return x === y ? (a[0] === b[0] ? b[1] - a[1] : a[0] - b[0]) : x - y;
      });

      if (temp_arr_1[0]) {
        nearest = temp_arr_1[0][3];
        temp_loc = temp_arr_1[0][2];
        updateBloodbankCord(temp_arr_1[0][2]); // save blood bank cordinates for further use like map
        const bb_em_1 = await contract.methods
          .getemail(nearest.toString())
          .call();
        console.log(
          "finally",
          temp_arr_1,
          nearest,
          temp_loc,
          bloodbankCord,
          bb_em_1
        );
      } else {
        setLoading(false);
        alert("Blood Not Found");
        return;
      }

      // 1.2 getting info about required blood from blood bank
      console.log("searching");
      var flag = false;
      for (let i = 1; i <= b_count; ++i) {
        const tag = await contract.methods.getBlood(i).call();
        const tag1 = await contract.methods.getBlood2(i).call();
        const tag2 = await contract.methods.getStatus(i, tag1["1"]).call();
        if (
          tag2["2"].trim().toLocaleLowerCase() ===
            nearest.trim().toLocaleLowerCase() &&
          tag["4"] === bloodToBeSearched.selectedBloodGroup &&
          tag2["3"] === "1"
        ) {
          flag = true;
          var temp = {
            index_of_blood_to_be_transferred: i,
            bloodId: tag["0"],
            batchNo: tag["1"],
            email: FetchFromAadhar(tag["2"])["Email"],
            name: FetchFromAadhar(tag["2"])["Name"],
            adharNo: tag["2"],
            bloodGroup: tag["4"],
            age: FetchFromAadhar(tag["2"])["Age"] + " Years",
            verified: tag2["3"],
            collectionDate: new Date(1000 * tag2["0"])
              .toLocaleString("en-GB")
              .split(" ")[0]
              .replaceAll("/", " / "),
            expiryDate: tag["5"].replaceAll("/", " / "),
            currentBloodBank: tag2["2"],
            selectedBloodGroup: bloodToBeSearched.selectedBloodGroup,
          };
          bloodToBeSearched_copy = temp;
          setBloodToBeSearched(temp);

          console.log(`${JSON.stringify(bloodToBeSearched_copy)}`);
        }
      }
      if (!flag) {
        alert("Blood Not Found");
        setLoading(false);
        return;
      } else {
        // 1.3. transfer the selected blood
        console.log("transferring");
        console.log(`${JSON.stringify(bloodToBeSearched)}`);
        try {
          var info = await contract.methods
            .transferAsset(
              bloodToBeSearched_copy["index_of_blood_to_be_transferred"], //index_of_blood_to_be_transferred
              bloodToBeSearched_copy["currentBloodBank"], //blood bank name
              bloodToBeSearched_copy["verified"],
              user.location, //hospital cordinates
              user.name //hospital name
            )
            .send({ from: accounts[0] })
            .then(() => {
              return;
            });
          console.log(info);

          // 1.5. Once blood is received at the hospital it should be verified with the help of hash

          // 2.1. check if blood is scarce
          var bld_dict = {
            "A +ve": 0,
            "A -ve": 0,
            "B +ve": 0,
            "B -ve": 0,
            "O +ve": 0,
            "O -ve": 0,
            "AB +ve": 0,
            "AB -ve": 0,
          };
          console.log("in 2.1");
          var bg_dist_and_bg_count = {};
          for (let i = 1; i <= b_count; ++i) {
            const tag = await contract.methods.getBlood(i).call();
            const tag1 = await contract.methods.getBlood2(i).call();
            const tag2 = await contract.methods.getStatus(i, tag1["1"]).call();
            if (
              bloodToBeSearched.selectedBloodGroup === tag["4"] &&
              tag2["2"].toLowerCase().trim() !== nearest.toLowerCase().trim() &&
              tag2["3"].toString() === "1" &&
              tag2["2"].toString().toLowerCase().includes("blood")
            ) {
              bg_dist_and_bg_count[tag2["2"].trim()] = [
                GetDistance(
                  parseFloat(temp_loc.split(",")[0]),
                  parseFloat(tag2["1"].split(",")[0]),
                  parseFloat(temp_loc.split(",")[1]),
                  parseFloat(tag2["1"].split(",")[1])
                ),
                (bg_dist_and_bg_count[tag2["2"].trim()] || [0, 0])[1] + 1,
              ];
            }
            if (
              nearest.toLowerCase().trim() === tag2["2"].toLowerCase().trim()
            ) {
              bld_dict[tag["4"]] = bld_dict[tag["4"]] + 1;
            }
          }

          var nearest_bb_sorted = [];
          for (var arr in bg_dist_and_bg_count) {
            if (bg_dist_and_bg_count[arr][1] >= 2) {
              // for count greater than 2
              nearest_bb_sorted.push([
                bg_dist_and_bg_count[arr][0],
                bg_dist_and_bg_count[arr][1],
                arr,
              ]);
            }
          }

          console.log("nearest_bb_sorted bef srt", nearest_bb_sorted);

          nearest_bb_sorted.sort(function (a, b) {
            let x = a[0] / a[1],
              y = b[0] / b[1];
            return x === y
              ? a[0] === b[0]
                ? b[1] - a[1]
                : a[0] - b[0]
              : x - y;
          });

          console.log("nearest_bb_sorted after srt", nearest_bb_sorted);

          if (
            bld_dict[bloodToBeSearched.selectedBloodGroup] <= 0 &&
            nearest_bb_sorted.length !== 0
          ) {
            for (let i = 1; i <= b_count; ++i) {
              const tag = await contract.methods.getBlood(i).call();
              const tag1 = await contract.methods.getBlood2(i).call();
              const tag2 = await contract.methods
                .getStatus(i, tag1["1"])
                .call();
              // 2.2 blood bank to blood bank transfer
              if (
                nearest_bb_sorted[0][2].toLowerCase().trim() ===
                  tag2["2"].toLowerCase().trim() &&
                bloodToBeSearched.selectedBloodGroup === tag["4"]
              ) {
                try {
                  var info2 = await contract.methods
                    .transferAsset(
                      i, //index_of_blood_to_be_transferred
                      tag2["2"], //blood bank name
                      tag2["3"],
                      temp_loc, //curr bb cordinates
                      nearest //bb name
                    )
                    .send({ from: accounts[0] });
                  console.log(info2);

                  setModal(true);
                  setLoading(false);
                  return;
                } catch (err) {
                  setLoading(false);
                  console.log("Error in BB to BB Transfer function", err);
                }
              }
            }
          }
        } catch (err) {
          setLoading(false);
          console.log("Error in Transfer function", err);
          return;
        }

        setLoading(false);
        setModal(true);
        // add to blockchain
      }
    } else {
      alert(`${"Please Select a Blood Group"}`);
    }
  }

  return (
    <>
      <CustomNavbar url="hospitalHome" />
      <Container fluid>
        <ProfileHeader
          name={user.name.toUpperCase()}
          address={user.add}
          bloodcount={{}}
        />
        <Container className="hospitalContainer">
          <p>Ask For Blood</p>
          <Row>
            <Col></Col>
            <Col className="searchContainer">
              <p>Blood Group of Patient :</p>
              <FormSelect
                name="selectedBloodGroup"
                value={bloodToBeSearched.selectedBloodGroup}
                onChange={handleChange}
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
              </FormSelect>
              <Button className="mt-3" onClick={search}>
                {!loading ? "Search for Blood " : "Searching For Blood"}
              </Button>
              {modal && (
                <Modal show={modal} toggle={() => setModal(false)}>
                  <div className="modal-header justify-content-center pt-0">
                    <h4 className="title title-up">Blood Details</h4>
                  </div>
                  <ModalBody>
                    <p className="px-3 text-justify">
                      Following are the details of the blood you will receive.
                      please verify the hash once blood is recieved
                    </p>
                    <div className="px-3 pt-2">
                      <div>
                        <h5 className="">
                          <b className="mr-4">Name:</b>
                          {bloodToBeSearched.name}
                        </h5>
                      </div>
                      <div>
                        <h5 className="">
                          <b className="mr-4">Email ID:</b>
                          {bloodToBeSearched.email}
                        </h5>
                      </div>
                      <div>
                        <h5 className="card-title">
                          <b className="mr-4">Aadhar No: </b>
                          {bloodToBeSearched.adharNo}
                        </h5>
                      </div>
                      <div>
                        <h5 className="card-title">
                          <b className="mr-4">Blood ID: </b>
                          {bloodToBeSearched.bloodId}
                        </h5>
                      </div>
                      <div>
                        <h5 className="card-title">
                          <b className="mr-4">Batch No: </b>
                          {bloodToBeSearched.batchNo}
                        </h5>
                      </div>
                      <div>
                        <h5 className="card-title">
                          <b className="mr-4">Blood Group: </b>
                          {bloodToBeSearched.bloodGroup}
                        </h5>
                      </div>
                      <div>
                        <h5 className="card-title">
                          <b className="mr-4">Received from : </b>
                          {bloodToBeSearched.currentBloodBank}
                        </h5>
                      </div>
                      <div>
                        <h5 className="card-title">
                          <b className="mr-4">Collection Date: </b>
                          {bloodToBeSearched.collectionDate}
                        </h5>
                      </div>
                      <div>
                        <h5 className="card-title">
                          <b className="mr-4">Age: </b>
                          {bloodToBeSearched.age}
                        </h5>
                      </div>
                      {/* ******************************************************************** */}
                      <div>
                        <h5 className="card-title">
                          <b className="mr-4">Verification Status: </b>
                          {bloodToBeSearched.verified === "0" && (
                            <Badge bg="warning" className="py-1">
                              Not yet Tested
                            </Badge>
                          )}

                          {bloodToBeSearched.verified === "1" && (
                            <Badge bg="success" className="py-1">
                              Tested {"&"} Safe
                            </Badge>
                          )}

                          {bloodToBeSearched.verified === "2" && (
                            <Badge bg="danger" className="py-1">
                              Tested {"&"} Unsafe
                            </Badge>
                          )}
                        </h5>
                      </div>
                      <div>
                        <h5 class="card-title">
                          <b className="mr-4 ">
                            <a
                              target="1"
                              href={
                                "http://google.com/maps?q=" +
                                bloodbankCord +
                                "&ll=" +
                                bloodbankCord +
                                "&z=20"
                              }
                            >
                              See on Maps:{" "}
                            </a>
                          </b>
                          <div className="row justify-content-center  mt-2">
                            <iframe
                              style={{ borderStyle: "solid" }}
                              borderStyle="solid"
                              title="maps"
                              src={
                                "http://google.com/maps?q=" +
                                bloodbankCord +
                                "&ll=" +
                                bloodbankCord +
                                "&z=20&output=embed"
                              }
                              height="300"
                              width="420"
                            ></iframe>
                          </div>
                        </h5>
                      </div>
                    </div>
                  </ModalBody>
                  <div className="modal-footer mb-3">
                    <Pdf
                      targetRef={ref}
                      filename={
                        "Receipt_" + new Date().toLocaleString() + ".pdf"
                      }
                    >
                      {({ toPdf }) => (
                        <Button color="success" type="button" onClick={toPdf}>
                          Dowload Receipt
                        </Button>
                      )}
                    </Pdf>
                    <Button
                      color="info"
                      type="button"
                      variant="contained"
                      onClick={handleUpload}
                    >
                      Scan and Check
                    </Button>
                    <Button
                      color="primary"
                      type="button"
                      onClick={() => {
                        setModal(false);
                        setCode("");
                        setHash("");
                      }}
                    >
                      Close
                    </Button>
                  </div>
                  <QrReader
                    ref={qrRef}
                    delay={300}
                    onError={handleError}
                    style={{ width: "40%" }}
                    onScan={handleScan}
                    legacyMode={true}
                  />
                  {code && (
                    <div className="row px-3">
                      <div className="col m-3">
                        <h6>Hash from QR :</h6>
                        {code && <span>{code.substring(0, 15) + " ..."}</span>}
                        <hr />
                        <h6>Hash generated : </h6>
                        {hash && <span>{hash.substring(0, 15) + " ..."}</span>}
                        <hr />
                        {code === hash && (
                          <Badge bg="success" className="py-1">
                            Hash verification successful
                          </Badge>
                        )}

                        {code !== hash && (
                          <Badge bg="danger" className="py-1">
                            Hash verification unsuccessful
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}
                </Modal>
              )}
            </Col>
            <Col></Col>
          </Row>
        </Container>
      </Container>
    </>
  );
}
