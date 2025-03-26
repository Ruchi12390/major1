import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Form, FormGroup, Label, Input, Button, Alert } from 'reactstrap';
import { FaLock } from 'react-icons/fa';
import 'bootstrap/dist/css/bootstrap.min.css';

export default function Signup() {
    const navigate = useNavigate()
    const [values, setValues] = useState({
        firstName: '',
        lastName: '',
        password: '',
        email: '',
        role: 'student', // Default role
        enrollment: '', // Add enrollment to state
        error: ''
    });

    const [errorText, setErrorText] = useState({
        email: '',
        lastName: '',
        firstName: '',
        password: '',
        global: ''
    });

    const regex = {
        email: /^([a-zA-Z0-9_\.\+-]+)@([a-zA-Z\d\.-]+)\.([a-zA-Z]{2,6})$/,
        name: /^[A-Za-z]{2,}$/,
        password: /^(?=.*\d)(?=.*[a-zA-Z]).{6,}$/
    };

    const validateInput = (name, input) => {
        switch (name) {
            case 'firstName':
            case 'lastName':
                if (!input.match(regex.name)) {
                    setErrorText({ ...errorText, [name]: 'Invalid Name; Length > 2' });
                } else {
                    setErrorText({ ...errorText, [name]: '' });
                }
                break;
            case 'email':
                if (!input.match(regex.email)) {
                    setErrorText({ ...errorText, email: 'Invalid Email' });
                } else {
                    setErrorText({ ...errorText, email: '' });
                }
                break;
            case 'password':
                if (!input.match(regex.password)) {
                    setErrorText({ ...errorText, password: 'Password must be at least 6 characters and include at least one number' });
                } else {
                    setErrorText({ ...errorText, password: '' });
                }
                break;
            default:
                break;
        }
    };

    const handleInputChange = (event) => {
        const { name, value } = event.target;
        validateInput(name, value);
        setValues({ ...values, [name]: value });
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!values.firstName || !values.lastName || !values.email || !values.password) {
            setErrorText({ ...errorText, global: 'All fields are required' });
            return;
        }

        const userDetails = {
            name: values.firstName,
            email: values.email,
            password: values.password,
            role: values.role || 'student', // Default to 'student' if role is not provided
            enrollment: values.enrollment // Set this based on your requirement
        };
        localStorage.setItem('role', userDetails.role);
        try {
            const response = await fetch('http://localhost:5000/api/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(userDetails)
            });

            const data = await response.json();

            if (response.ok) {
                navigate('/login');
            } else {
                setValues({ ...values, error: data.error });
            }
        } catch (error) {
            setValues({ ...values, error: 'An error occurred' });
        }
    };

    return (
        <Container className="mt-5 signup" style={{ maxWidth: '430px', marginTop: '20px', padding: '20px' }}>
            <div className="text-center mb-4">
                <FaLock size={50} />
                <h1 className="h3 mb-3 font-weight-normal">Sign Up</h1>
            </div>
            {values.error && <Alert color="danger">{values.error}</Alert>}
            <Form onSubmit={handleSubmit}>
                <FormGroup>
                    <Label for="firstName">First Name</Label>
                    <Input
                        type="text"
                        name="firstName"
                        id="firstName"
                        placeholder="First Name"
                        value={values.firstName}
                        onChange={handleInputChange}
                        invalid={!!errorText.firstName}
                    />
                    {errorText.firstName && <div className="invalid-feedback">{errorText.firstName}</div>}
                </FormGroup>
                <FormGroup>
                    <Label for="lastName">Last Name</Label>
                    <Input
                        type="text"
                        name="lastName"
                        id="lastName"
                        placeholder="Last Name"
                        value={values.lastName}
                        onChange={handleInputChange}
                        invalid={!!errorText.lastName}
                    />
                    {errorText.lastName && <div className="invalid-feedback">{errorText.lastName}</div>}
                </FormGroup>
                <FormGroup>
                    <Label for="email">Email Address</Label>
                    <Input
                        type="email"
                        name="email"
                        id="email"
                        placeholder="Email Address"
                        value={values.email}
                        onChange={handleInputChange}
                        invalid={!!errorText.email}
                    />
                    {errorText.email && <div className="invalid-feedback">{errorText.email}</div>}
                </FormGroup>
                <FormGroup>
                    <Label for="password">Password</Label>
                    <Input
                        type="password"
                        name="password"
                        id="password"
                        placeholder="Password"
                        value={values.password}
                        onChange={handleInputChange}
                        invalid={!!errorText.password}
                    />
                    {errorText.password && <div className="invalid-feedback">{errorText.password}</div>}
                </FormGroup>
                <FormGroup>
                    <Label for="enrollment">Id</Label>
                    <Input
                        type="text"
                        name="enrollment"
                        id="enrollment"
                        placeholder="Id"
                        value={values.enrollment}
                        onChange={handleInputChange}
                    />
                </FormGroup>
                <FormGroup>
                    <Label for="role">Role</Label>
                    <Input
                        type="select"
                        name="role"
                        id="role"
                        value={values.role}
                        onChange={handleInputChange}
                    >
                        <option value="student">Student</option>
                        <option value="teacher">Teacher</option>
                        <option value="admin">Admin</option> {/* Added admin role */}
                    </Input>
                </FormGroup>
                <Button color="primary" block type="submit">
                    Sign Up
                </Button>
                <div className="text-center mt-3">
                    <a href="/login">Already have an account? Sign in</a>
                </div>
            </Form>
        </Container>
    );
}
