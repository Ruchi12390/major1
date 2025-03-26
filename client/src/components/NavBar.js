import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Navbar, Nav, Button } from 'react-bootstrap';  // Import Bootstrap components
import './stylesheets/Home.css';  // Ensure this path is correct

const NavBar = ({ token, logOut }) => {
    const navigate = useNavigate();

    const handleClick = () => {
        navigate("/dashboard");
    };

    const handleLogin = () => {
        navigate("/login");
    };

    return (
        <Navbar className="custom-navbar" expand="lg">
            {/* ...existing code */}
            <Nav className="ms-auto">
                {!token ? (
                    <>
                        <Button variant="outline-primary" className="btn-no-border">
                            <Link to="/signup" style={{ textDecoration: 'none', color: 'black' }}>Signup</Link>
                        </Button>
                        <Button variant="outline-primary" style={{ textDecoration: 'none', color: 'black' }} className="btn-no-border" onClick={() => navigate('/login')}>Login</Button>
                    </>
                ) : (
                    <>
                        <Button variant="outline-primary" className="btn-no-border" onClick={() => navigate('/dashboard')}>
                            <i className="bi bi-person" />
                        </Button>
                        <Button variant="outline-primary" className="btn-no-border" onClick={logOut}>
                            Logout
                        </Button>
                    </>
                )}
            </Nav>
        </Navbar>
    );
};

export default NavBar;
