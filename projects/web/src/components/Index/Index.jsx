import React from 'react'
import {Row, Col, Jumbotron} from 'reactstrap'

export default class Index extends React.Component {
    render() {
        return (
            <Jumbotron>
                <Row className="align-items-center">
                    <Col xs="12" sm="4" md="3" lg="2" className="display-1 text-center">
                        <span className="fa fa-hand-spock-o"/>
                    </Col>
                    <Col xs="12" sm="8" md="9" lg="10" className="text-center text-sm-left">
                        <h1 className="display-3">Hello world!</h1>
                        <p className="lead">
                            Welcome to the frontend demo project! Use this as a starting point for your own awesome
                            frontend project.
                        </p>
                    </Col>
                </Row>
            </Jumbotron>
        )
    }
}
