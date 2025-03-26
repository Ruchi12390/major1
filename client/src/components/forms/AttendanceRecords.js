import React, { useState, useEffect } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../stylesheets/Home.css';

const AttendanceRecords = () => {
    const role = localStorage.getItem('role');
    console.log(role);

    const [fromDate, setFromDate] = useState('');
    const [toDate, setToDate] = useState('');
    const [attendanceRecords, setAttendanceRecords] = useState([]);
    const [courses, setCourses] = useState([]);
    const [selectedSemester, setSelectedSemester] = useState('');
    const [selectedCourse, setSelectedCourse] = useState(''); // State for selected course
    const [semesters, setSemesters] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Fetch courses when the component mounts
    useEffect(() => {
        const fetchCourses = async () => {
            const enrollment = localStorage.getItem('enrollment'); // Get enrollment from local storage
            try {
                const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/teacher-courses/${enrollment}`);
                setCourses(response.data);
                // Extract semesters from the courses and create a unique list
                const uniqueSemesters = [...new Set(response.data.map(course => course.semester))];
                setSemesters(uniqueSemesters);
            } catch (error) {
                console.error('Error fetching courses:', error);
                setError('Error fetching courses');
            }
        };
        fetchCourses();
    }, []);

    const handleFetchRecords = async () => {
        if (!fromDate || !toDate || !selectedSemester) {
            alert('Please select from, to dates, and a semester.');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/record`, {
                params: { fromDate, toDate, semester: selectedSemester }
            });
            setAttendanceRecords(response.data);
        } catch (error) {
            setError('Error fetching attendance records');
            console.error('Error fetching attendance records:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleFetchCourseRecords = async () => {
        if (!fromDate || !toDate || !selectedSemester) {
            alert('Please select from, to dates, and a semester.');
            return;
        }

        console.log(`Fetching records for Course: ${selectedCourse}, From: ${fromDate}, To: ${toDate}, Semester: ${selectedSemester}`);

        setLoading(true);
        setError(null);

        try {
            const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/record`, {
                params: { fromDate, toDate, courseCode: selectedCourse === "All Courses" ? undefined : selectedCourse, semester: selectedSemester } // Handle "All Courses" option
            });
            setAttendanceRecords(response.data);
        } catch (error) {
            setError('Error fetching attendance records for the selected course');
            console.error('Error fetching attendance records for the selected course:', error);
        } finally {
            setLoading(false);
        }
    };

    // Calculate present count, total days, and percentage for each student across all courses
    const calculateAttendanceSummary = () => {
        const summary = {};

        attendanceRecords.forEach(record => {
            const studentId = record.student_id;
            const courseCode = record.course_code;

            if (!summary[studentId]) {
                summary[studentId] = { courses: {}, totalPresent: 0, totalDays: 0 };
            }

            if (!summary[studentId].courses[courseCode]) {
                summary[studentId].courses[courseCode] = { present: 0, total: 0 };
            }

            summary[studentId].courses[courseCode].total += 1;
            if (record.present) {
                summary[studentId].courses[courseCode].present += 1;
            }

            summary[studentId].totalDays += 1;
            if (record.present) {
                summary[studentId].totalPresent += 1;
            }
        });

        return summary;
    };

    const attendanceSummary = calculateAttendanceSummary();

    // Function to filter detained students whose overall attendance is less than 75%
    const getDetainedStudents = () => {
        return Object.keys(attendanceSummary).filter(studentId => {
            const overallPercentage = (attendanceSummary[studentId].totalPresent / attendanceSummary[studentId].totalDays) * 100;
            return overallPercentage < 75; // Return students with less than 75% attendance
        });
    };

    const detainedStudents = getDetainedStudents();

    // Function to download attendance summary as CSV
    const downloadCSV = () => {
        const headers = ['Student ID'];
        const courseCodes = Object.keys(attendanceSummary[Object.keys(attendanceSummary)[0] || {}].courses);
        courseCodes.forEach(courseCode => {
            headers.push(courseCode + ' Present', courseCode + ' Total', courseCode + ' Percentage');
        });
        headers.push('Total Present', 'Total Days', 'Overall Percentage');

        const rows = Object.keys(attendanceSummary).map(studentId => {
            const row = [studentId];
            courseCodes.forEach(courseCode => {
                const { present, total } = attendanceSummary[studentId].courses[courseCode] || { present: 0, total: 0 };
                const percentage = total > 0 ? ((present / total) * 100).toFixed(2) : 0;
                row.push(present, total, `${percentage}%`);
            });
            row.push(attendanceSummary[studentId].totalPresent, attendanceSummary[studentId].totalDays, 
                     `${((attendanceSummary[studentId].totalPresent / attendanceSummary[studentId].totalDays) * 100).toFixed(2)}%`);
            return row;
        });

        const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', 'attendance_summary.csv');
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };
    const downloadDetainedCSV = () => {
        const headers = ['Student ID', 'Total Present', 'Total Days', 'Overall Percentage'];
    
        const rows = detainedStudents.map(studentId => {
            const { totalPresent, totalDays } = attendanceSummary[studentId];
            const overallPercentage = ((totalPresent / totalDays) * 100).toFixed(2);
            return [studentId, totalPresent, totalDays, `${overallPercentage}%`];
        });
    
        const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', 'detained_students.csv');
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };
    
    return (
        <div className="container mt-4" style={{ maxWidth: '800px', padding: '20px' }}>
            <h3 className="mb-4">View Attendance Records</h3>

            {/* Semester Dropdown */}
            <div className="mb-3">
                <label className="form-label">Select Semester</label>
                <select
                    className="form-select"
                    value={selectedSemester}
                    onChange={(e) => setSelectedSemester(e.target.value)}
                >
                    <option value="">Select Semester</option>
                    {semesters.map((semester) => (
                        <option key={semester} value={semester}>
                            {semester}
                        </option>
                    ))}
                </select>
            </div>

            {/* Date Inputs */}
            <div className="mb-3">
                <label htmlFor="fromDate" className="form-label">From Date</label>
                <input
                    type="date"
                    className="form-control"
                    id="fromDate"
                    value={fromDate}
                    onChange={(e) => setFromDate(e.target.value)}
                />
            </div>
            <div className="mb-3">
                <label htmlFor="toDate" className="form-label">To Date</label>
                <input
                    type="date"
                    className="form-control"
                    id="toDate"
                    value={toDate}
                    onChange={(e) => setToDate(e.target.value)}
                />
            </div>

            <button className="btn btn-primary" onClick={handleFetchRecords}>
                Fetch Attendance Records
            </button>

            {/* List for Course Selection */}
            <div className="mb-3 mt-4">
                <label className="form-label">Select Course to View Specific Attendance</label>
                <ul className="list-group">
                    <li
                        className={`list-group-item ${selectedCourse === "All Courses" ? 'active' : ''}`}
                        onClick={() => setSelectedCourse("All Courses")}
                        style={{ cursor: 'pointer' }}
                    >
                        All Courses
                    </li>
                    {courses.map((course) => (
                        <li
                            key={course.courseCode}
                            className={`list-group-item ${course.courseCode === selectedCourse ? 'active' : ''}`}
                            onClick={() => setSelectedCourse(course.courseCode)}
                            style={{ cursor: 'pointer' }}
                        >
                            {course.courseCode} (Semester: {course.semester})
                        </li>
                    ))}
                </ul>
            </div>

            {/* Button to Fetch Course-Specific Attendance */}
            <button className="btn btn-secondary mt-3" onClick={handleFetchCourseRecords}>
                Fetch Course-Specific Records
            </button>

            {/* Attendance Summary Table */}
            {attendanceRecords.length > 0 && (
                <div>
                    <h4 className="mt-4">Attendance Summary</h4>
                    <table className="table table-bordered mt-3">
                        <thead>
                            <tr>
                                <th>Student ID</th>
                                {Object.keys(attendanceSummary[Object.keys(attendanceSummary)[0]].courses).map(courseCode => (
                                    <th key={courseCode}>{courseCode} Attendance</th>
                                ))}
                                <th>Total Present</th>
                                <th>Total Days</th>
                                <th>Overall Percentage</th>
                            </tr>
                        </thead>
                        <tbody>
                            {Object.keys(attendanceSummary).map(studentId => (
                                <tr key={studentId}>
                                    <td>{studentId}</td>
                                    {Object.keys(attendanceSummary[studentId].courses).map(courseCode => {
                                        const { present, total } = attendanceSummary[studentId].courses[courseCode];
                                        return <td key={courseCode}>{`${present}/${total}`}</td>;
                                    })}
                                    <td>{attendanceSummary[studentId].totalPresent}</td>
                                    <td>{attendanceSummary[studentId].totalDays}</td>
                                    <td>
                                        {((attendanceSummary[studentId].totalPresent / attendanceSummary[studentId].totalDays) * 100).toFixed(2)}%
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    <button className="btn btn-success" onClick={downloadCSV}>Download Attendance Summary (CSV)</button>
                </div>
            )}

            {/* Detained Students Table */}
            

            {loading && <p>Loading attendance records...</p>}
            {error && <p className="text-danger">{error}</p>}
            {detainedStudents.length > 0 && (
    <div>
        <h4 className="mt-4">Detained Students (Less than 75% Attendance)</h4>
        <table className="table table-bordered mt-3">
            <thead>
                <tr>
                    <th>Student ID</th>
                    <th>Total Present</th>
                    <th>Total Days</th>
                    <th>Overall Percentage</th>
                </tr>
            </thead>
            <tbody>
                {detainedStudents.map(studentId => (
                    <tr key={studentId}>
                        <td>{studentId}</td>
                        <td>{attendanceSummary[studentId].totalPresent}</td>
                        <td>{attendanceSummary[studentId].totalDays}</td>
                        <td>
                            {((attendanceSummary[studentId].totalPresent / attendanceSummary[studentId].totalDays) * 100).toFixed(2)}%
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
        
        {/* Button to Download Detained Students CSV */}
        <button className="btn btn-warning" onClick={downloadDetainedCSV}>
            Download Detained Students (CSV)
        </button>
    </div>
)}

        </div>
    );
};

export default AttendanceRecords;
