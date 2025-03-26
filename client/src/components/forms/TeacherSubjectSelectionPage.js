import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Container, FormGroup, Label, Button } from 'reactstrap';

const TeacherCourseSelection = () => {
    const [courses, setCourses] = useState([]);
    const [selectedCourses, setSelectedCourses] = useState([]);
    const [userInfo, setUserInfo] = useState({
        name: '',
        email: '',
        enrollment: '',
        id: ''
    });

    useEffect(() => {
        const enrollment = localStorage.getItem('enrollment'); // Get the teacher's enrollment from local storage

        const fetchCourses = async () => {
            try {
                const courseInfoResponse = await axios.get(`${process.env.REACT_APP_API_URL}/api/course-info`);
                setCourses(courseInfoResponse.data);
                console.log('Fetched Courses:', courseInfoResponse.data); // Log fetched courses for debugging
            } catch (error) {
                console.error('Error fetching courses:', error);
            }
        };

        const fetchUserInfo = async () => {
            try {
                const userResponse = await axios.get(`${process.env.REACT_APP_API_URL}/api/user-info/${enrollment}`);
                console.log('Fetched User Info:', userResponse.data); // Log fetched user info for debugging
                setUserInfo(userResponse.data); // Set the returned user info (name, email, etc.)
            } catch (error) {
                console.error('Error fetching user info:', error);
            }
        };

        fetchCourses();
        fetchUserInfo();
    }, []);

    const handleCourseSelect = (event) => {
        const options = event.target.options;
        const selected = Array.from(options).filter(option => option.selected);

        // Store selected courses and their semesters
        const selectedData = selected.map(option => {
            const course = courses.find(c => c.courseCode === option.value); // Ensure you're comparing courseCode
            return {
                id: option.value,
                semester: course ? course.semester : null, // Safely access semester
            };
        });

        setSelectedCourses(selectedData);
        console.log('Selected Courses:', selectedData); // Log selected courses
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        
        if (selectedCourses.length === 0) {
            alert('Please select at least one course.');
            return;
        }

       
        console.log('Data being sent to the server:', {
            teacherId: userInfo.enrollment,
            name: userInfo.name,
            email: userInfo.email,
            courseIds: selectedCourses.map(course => course.id), // Use course id
            semester: selectedCourses[0].semester // Assuming semester is the same for all
        });

        try {
            const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/teacher/courses`, {
                teacherId: userInfo.enrollment,
                name: userInfo.name,
                email: userInfo.email,
                courseIds: selectedCourses.map(course => course.id), // Send selected course IDs
                semester: selectedCourses[0].semester // Assuming semester is the same for all
            });

            if (response.status === 200) {
                alert(response.data.message);
            }
        } catch (error) {
            console.error('Error submitting courses:', error);
            alert('An error occurred while submitting courses. Please try again.');
        }
    };

    return (
        <Container>
            {userInfo.enrollment && <h2> </h2>} {/* Display welcome message */}
            <h2>Select Courses </h2>
            <form onSubmit={handleSubmit}>
                <FormGroup>
                    <Label for="courseSelect">Available Courses</Label>
                    <select
                        id="courseSelect"
                        multiple
                        onChange={handleCourseSelect}
                        className="form-control"
                    >
                        {courses.map((course) => (
                            <option key={course.courseCode} value={course.courseCode}> {/* Use courseCode as value */}
                                {course.courseName} ({course.courseCode}) ({course.semester})
                            </option>
                        ))}
                    </select>
                </FormGroup>
                <Button type="submit" color="primary">Submit</Button>
            </form>
            {selectedCourses.length > 0 && (
                <div>
                    <h4>Selected Courses:</h4>
                    <ul>
                        {selectedCourses.map((course) => (
                            <li key={course.id}>{course.id} - Semester: {course.semester}</li>
                        ))}
                    </ul>
                </div>
            )}
        </Container>
    );
};

export default TeacherCourseSelection;
