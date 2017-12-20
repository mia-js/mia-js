import React from 'react'
import {Helmet} from 'react-helmet'
import {Row, Col, Jumbotron} from 'reactstrap'
import {Link} from 'react-router-dom'

class Todo extends React.Component {
    render() {
        return (
            <div>
                <Helmet>
                    <title>To do lists</title>
                </Helmet>
                <Jumbotron>
                    <Row className="align-items-center text-center">
                        <Col xs="12" sm="4" md="3" lg="2" className="display-1">
                            <span className="fa fa-check-square-o"/>
                        </Col>
                        <Col xs="12" sm="8" md="9" lg="10" className="text-center text-sm-left">
                            <h1 className="display-3">To do lists</h1>
                            <p className="lead">Here you can manage all of your to do lists.</p>
                            <hr className="my-2"/>
                            <p>Please select a list.</p>
                        </Col>
                    </Row>
                </Jumbotron>
                <Row>
                    <Col xs="12" sm="6" md="4" className="mb-4">
                        <Link to="/todo/work" className="btn btn-secondary btn-outline-secondary btn-lg btn-block"
                              role="button">
                            <div className="display-3">
                                <span className="fa fa-list-alt"/>
                            </div>
                            <div className="lead">
                                Work
                            </div>
                        </Link>
                    </Col>
                    <Col xs="12" sm="6" md="4" className="mb-4">
                        <Link to="/todo/private" className="btn btn-secondary btn-outline-secondary btn-lg btn-block"
                              role="button">
                            <div className="display-3">
                                <span className="fa fa-list-alt"/>
                            </div>
                            <div className="lead">
                                Private
                            </div>
                        </Link>
                    </Col>
                </Row>
            </div>
        )
    }
}

export default Todo;
