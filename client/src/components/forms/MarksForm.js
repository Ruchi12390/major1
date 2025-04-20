import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import axios from 'axios';

const MarksForm = ({ students, onMarksChange, numQuestions, selectedCourseCode, selectedType, setStudents }) => {
    const [error, setError] = useState('');

    // ✅ Save Marks Function
    const handleSaveMarks = async () => {
        const marksData = students.map(student => ({
            studentId: student.enrollment,
            marks: student.marks,
        }));

        try {
            const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/save-marks`, {
                marksData,
                courseId: selectedCourseCode,
                examType: selectedType,
            });

            console.log(response.data);
            alert('Marks saved successfully!');
        } catch (error) {
            console.error('Error saving marks:', error.response ? error.response.data : error.message);
            alert(`Failed to save marks: ${error.response ? error.response.data : error.message}`);
        }
    };

    // ✅ Retrieve Marks Function
    const handleRetrieveMarks = async () => {
        try {
            const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/student-marks/${selectedCourseCode}/${selectedType}`);
            const data = response.data;

            // Merge marks into students
            const updatedStudents = students.map(student => {
                const matched = data.find(mark => mark.studentId === student.enrollment);
                return {
                    ...student,
                    marks: matched ? matched.marks : [],
                };
            });

            setStudents(updatedStudents); // update in parent state
            alert('Marks retrieved successfully!');
        } catch (err) {
            console.error('Error retrieving marks:', err);
            alert('Failed to retrieve marks');
        }
    };

    // Optional: CO Mapping Placeholder
    const handleCOMappingClick = async () => {
        try {
            const response = await fetch(`/api/exam-attempts?courseCode=${selectedCourseCode}&examType=${selectedType}`);
            const data = await response.json();

            if (response.ok) {
                alert(`Number of students attempted the exam: ${data.attempts}`);
            } else {
                alert(`Error: ${data.error}`);
            }
        } catch (error) {
            console.error('Error fetching attempts:', error);
        }
    };

    return (
        <div className="card p-3 mt-4">
            <h6 className="card-title">Enter Marks</h6>
            <div className="container">
                {students.map((student, index) => (
                    <div className="row mb-3" key={student.id}>
                        <div className="col-1">{index + 1}</div>
                        <div className="col-2">{student.name} ({student.enrollment})</div>
                        {Array.from({ length: numQuestions }).map((_, qIndex) => (
                            <div className="col" key={qIndex}>
                                <input
                                    type="number"
                                    className="form-control"
                                    placeholder={`Q${qIndex + 1}`}
                                    value={student.marks?.[qIndex] || ''}
                                    onChange={(e) => onMarksChange(student.id, qIndex, e.target.value)}
                                />
                            </div>
                        ))}
                    </div>
                ))}
            </div>

            {/* Buttons */}
            <div className="d-flex justify-content-between mt-3 flex-wrap gap-2">
                <button className="btn btn-success" onClick={handleSaveMarks}>
                    Save Marks
                </button>
                <button className="btn btn-info" onClick={handleRetrieveMarks}>
                    Retrieve Marks
                </button>
                <button className="btn btn-primary" onClick={handleCOMappingClick}>
                    CO Mapping
                </button>
            </div>

            {error && <div className="alert alert-danger mt-3">{error}</div>}
        </div>
    );
};

export default MarksForm;
