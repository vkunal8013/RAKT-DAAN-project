import { Container, Nav, Navbar } from "react-bootstrap";
import { LinkContainer } from "react-router-bootstrap";
import logo from "../assets/img/logo.png";
export default function CustomNavbar(props) {
  const url = props.url;

  return (
    <>
      <Navbar className="fixed-top " bg="light" variant="light">
        <Container>
          <LinkContainer to="/">
            <Navbar.Brand>
              <img src={logo} height="50px" width="50px"></img>
            </Navbar.Brand>
          </LinkContainer>
          <Navbar.Toggle />
          <Navbar.Collapse className="justify-content-end">
            <Nav className="me-auto">
              {(url === "home" ||
                url === "loginBloodBank" ||
                url === "loginHospital") && (
                <>
                  {/* <LinkContainer to="/track">
                    <Nav.Link>Track</Nav.Link>
                  </LinkContainer> */}
                  <LinkContainer to="/loginBloodBank">
                    <Nav.Link>Blood Bank Login</Nav.Link>
                  </LinkContainer>
                  <LinkContainer to="loginHospital">
                    <Nav.Link>Hospital Login</Nav.Link>
                  </LinkContainer>
                </>
              )}
              {url === "bloodBankHome" && (
                <LinkContainer to="/bloodCollection">
                  <Nav.Link>Blood Collection</Nav.Link>
                </LinkContainer>
              )}
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
    </>
  );
}
