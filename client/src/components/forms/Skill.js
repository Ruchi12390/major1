import React, { useState } from 'react';
import axios from 'axios';
import { Container, Row, Col, Form, Button, Alert } from 'react-bootstrap';

function DeleteStudent() {
  const [enrollment, setEnrollment] = useState('');
  const [deleteStatus, setDeleteStatus] = useState('');

  const handleChange = (event) => {
    setEnrollment(event.target.value);
  };

  const handleSubmit = async (event) => {
    event.preventDefault(); // Prevent page refresh

    if (!enrollment) {
      setDeleteStatus('Please enter the enrollment number');
      return;
    }

    try {
      const response = await axios.delete(`${process.env.REACT_APP_API_URL}/api/delete-student`, {
        data: { enrollment },
      });
      console.log('API Response:', response.data); // Debugging line
      setDeleteStatus(response.data.message || 'Student deleted successfully');
    } catch (error) {
      console.error('Error deleting student:', error.response ? error.response.data : error.message);
      setDeleteStatus(error.response?.data?.message || 'Error deleting student');
    }
  };

  return (
    <Container className="mt-4">
      <Row>
        <Col md={6} className="offset-md-3">
          <Form onSubmit={handleSubmit}>
            <Form.Group controlId="formEnrollment">
              <Form.Label>Enrollment Number</Form.Label>
              <Form.Control
                type="text"
                value={enrollment}
                onChange={handleChange}
                required
              />
            </Form.Group>
            <Button type="submit" variant="danger" className="mt-3">
              Delete
            </Button>
          </Form>
          {deleteStatus && (
            <Alert variant={deleteStatus.startsWith('Error') ? 'danger' : 'success'} className="mt-3">
              {deleteStatus}
            </Alert>
          )}
        </Col>
      </Row>
    </Container>
  );
}

export default DeleteStudent;
