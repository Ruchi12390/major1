import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useLocation } from 'react-router-dom';
import './StudentAttendancePage.css';

const StudentAttendancePage = () => {
    const location = useLocation();
    const { enrollment } = location.state || {};
    const [groupedAttendance, setGroupedAttendance] = useState({});
    const [error, setError] = useState('');
    const [showDetails, setShowDetails] = useState({});

    // Utility to format the date as "Month Year"
    const formatMonthYear = (date) => {
        const options = { year: 'numeric', month: 'long' };
        return new Date(date).toLocaleDateString(undefined, options);
    };

    // Group attendance records by subject and month
    const groupAttendanceBySubjectAndMonth = (records) => {
        const grouped = {};

        records.forEach((record) => {
            const subject = record.course?.courseName || 'Unknown Course';
            const monthYear = formatMonthYear(record.date);

            // Initialize subject if not already
            if (!grouped[subject]) {
                grouped[subject] = {};
            }

            // Initialize month for the subject if not already
            if (!grouped[subject][monthYear]) {
                grouped[subject][monthYear] = [];
            }

            // Push the record into the corresponding month
            grouped[subject][monthYear].push(record);
        });

        return grouped;
    };

    // Calculate total presents and total attendance per subject per month
    const calculateAttendanceSummary = (records) => {
        const total = records.length;
        const present = records.filter(record => record.present).length;
        return { present, total };
    };

    // Toggle details view for a specific subject and month
    const toggleDetails = (subject, month) => {
        setShowDetails(prevState => ({
            ...prevState,
            [`${subject}-${month}`]: !prevState[`${subject}-${month}`]
        }));
    };

    // Fetch attendance data subject-wise for a student
    useEffect(() => {
        const fetchStudentAttendance = async () => {
            if (enrollment) {
                try {
                    const response = await axios.get(`http://localhost:5000/api/attendance/${enrollment}`);
                    const groupedData = groupAttendanceBySubjectAndMonth(response.data);
                    setGroupedAttendance(groupedData);
                } catch (err) {
                    setError('No data found.');
                    console.error('Error fetching attendance:', err);
                }
            } else {
                setError('No enrollment information available.');
            }
        };

        fetchStudentAttendance();
    }, [enrollment]);

    return (
        <div className="attendance-container">
            <h2>Student Attendance Records (Subject-wise & Monthly)</h2>
            {enrollment && <h3 className="welcome-text">Welcome, {enrollment}!</h3>}
            {error && <p className="error-text">{error}</p>}

            {Object.keys(groupedAttendance).length === 0 ? (
                <p>No attendance records found.</p>
            ) : (
                Object.entries(groupedAttendance).map(([subject, months]) => (
                    <div key={subject} className="subject-attendance">
                        <h4>Subject: {subject}</h4>
                        {Object.entries(months).map(([month, records]) => {
                            const { present, total } = calculateAttendanceSummary(records);
                            return (
                                <div key={month} className="monthly-attendance">
                                    <h5>{month}</h5>
                                    <p>Present: {present} out of {total}</p>
                                    <button
                                        className="view-details-button"
                                        onClick={() => toggleDetails(subject, month)}
                                    >
                                        {showDetails[`${subject}-${month}`] ? 'Hide Details' : 'View Details'}
                                    </button>

                                    {/* Show detailed records if the "View Details" button is clicked */}
                                    {showDetails[`${subject}-${month}`] && (
                                        <ul className="attendance-list">
                                            {records.map((record, index) => (
                                                <li key={index} className="attendance-item">
                                                    Date: {new Date(record.date).toLocaleDateString()}, 
                                                    Status: {record.present ? 'Present' : 'Absent'}
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                ))
            )}
        </div>
    );
};

export default StudentAttendancePage;
