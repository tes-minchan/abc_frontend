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
} from 'reactstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import './Header.css';


class Header extends Component {
  constructor(props) {
    super(props);
    this.toggle = this.toggle.bind(this);
    this.state = {
      dropdownOpen: false
    };
  }

  toggle() {
    this.setState({
      dropdownOpen: !this.state.dropdownOpen
    });
  }

  render() {
    return (
      <Fragment>
        <Navbar color="light" light expand="md">
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
              <NavItem>
                <NavLink href="/Login">Login</NavLink>
              </NavItem>
              <NavItem>
                <NavLink href="/Signin">Signin</NavLink>
              </NavItem>
            </Nav>
          </Collapse>
        </Navbar>
      </Fragment>
    );
  }
}

export default Header;
