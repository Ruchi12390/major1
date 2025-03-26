import React, { useState } from 'react';
import axios from 'axios';
import { Container, Row, Col, Form, Button, Alert } from 'react-bootstrap';

function UpdateCourseDetail() {
  const [courseCode, setCourseCode] = useState('');
  const [courseDetails, setCourseDetails] = useState(null);
  const [updateStatus, setUpdateStatus] = useState('');
  const [updatedCourseName, setUpdatedCourseName] = useState('');
  const [updatedSemester, setUpdatedSemester] = useState('');

  // Handle input change
  const handleInputChange = (event) => {
    setCourseCode(event.target.value);
  };

  // Fetch course details
  const fetchCourseDetails = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/course/${courseCode}`);
      setCourseDetails(response.data);
      setUpdatedCourseName(response.data.courseName || '');
      setUpdatedSemester(response.data.semester || '');
      setUpdateStatus('');
    } catch (error) {
      setUpdateStatus('Error fetching course details');
    }
  };

  // Handle form submission
  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!courseCode || !updatedCourseName || !updatedSemester) {
      setUpdateStatus('Please fill out all fields');
      return;
    }

    try {
      const response = await axios.put(`${process.env.REACT_APP_API_URL}/api/update-course`, {
        courseCode,
        courseName: updatedCourseName,
        semester: updatedSemester,
      });
      setUpdateStatus(response.data.message || 'Course updated successfully');
    } catch (error) {
      setUpdateStatus(error.response?.data?.message || 'Error updating course');
    }
  };

  return (
    <Container className="mt-4">
      <Row>
        <Col md={8} className="offset-md-2">
          <Form onSubmit={(e) => { e.preventDefault(); fetchCourseDetails(); }}>
            <Form.Group controlId="formCourseCode">
              <Form.Label>Course Code</Form.Label>
              <Form.Control
                type="text"
                name="courseCode"
                value={courseCode}
                onChange={handleInputChange}
                placeholder="Enter course code"
                required
              />
            </Form.Group>
            <Button type="submit" variant="primary" className="mt-3">
              Fetch Course Details
            </Button>
          </Form>

          {courseDetails && (
            <Form onSubmit={handleSubmit} className="mt-4">
              <Form.Group controlId="formCourseName">
                <Form.Label>Course Name</Form.Label>
                <Form.Control
                  type="text"
                  name="courseName"
                  value={updatedCourseName}
                  onChange={(e) => setUpdatedCourseName(e.target.value)}
                  placeholder="Enter course name"
                  required
                />
              </Form.Group>
              <Form.Group controlId="formSemester">
                <Form.Label>Semester</Form.Label>
                <Form.Control
                  as="select"
                  name="semester"
                  value={updatedSemester}
                  onChange={(e) => setUpdatedSemester(e.target.value)}
                  required
                >
                  <option value="">Select Semester</option>
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                    <option key={sem} value={`${sem}`}>{sem}</option>
                  ))}
                </Form.Control>
              </Form.Group>
              <Button type="submit" variant="primary" className="mt-3">
                Update Course
              </Button>
            </Form>
          )}

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

export default UpdateCourseDetail;
