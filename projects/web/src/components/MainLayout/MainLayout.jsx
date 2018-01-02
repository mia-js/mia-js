import React from 'react'
import PropTypes from 'prop-types'
import {Container, Row, Col} from 'reactstrap'
import {Helmet} from 'react-helmet'
import withStyles from 'isomorphic-style-loader/lib/withStyles'

// Layout components
import TopNavigation from '../TopNavigation/index'
import Sidebar from '../Sidebar/index'

// Global styles
import bootstrapStyles from 'bootstrap/dist/css/bootstrap.css'
import fontAwesomeStyles from 'font-awesome/css/font-awesome.css'

import bootstrapOverrides from '../../assets/styles/bootstrap.less'
import fontAwesomeOverrides from '../../assets/styles/font-awesome.less'
import mainStyles from '../../assets/styles/main.less'

// Favicons
import appleTouchIcon from '../../assets/favicons/apple-touch-icon.png'
import favicon16 from '../../assets/favicons/favicon-16x16.png'
import favicon32 from '../../assets/favicons/favicon-32x32.png'
import safariPinnedTab from '../../assets/favicons/safari-pinned-tab.svg'

class MainLayout extends React.Component {
    static propTypes = {
        config: PropTypes.object.isRequired,
        isSidebarOpen: PropTypes.bool.isRequired
    };

    render() {
        let mainContentSize = 10;
        let mainContentOffset = 2;
        let mainContentAddClasses = '-sidebar-open';

        if (!this.props.isSidebarOpen) {
            mainContentSize = 12;
            mainContentOffset = 0;
            mainContentAddClasses = '-sidebar-closed';
        }

        return (
            <div>
                <Helmet
                    defaultTitle="Frontend demo"
                    titleTemplate="Frontend demo | %s"
                >
                    <meta charset="utf-8"/>
                    <meta http-equiv="X-UA-Compatible" content="IE=edge"/>
                    <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
                    <link rel="apple-touch-icon" sizes="120x120" href={appleTouchIcon}/>
                    <link rel="icon" type="image/png" sizes="32x32" href={favicon32}/>
                    <link rel="icon" type="image/png" sizes="16x16" href={favicon16}/>
                    <link rel="mask-icon" href={safariPinnedTab} color="#5bbad5"/>
                </Helmet>
                <TopNavigation config={this.props.config}/>
                <Container fluid={true}>
                    <Row>
                        {
                            /* Sidebar open */
                            this.props.isSidebarOpen &&
                            <Col md="2" className="sidebar">
                                <Sidebar {...this.props}/>
                            </Col>
                        }
                        {
                            /* Sidebar close */
                            !this.props.isSidebarOpen &&
                            <div className="sidebar">
                                <Sidebar {...this.props}/>
                            </div>
                        }
                        <Col md={{size: mainContentSize, offset: mainContentOffset}}
                             className={"mainContent " + mainContentAddClasses}>
                            {this.props.children}
                        </Col>
                    </Row>
                </Container>
            </div>
        )
    }
}

export default withStyles(
    bootstrapStyles,
    fontAwesomeStyles,
    bootstrapOverrides,
    fontAwesomeOverrides,
    mainStyles
)(MainLayout);
