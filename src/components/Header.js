import React, { Component,Fragment } from 'react';
import { Link } from 'react-router-dom';
import {
  Collapse,
  Navbar,
  Dropdown, DropdownItem, DropdownToggle, DropdownMenu,
  NavbarBrand,
  Nav,
  NavItem,
  NavLink,
  Badge,
  Button,
  Form
} from 'reactstrap';
import jwt_decode  from 'jwt-decode';

import 'bootstrap/dist/css/bootstrap.min.css';
import './Header.css';


class Header extends Component {
  constructor(props) {
    super(props);
    this.toggle = this.toggle.bind(this);
    this.state = {
      dropdownOpen: false,
      userid : null
    };
  }

  componentDidMount() {
    const getToken = sessionStorage.getItem('token');
    if(getToken) {
      const signin_check = jwt_decode(getToken);
      this.setState({
        userid : signin_check.id
      });
    }
  }


  toggle() {
    this.setState({
      dropdownOpen: !this.state.dropdownOpen
    });
  }

  onClickSignOut = () => {
    sessionStorage.clear();
  }

  render() {
    const userid_sytle = {
      color:"#009432", 
      fontSize:"17px",
      fontWeight: "bold"
    };

    const sign_button_style = {
      marginTop: "4px"
    } 

    const userinfoArea = this.state.userid? (
    
      <Fragment>
        <NavItem>
          <NavLink href="/Orderbook" >Orderbook</NavLink>
        </NavItem>
        <NavItem>
          <NavLink href="/Setting" >Setting</NavLink>
        </NavItem>
        <NavItem>
          <NavLink disabled style={userid_sytle} >{this.state.userid}</NavLink>
        </NavItem>
        <Form onClick={this.onClickSignOut} style={sign_button_style}>
          <Button outline color="primary" className="signout">Sign Out</Button>
        </Form>
      </Fragment>

    ) : (
      <Fragment>
        <NavItem>
          <NavLink href="/Orderbook" >Orderbook</NavLink>
        </NavItem>
        <NavItem>
          <NavLink href="/Setting" >Setting</NavLink>
        </NavItem>
        <NavItem>
          <NavLink href="/Signin">Sign in</NavLink>
        </NavItem>
        <NavItem>
          <NavLink href="/Signup">Sign up</NavLink>
        </NavItem>
      </Fragment>
    );

    return (
      <Fragment>
        <Navbar color="light" light expand="md" className="Header">
          <NavbarBrand href="/"><h3 className="text-success">ABC Project</h3></NavbarBrand>
          <Collapse  navbar>
            <Nav className="ml-auto" navbar>
              <Dropdown nav isOpen={this.state.dropdownOpen} toggle={this.toggle}>
                <DropdownToggle nav caret>
                  Currency
                </DropdownToggle>
                <DropdownMenu>
                  <DropdownItem header>Coin List</DropdownItem>
                  <DropdownItem><Link to="BTCKRW">BTCKRW</Link></DropdownItem>
                  <DropdownItem><Link to="ETHKRW">ETHKRW</Link></DropdownItem>
                </DropdownMenu>
              </Dropdown>
              <NavItem>
                <NavLink href="/Arbitrage" >Arbitrage</NavLink>
              </NavItem>
              {userinfoArea}
            </Nav>
          </Collapse>
        </Navbar>
      </Fragment>
    );
  }
}

export default Header;
