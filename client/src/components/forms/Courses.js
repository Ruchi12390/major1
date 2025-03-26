import React, { useState } from 'react';
import axios from 'axios';
import { Container, Row, Col, Form, Button, Alert } from 'react-bootstrap';

function Courses() {
  const [uploadMethod, setUploadMethod] = useState('manual'); // 'file' or 'manual'
  const [courseName, setCourseName] = useState('');
  const [courseCode, setCourseCode] = useState('');
  const [selectedSemester, setSelectedSemester] = useState('');
  const [file, setFile] = useState(null);
  const [uploadStatus, setUploadStatus] = useState('');

  const handleUploadMethodChange = (event) => {
    setUploadMethod(event.target.value);
  };

  const handleCourseNameChange = (event) => {
    setCourseName(event.target.value);
  };

  const handleCourseCodeChange = (event) => {
    setCourseCode(event.target.value);
  };

  const handleSemesterChange = (event) => {
    setSelectedSemester(event.target.value);
  };

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  const handleSubmit = async (event) => {
    event.preventDefault(); // Prevent page refresh
  
    if (uploadMethod === 'file') {
      // Handle file upload
      if (!file) {
        setUploadStatus('Please select a file to upload');
        return;
      }
      const formData = new FormData();
      formData.append('file', file);
       // Adding semester to form data
  
      try {
        const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/upload-courses`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        setUploadStatus(response.data.message || 'File uploaded successfully');
      } catch (error) {
        console.error('Error uploading file:', error.response ? error.response.data : error.message);
        setUploadStatus(error.response?.data?.message || 'Error uploading file');
      }
    } else {
      // Handle manual entry
      if (!courseName || !courseCode || !selectedSemester) {
        setUploadStatus('Please fill out all fields');
        return;
      }
  
      try {
        const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/manual-course`, {
          courseName,
          courseCode,
          semester: selectedSemester,
        }, {
          headers: {
            'Content-Type': 'application/json', // Use application/json for JSON data
          },
        });
        setUploadStatus(response.data.message || 'Course added successfully');
      } catch (error) {
        console.error('Error adding course:', error.response ? error.response.data : error.message);
        setUploadStatus(error.response?.data?.message || 'Error adding course');
      }
    }
  };
  

  return (
    <Container className="mt-4">
      <Row>
        <Col md={8} className="offset-md-2">
          <Form onSubmit={handleSubmit}>
            <Form.Group controlId="uploadMethod">
              <Form.Check
                type="radio"
                label="Manual Entry"
                name="uploadMethod"
                value="manual"
                checked={uploadMethod === 'manual'}
                onChange={handleUploadMethodChange}
                className="mb-2"
              />
              <Form.Check
                type="radio"
                label="Upload File"
                name="uploadMethod"
                value="file"
                checked={uploadMethod === 'file'}
                onChange={handleUploadMethodChange}
                className="mb-2"
              />
            </Form.Group>

            {uploadMethod === 'manual' && (
              <>
                <Form.Group controlId="formCourseName">
                  <Form.Label>Course Name</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Enter course name"
                    value={courseName}
                    onChange={handleCourseNameChange}
                    required
                  />
                </Form.Group>
                <Form.Group controlId="formCourseCode">
                  <Form.Label>Course Code</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Enter course code"
                    value={courseCode}
                    onChange={handleCourseCodeChange}
                    required
                  />
                </Form.Group>
                <Form.Group controlId="formSemester">
                  <Form.Label>Semester</Form.Label>
                  <Form.Control
                    as="select"
                    value={selectedSemester}
                    onChange={handleSemesterChange}
                    required
                  >
                    <option value="">Select Semester</option>
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                      <option key={sem} value={`${sem}`}>{sem}</option>
                    ))}
                  </Form.Control>
                </Form.Group>
              </>
            )}

            {uploadMethod === 'file' && (
              <Form.Group controlId="formFile">
                <Form.Label>Upload File</Form.Label>
                <Form.Control
                  type="file"
                  onChange={handleFileChange}
                  accept=".csv" // Adjust file type if needed
                  className="mb-3"
                />
              </Form.Group>
            )}

            <Button type="submit" variant="primary" className="mt-3">
              {uploadMethod === 'file' ? 'Upload File' : 'Add Course'}
            </Button>
          </Form>
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

export default Courses;