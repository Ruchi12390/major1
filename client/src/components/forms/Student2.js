import React, { useState } from 'react';
import axios from 'axios';
import { Container, Row, Col, Form, Button, Alert } from 'react-bootstrap';

function UpdateStudentDetail() {
  const [enrollmentNumber, setEnrollmentNumber] = useState('');
  const [studentDetails, setStudentDetails] = useState(null);
  const [updateStatus, setUpdateStatus] = useState('');
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    semester: ''
  });
  const [isEditing, setIsEditing] = useState(false);

  // Handle input change
  const handleInputChange = (event) => {
    setEnrollmentNumber(event.target.value);
  };

  // Handle form data change
  const handleFormChange = (event) => {
    const { name, value } = event.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  // Fetch student details
  const fetchStudentDetails = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/get-student`, {
        params: { enrollmentNumber }
      });
      setStudentDetails(response.data);
      setFormData({
        firstName: response.data.firstName,
        lastName: response.data.lastName,
        semester: response.data.semester
      });
      setIsEditing(true);
    } catch (error) {
      console.error('Error fetching student details:', error);
      setUpdateStatus('Error fetching student details');
    }
  };

  // Handle form submission
  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!enrollmentNumber || !isEditing) {
      setUpdateStatus('Please enter an enrollment number and fetch student details first');
      return;
    }

    try {
      const response = await axios.put(`${process.env.REACT_APP_API_URL}/api/update-student`, {
        enrollmentNumber,
        ...formData
      });
      setUpdateStatus(response.data.message || 'Student updated successfully');
    } catch (error) {
      setUpdateStatus(error.response?.data?.message || 'Error updating student');
    }
  };

  return (
    <Container className="mt-4">
      <Row>
        <Col md={6} className="offset-md-3">
          <Form onSubmit={handleSubmit}>
            <Form.Group controlId="formEnrollmentNumber">
              <Form.Label>Enrollment Number</Form.Label>
              <Form.Control
                type="text"
                value={enrollmentNumber}
                onChange={handleInputChange}
                placeholder="Enter enrollment number"
                required
              />
            </Form.Group>
            <Button
              type="button"
              variant="secondary"
              className="mt-3"
              onClick={fetchStudentDetails}
            >
              Fetch Details
            </Button>
            {isEditing && (
              <>
                <Form.Group controlId="formFirstName">
                  <Form.Label>First Name</Form.Label>
                  <Form.Control
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleFormChange}
                    placeholder="Enter first name"
                    required
                  />
                </Form.Group>
                <Form.Group controlId="formLastName">
                  <Form.Label>Last Name</Form.Label>
                  <Form.Control
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleFormChange}
                    placeholder="Enter last name"
                    required
                  />
                </Form.Group>
                <Form.Group controlId="formSemester">
                  <Form.Label>Semester</Form.Label>
                  <Form.Control
                    type="text"
                    name="semester"
                    value={formData.semester}
                    onChange={handleFormChange}
                    placeholder="Enter semester"
                    required
                  />
                </Form.Group>
                <Button type="submit" variant="primary" className="mt-3">
                  Update Student
                </Button>
              </>
            )}
          </Form>
          {updateStatus && (
            <Alert variant={updateStatus.startsWith('Error') ? 'danger' : 'success'} className="mt-3">
              {updateStatus}
            </Alert>
          )}
        </Col>
      </Row>
    </Container>
  );
}

export default UpdateStudentDetail;
