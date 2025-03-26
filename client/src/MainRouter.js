import React, { useState, useEffect } from "react";
import { Routes, Route } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import NavBar from './components/NavBar';  // Ensure the path is correct
import Footer from './components/Footer';  // Ensure the path is correct
import Home from './components/Home';  // Ensure the path is correct
import Signup from './components/Signup';  // Ensure the path is correct
import Login from './components/Login';
import Marks from './components/Marks';
import Attendance from './components/Attendance';
import Builder from "./components/Builder";
import ProtectedRoute from './ProtectedRoute';
import 'bootstrap/dist/css/bootstrap.css';  // Ensure Bootstrap CSS is imported
import StudentAttendancePage from './components/forms/StudentAttendance';
import TeacherCourseSelection from './components/forms/TeacherSubjectSelectionPage';
import AttendanceRecords from './components/forms/AttendanceRecords';
import Dashboard from "./components/Dashboard";


const MainRouter = () => {
    const [token, setToken] = useState(localStorage.getItem('token'));
    const navigate = useNavigate();
    const handleLogin = (newToken) => {
        setToken(newToken);
        localStorage.setItem('token', newToken);
    };

    const handleLogout = () => {
        setToken(null);
        localStorage.removeItem('token');
        navigate('/login');
    };

    useEffect(() => {
        setToken(localStorage.getItem('token'));
    }, []);

    return (
        <div className="d-flex flex-column min-vh-100">
            <NavBar token={token} logOut={handleLogout} />
            <div className="flex-grow-1">
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/signup" element={<Signup />} />
                    <Route path="/login" element={<Login onLogin={handleLogin} />} />
                    <Route path="/attendance" element={<Attendance />} />
                    <Route path="/marks" element={<Marks />} />
                    <Route path="/student-attendance" element={<StudentAttendancePage />} />
                    <Route path="/record" element={<AttendanceRecords />} />
                    
                    <Route path="/dash" element={<Dashboard />} />
                    <Route path="/teacher" element={<TeacherCourseSelection />} />
                    <Route path="/builder" element={<ProtectedRoute token={token}><Builder /></ProtectedRoute>} />
                </Routes>
            </div>
            <Footer />
        </div>
    );
}

export default MainRouter;
