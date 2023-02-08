import { Container } from "react-bootstrap";
import CustomNavbar from "../components/CustomNavbar";

export default function Home() {
  return (
    <Container fluid className="m-0 p-0 g-0">
      <CustomNavbar url="home" />
      <Container className="g-0" fluid>
        <Container fluid className="homeHeaderContainer">
          <p>Safety Reliability Surity</p>
        </Container>
        <Container className="homeContainer">
          <p className="heading">What is it all about</p>
          <p className="description">
            According to the National Informatics Centre, 90% of blood donations
            in India are carried out in camps set up by various organizations.
            While all the donated blood goes through the testing phase and safe
            blood is separated, sometimes unsafe blood can also penetrate this
            test and reach the patients infecting them. Though this problem may
            go unnoticed but the consequences are fatal. We use the potential of
            Blockchain to help curb these flaws and make systems reliable.
          </p>
        </Container>
      </Container>
    </Container>
  );
}
