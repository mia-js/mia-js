import React from 'react'
import {Row, Col, Container, Jumbotron} from 'reactstrap'
import {Helmet} from 'react-helmet'

export default class NotFound extends React.Component {
    render() {
        const iconStyle = {
            fontSize: '10rem'
        };
        return (
            <Container>
                <Helmet>
                    <title>404</title>
                </Helmet>
                <Jumbotron>
                    <Row>
                        <Col sm="3" className="text-center">
                            <span className="fa fa-fire-extinguisher" style={iconStyle}/>
                        </Col>
                        <Col sm="9" className="d-flex align-items-center">
                            <Row>
                                <Col sm="12"><h2>Ups!</h2></Col>
                                <Col sm="12">The page you requested does not exist.</Col>
                            </Row>
                        </Col>
                    </Row>
                </Jumbotron>
            </Container>
        );
    }
}
