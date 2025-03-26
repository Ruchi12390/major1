import React, { useState } from 'react';
import axios from 'axios';
import { Container, Row, Col, Form, Button, Alert } from 'react-bootstrap';

function AddStudent() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [enrollment, setEnrollment] = useState('');
  const [selectedSemester, setSelectedSemester] = useState('');
  const [submitStatus, setSubmitStatus] = useState('');

  const handleSemesterChange = (event) => {
    setSelectedSemester(event.target.value);
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    if (name === 'firstName') setFirstName(value);
    if (name === 'lastName') setLastName(value);
    if (name === 'enrollment') setEnrollment(value);
  };

  const handleSubmit = async (event) => {
    event.preventDefault(); // Prevent page refresh
  
    if (!firstName || !lastName || !enrollment || !selectedSemester) {
      setSubmitStatus('Please fill in all fields');
      return;
    }
  
    try {
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/manual-entry`, {
        firstName,
        lastName,
        enrollment,
        semester: selectedSemester,
      });
      console.log('API Response:', response.data); // Debugging line
      setSubmitStatus(response.data.message || 'Student added successfully');
    } catch (error) {
      console.error('Error submitting data:', error.response ? error.response.data : error.message);
      setSubmitStatus(error.response?.data?.message || 'Error submitting data');
    }
  };
  

  return (
    <Container className="mt-4">
      <Row>
        <Col md={8} className="offset-md-2">
          <Form onSubmit={handleSubmit}>
            <Form.Group controlId="formFirstName">
              <Form.Label>First Name</Form.Label>
              <Form.Control
                type="text"
                name="firstName"
                value={firstName}
                onChange={handleChange}
                required
              />
            </Form.Group>
            <Form.Group controlId="formLastName">
              <Form.Label>Last Name</Form.Label>
              <Form.Control
                type="text"
                name="lastName"
                value={lastName}
                onChange={handleChange}
                required
              />
            </Form.Group>
            <Form.Group controlId="formEnrollment">
              <Form.Label>Enrollment Number</Form.Label>
              <Form.Control
                type="text"
                name="enrollment"
                value={enrollment}
                onChange={handleChange}
                required
              />
            </Form.Group>
            <Form.Group controlId="formSemester">
              <Form.Label>Select Semester</Form.Label>
              <Form.Control
                as="select"
                value={selectedSemester}
                onChange={handleSemesterChange}
                required
              >
                <option value="" disabled>Select Semester</option>
                {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                  <option key={sem} value={`sem${sem}`}>{sem}</option>
                ))}
              </Form.Control>
            </Form.Group>
            <Button type="submit" variant="primary" className="mt-3">
              Submit
            </Button>
          </Form>
          {submitStatus && (
            <Alert variant={submitStatus.startsWith('Error') ? 'danger' : 'success'} className="mt-3">
              {submitStatus}
            </Alert>
          )}
        </Col>
      </Row>
    </Container>
  );
}

export default AddStudent;
