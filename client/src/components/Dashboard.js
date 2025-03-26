import React from 'react';
import { Link, Route, Routes } from 'react-router-dom';
import AttendanceRecords from './forms/AttendanceRecords';
import TeacherCourseSelection from './forms/TeacherSubjectSelectionPage'; // Adjust the path according to your structure
 // Adjust the path accordingly
import Marks from './Marks'; // This is a new component to show marks
import './stylesheets/Home.css';
import Builder from './Builder';
import Attendance from './Attendance';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logInSuccess } from '../redux/actionCreators'; // Ensure this action exists
import "./stylesheets/Home.css";
// Dashboard.jsx

const Dashboard = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();

    // Get token and data from the Redux store
    const token = useSelector(state => state.resume.token);
    const data = useSelector(state => state.resume.data);

    const handleClick = () => {
        dispatch(logInSuccess(-1)); // Adjust action if needed
        navigate("/builder");
    };

    const handleClick1 = () => {
        dispatch(logInSuccess(-1)); // Adjust action if needed
        navigate("/attendance");
    };

    const handleClick2 = () => {
        dispatch(logInSuccess(-1)); // Adjust action if needed
        navigate("/marks");
    };
    const publicURL = process.env.PUBLIC_URL;
    return (
        <div className="d-flex">
            {/* Sidebar */}
            <nav className="sidebar bg-light" style={{ width: '400px', height: '100vh', padding: '20px' }}>
                <h4>Dashboard</h4>
                <ul className="nav flex-column">
                    <li className="nav-item">
                        <Link className="nav-link" to="/record">Attendance Records</Link>
                    </li>
                    <li className="nav-item">
                        <Link className="nav-link" to="/teacher">Select Course</Link>
                    </li>
                    <li className="nav-item">
                        <Link className="nav-link" to="/marks">Marks Entry</Link>
                    </li>
                    <li className="nav-item">
                        <Link className="nav-link" to="/attendance">Mark Attendance</Link>
                    </li>
                    
                </ul>
            </nav>

            {/* Main Content Area */}
            <div className="content flex-grow-1" style={{ padding: '40px', overflowY: 'auto' }}>
                <Routes>
                    <Route path="/record" element={<AttendanceRecords />} />
                    <Route path="/teacher" element={<TeacherCourseSelection />} />
                    <Route path="/marks" element={<Marks />} />
                    <Route path="/builder" element={<Builder />} />
                    <Route path="/attendance" element={<Attendance />} /> {/* Fixed duplicate path */}
                </Routes>
            </div>
            <div className="page-wrapper">
            <div className="main container-fluid">
                <section className="top row d-flex">
                    <div className="col-sm left">
                        <div className="heading-content align-middle">
                            <span className="main-heading">Attendance and Achievement Manager</span>
                            <br />
                        </div>
                        <br />
                        <div>
                            <ul style={{ listStyleType: 'none', padding: 0 }}>
                                <li>
                                    <button
                                        className="btn btn-primary btn-lg"
                                        style={{ backgroundColor: "#ADD8E6", width: '400px', height: '60px' }}
                                        onClick={handleClick1}
                                    >
                                        Attendance
                                    </button>
                                </li>
                                <li>
                                    <button
                                        className="btn btn-primary btn-lg"
                                        style={{ backgroundColor: "#ADD8E6", width: '400px', height: '60px' }}
                                        onClick={handleClick2}
                                    >
                                        Marks Entry
                                    </button>
                                </li>
                                <li>
                                    <button
                                        className="btn btn-primary btn-lg"
                                        style={{ backgroundColor: "#ADD8E6", width: '400px', height: '60px' }}
                                        onClick={handleClick}
                                    >
                                        Student and Course details
                                    </button>
                                </li>
                            </ul>
                        </div>
                    </div>
                    <div className="col-sm right new ">
                        <img
                            style={{marginTop:"100px"}}
                            src={publicURL + "https://fiverr-res.cloudinary.com/images/t_main1,q_auto,f_auto,q_auto,f_auto/gigs/283685515/original/6f5fe15ac6cc54febe1db87fdf89c17fdae2a01e/write-a-professional-resume-and-cv.jpg"}
                            alt="resume"
                        />
                    </div>
                </section>

                <section className="build-wrapper"></section>
            </div>
        </div>
        </div>
    );
};

export default Dashboard;
