import { Container, Badge, Button } from "react-bootstrap";
import FetchFromAadhar from "api/AadharAPI";

export default function DonatorCard(props) {
  const person = FetchFromAadhar(props.no);
  return (
    <Container className="donorCard">
      <p>Name : {person.Name}</p>
      <p>Date of Donation : {props.collectionDate}</p>
      <p>Blood ID : {props.bloodID}</p>
      <p>Batch No : {props.batchNo}</p>
      <p>Blood Group : {props.bloodGroup}</p>
      {props.verified === "0" && (
        <span className="ml-3">
          <b>Verified : </b>
          <Badge bg="warning" className="py-1" style={{ fontSize: "0.6rem" }}>
            Not Verified
          </Badge>
        </span>
      )}

      {props.verified === "1" && (
        <span className="ml-3">
          <b>Status : </b>
          <Badge bg="success" className="py-1" style={{ fontSize: "0.6rem" }}>
            Tested {"&"} Safe
          </Badge>
        </span>
      )}

      {props.verified === "2" && (
        <span className="ml-3">
          <b>Status : </b>
          <Badge bg="danger" className="py-1">
            Tested {"&"} Unsafe
          </Badge>
        </span>
      )}
      <Button className="d-block mt-2" onClick={props.onClick}>
        Edit Details
      </Button>
    </Container>
  );
}
