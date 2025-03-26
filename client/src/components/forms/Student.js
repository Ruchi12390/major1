import React, { useState } from 'react';
import axios from 'axios';
import { Container, Row, Col, Form, Button, Alert, Tab, Nav } from 'react-bootstrap';

function Student() {
  const [selectedSemester, setSelectedSemester] = useState('');
  const [file, setFile] = useState(null);
  const [uploadStatus, setUploadStatus] = useState('');
  const [manualEntry, setManualEntry] = useState(false);

  // Manual entry state
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [enrollment, setEnrollment] = useState('');

  const handleSemesterChange = (event) => {
    setSelectedSemester(event.target.value);
  };

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  const handleManualEntryChange = (event) => {
    const { name, value } = event.target;
    if (name === 'firstName') setFirstName(value);
    if (name === 'lastName') setLastName(value);
    if (name === 'enrollment') setEnrollment(value);
  };

  const handleSubmit = async (event) => {
    event.preventDefault(); // Prevent page refresh

    if (manualEntry) {
      if (!firstName || !lastName || !enrollment || !selectedSemester) {
        setUploadStatus('Please fill in all fields');
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
        setUploadStatus(response.data.message || 'Student added successfully');
      } catch (error) {
        console.error('Error submitting data:', error.response ? error.response.data : error.message);
        setUploadStatus(error.response?.data?.message || 'Error submitting data');
      }
    } else {
      if (!file) {
        setUploadStatus('Please select a file to upload');
        return;
      }

      if (!selectedSemester) {
        setUploadStatus('Please select a semester');
        return;
      }

      const formData = new FormData();
      formData.append('file', file);
      formData.append('semester', selectedSemester);

      try {
        const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/upload`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        console.log('API Response:', response.data); // Debugging line
        setUploadStatus(response.data.message || 'File uploaded successfully');
      } catch (error) {
        console.error('Error uploading file:', error.response ? error.response.data : error.message);
        setUploadStatus(error.response?.data?.message || 'Error uploading file');
      }
    }
  };

  return (
    <Container className="mt-4">
      <Row>
        <Col md={8} className="offset-md-2">
          <Tab.Container id="tabs" defaultActiveKey="fileUpload">
            <Nav variant="tabs">
              <Nav.Item>
                <Nav.Link eventKey="fileUpload" onClick={() => setManualEntry(false)}>
                  File Upload
                </Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="manualEntry" onClick={() => setManualEntry(true)}>
                  Manual Entry
                </Nav.Link>
              </Nav.Item>
            </Nav>
            <Tab.Content>
              <Tab.Pane eventKey="fileUpload">
                <Form onSubmit={handleSubmit}>
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
                        <option key={sem} value={`${sem}`}>{sem}</option>
                      ))}
                    </Form.Control>
                  </Form.Group>
                  <Form.Group controlId="formFile">
                    <Form.Label>Upload File</Form.Label>
                    <Form.Control
                      type="file"
                      onChange={handleFileChange}
                      accept=".csv" // Ensure you accept the correct file type
                      required
                    />
                  </Form.Group>
                  <Button type="submit" variant="primary" className="mt-3">
                    Upload
                  </Button>
                </Form>
              </Tab.Pane>
              <Tab.Pane eventKey="manualEntry">
                <Form onSubmit={handleSubmit}>
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
                        <option key={sem} value={`${sem}`}>{sem}</option>
                      ))}
                    </Form.Control>
                  </Form.Group>
                  <Form.Group controlId="formFirstName">
                    <Form.Label>First Name</Form.Label>
                    <Form.Control
                      type="text"
                      name="firstName"
                      value={firstName}
                      onChange={handleManualEntryChange}
                      required
                    />
                  </Form.Group>
                  <Form.Group controlId="formLastName">
                    <Form.Label>Last Name</Form.Label>
                    <Form.Control
                      type="text"
                      name="lastName"
                      value={lastName}
                      onChange={handleManualEntryChange}
                      required
                    />
                  </Form.Group>
                  <Form.Group controlId="formEnrollment">
                    <Form.Label>Enrollment Number</Form.Label>
                    <Form.Control
                      type="text"
                      name="enrollment"
                      value={enrollment}
                      onChange={handleManualEntryChange}
                      required
                    />
                  </Form.Group>
                  <Button type="submit" variant="primary" className="mt-3">
                    Submit
                  </Button>
                </Form>
              </Tab.Pane>
            </Tab.Content>
          </Tab.Container>
          {uploadStatus && (
            <Alert variant={uploadStatus.startsWith('Error') ? 'danger' : 'success'} className="mt-3">
              {uploadStatus}
            </Alert>
          )}
        </Col>
      </Row>
    </Container>
  );
}

export default Student;
