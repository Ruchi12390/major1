import React, { useEffect, useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import axios from 'axios';

// Component to display attendance count for a student
const AttendanceCount = ({ studentId, courseCode }) => {
    const [attendanceCount, setAttendanceCount] = useState({ present: 0, absent: 0 });

    useEffect(() => {
        const fetchAttendanceCount = async () => {
            if (!studentId || !courseCode) {
                console.error('Missing studentId or courseCode.');
                return;
            }
        
            try {
                const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/attendance/count`, {
                    params: {
                        student_id: studentId,
                        course_code: courseCode,
                    },
                });
        
                setAttendanceCount(response.data);
            } catch (error) {
                console.error('Error fetching attendance count:', error.response ? error.response.data : error.message);
            }
        };
        console.log("Fetching attendance count for:", { studentId, courseCode });        

        fetchAttendanceCount();
    }, [studentId, courseCode]);
    
    return (
        <div >
            <p><strong>Present:</strong> {attendanceCount.present}</p>
            <p><strong>Absent:</strong> {attendanceCount.absent}</p>
        </div>
    );
};

// Component to handle each student's attendance marking
// Component to handle each student's attendance marking
const AttendanceRow = ({ student, onAttendanceChange, courseCode }) => {
    const handleCheckboxChange = (isPresent) => {
        onAttendanceChange(student.id, isPresent);
    };

    return (
        <tr key={student.id}>
            <td>{student.id}</td>
            <td>{student.enrollment}</td>
            <td>{student.firstName} {student.lastName}</td>
            <td>
                <div className="form-check">
                    <input
                        className="form-check-input"
                        type="checkbox"
                        id={`attendance-${student.id}`}
                        checked={student.present === true}
                        onChange={(e) => handleCheckboxChange(e.target.checked)}
                    />
                    <label className="form-check-label" htmlFor={`attendance-${student.id}`}>
                        Present
                    </label>
                </div>
            </td>
            <td>
                <AttendanceCount studentId={student.enrollment} courseCode={courseCode} />
            </td>
        </tr>
    );
};


// Main Attendance Form component
const AttendanceForm = ({ students, onAttendanceChange, selectedSemester, selectedCourse, date }) => {
    const filteredStudents = students.filter(student => student.semester === selectedSemester);

    const handleSaveAttendance = async () => {
        try {
            await Promise.all(filteredStudents.map(student =>
                axios.post(`${process.env.REACT_APP_API_URL}/api/attendance`, {
                    student_id: student.enrollment,
                    course_code: selectedCourse,
                    date,
                    present: student.present === true, // This will be true if the checkbox is checked
                })
            ));
            alert('Attendance records saved successfully.');
        } catch (error) {
            console.error('Error saving attendance:', error.response ? error.response.data : error.message);
            alert('Failed to save attendance records.');
        }
    };
    

    return (
        <div className="container mt-4 p-3 border rounded">
            <h6 className="mb-4">Mark Attendance</h6>
            <p><strong>Course Code:</strong> {selectedCourse}</p>
            <p><strong>Date:</strong> {date}</p>
            <div className="table-responsive">
                <table className="table table-bordered">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Enrollment</th>
                            <th>Name</th>
                            <th>Present</th>
                            <th>Absent</th>
                            
                        </tr>
                    </thead>
                    <tbody>
                        {filteredStudents.map(student => (
                            <AttendanceRow
                                key={student.id}
                                student={student}
                                onAttendanceChange={onAttendanceChange}
                                courseCode={selectedCourse}
                            />
                        ))}
                    </tbody>
                </table>
                <button className="btn btn-primary" onClick={handleSaveAttendance}>
                    Save Attendance
                </button>
            </div>
        </div>
    );
};

export default AttendanceForm;
