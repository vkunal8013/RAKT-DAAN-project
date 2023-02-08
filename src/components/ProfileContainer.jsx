import { Col, Container, Row } from "react-bootstrap";

export default function ProfileHeader(props) {
  return (
    <>
      <Container fluid className="profileContainer">
        <div className="photoContainer">
          <img alt="..." src="https://picsum.photos/200"></img>
        </div>
        <h3 className="title">{props.name}</h3>
        <p className="category">
          {props.bloodcount === {} && "Current blood count status"}
        </p>
        <Row>
          {Object.entries(props.bloodcount).map(([key, value], i) => (
            <>
              <Col>
                <div className="ml-auto mr-auto my-5">
                  <div
                    className="p-3"
                    style={{
                      backgroundColor: "rgba(255, 255, 255, 0.5)",
                      borderRadius: "10px",
                      maxHeight: "100px",
                      minWidth: "100px",
                    }}
                  >
                    <h2 className="font-weight-bold mb-1">{value}</h2>
                    <p className="font-weight-bold">{key}</p>
                  </div>
                </div>
              </Col>
            </>
          ))}
        </Row>
      </Container>
    </>
  );
}
