import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AttendanceForm from '../components/forms/AttendanceForm';
import 'bootstrap/dist/css/bootstrap.min.css';
import './stylesheets/Home.css';

const Attendance = () => {
    const [showAttendanceForm, setShowAttendanceForm] = useState(false);
    const [students, setStudents] = useState([]);
    const [courses, setCourses] = useState([]);
    const [courseNames, setCourseNames] = useState({});
    const [selectedCourse, setSelectedCourse] = useState('');
    const [selectedSemester, setSelectedSemester] = useState('');
    const [date, setDate] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch students and courses when the component mounts
    useEffect(() => {
        const enrollment = localStorage.getItem('enrollment'); 
        console.log(enrollment);
    
        const fetchData = async () => {
            try {
                // Fetch students
                const studentsResponse = await axios.get(`${process.env.REACT_APP_API_URL}/api/students`);
                setStudents(studentsResponse.data); // Ensure data is fully resolved
    
                // Fetch teacher courses based on enrollment
                const coursesResponse = await axios.get(`${process.env.REACT_APP_API_URL}/api/teacher-courses/${enrollment}`);
                const coursesData = await coursesResponse.data; // Await the data here
                console.log(coursesData);
                setCourses(coursesData); // Set resolved data

                // Fetch course names for each course
                const names = {};
                for (const course of coursesData) {
                    const courseName = await fetchCourseName(course.courseCode);
                    names[course.courseCode] = courseName;
                }
                setCourseNames(names); // Store course names in state
            } catch (error) {
                setError('Error fetching data');
                console.error('Error fetching data:', error);
            } finally {
                setLoading(false);
            }
        };
    
        fetchData();
    }, []);

    // Function to fetch course name from the backend
    const fetchCourseName = async (courseCode) => {
        try {
            const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/course/${courseCode}`);
            return response.data ? response.data.courseName : null;
        } catch (error) {
            console.error('Error fetching course:', error);
            return null;  // Return null or handle error appropriately
        }
    };

    const handleCourseClick = (courseCode, semester) => {
        setSelectedCourse(courseCode);
        console.log(courseNames[courseCode]);  // Log the fetched course name
        setSelectedSemester(semester);
        setShowAttendanceForm(false);  // Reset attendance form visibility
    };

    const handleShowClick = () => {
        if (selectedCourse && selectedSemester && date) {
            setShowAttendanceForm(true);
        } else {
            alert('Please select a date.');
        }
    };

    const handleAttendanceChange = (id, isPresent) => {
        const updatedStudents = students.map(student =>
            student.id === id ? { ...student, present: isPresent } : student
        );
        setStudents(updatedStudents);
    };

    if (loading) return <p>Loading...</p>;
    if (error) return <p>{error}</p>;

    return (
        <div className="container mt-4 new" style={{ maxWidth: '800px', marginTop: '20px', padding: '20px' }}>
            <h6 className="mb-4">
                Department of Computer Engineering
            </h6>
            <hr className="mb-4" style={{ height: '1px', border: 'none', backgroundColor: '#007bff', opacity: '0.75' }} />
            <div className="row">
                <div className="col-md-12">
                    <div className="mb-3">
                        <label className="form-label">Courses</label>
                        <ul className="list-group">
                            {courses.map(course => (
                                <li 
                                    key={course.courseCode} 
                                    className={`list-group-item ${selectedCourse === course.courseCode ? 'selected-course' : ''}`} 
                                    onClick={() => handleCourseClick(course.courseCode, course.semester)} // Use courseCode and semester
                                    style={{ cursor: 'pointer' }}
                                >
                                    {courseNames[course.courseCode] || 'Loading...'} - {course.courseCode} (Semester: {course.semester})
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div className="mb-3">
                        <label htmlFor="date" className="form-label">Date</label>
                        <input 
                            type="date" 
                            className="form-control" 
                            id="date" 
                            name="date" 
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                        />
                    </div>
                    <button 
                        className="btn btn-primary btn-lg"
                        onClick={handleShowClick}
                    >
                        Mark Attendance
                    </button>
                </div>
            </div>
            {showAttendanceForm && (
                <AttendanceForm 
                    students={students} 
                    onAttendanceChange={handleAttendanceChange} 
                    selectedCourse={selectedCourse} // Pass selected courseCode to AttendanceForm
                    selectedSemester={selectedSemester} // Pass selected semester to AttendanceForm
                    date={date}
                />
            )}
        </div>
    );
};

export default Attendance;
