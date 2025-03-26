import React from 'react';
import { Container } from 'react-bootstrap';

function Copyright() {
  return (
    <p className="text-muted">
      {'Copyright © '}
      <a href="#" className="text-reset">
        Attendance
      </a>{' '}
      {new Date().getFullYear()}
      {'.'}
    </p>
  );
}

const Footer = () => {
  return (
    <div className="d-flex flex-column min-vh-20">
      <footer className="mt-auto py-3 bg-light">
        <Container className="text-center">
          <Copyright />
        </Container>
      </footer>
    </div>
  );
}

export default Footer;
