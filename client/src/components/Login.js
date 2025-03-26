import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Form, FormGroup, Label, Input, Button, Alert } from 'reactstrap';
import { FaLock } from 'react-icons/fa';
import 'bootstrap/dist/css/bootstrap.min.css';

export default function Login({ onLogin }) {
    const navigate = useNavigate();

    const [values, setValues] = useState({
        email: '',
        password: '',
        error: ''
    });

    const [errorText, setErrorText] = useState({
        email: '',
        password: '',
        global: ''
    });

    const regex = {
        email: /^([a-zA-Z0-9_\.\+-]+)@([a-zA-Z\d\.-]+)\.([a-zA-Z]{2,6})$/,
        password: /^(?=.*\d)(?=.*[a-zA-Z]).{6,}$/
    };

    const validateInput = (name, input) => {
        switch (name) {
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
        try {
            const response = await fetch('http://localhost:5000/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(values)
            });
        
            const data = await response.json();
            console.log('Login response:', data); // Check the response data
        
            if (response.ok) {
                onLogin(data.token);
    
                localStorage.setItem('enrollment', data.enrollment);; // Access the role from data.user
                console.log('Role:', data.enrollment); // Log the correct role
                
                if (data.role === 'teacher') { // Access role directly from the data object
                    navigate('/dash');
                } else if (data.role === 'admin') { // Access role directly from the data object
                    navigate('/builder');
                }else{
                    console.log('Student enrollment:', data.enrollment); // Log enrollment
                    navigate('/student-attendance', { state: { enrollment: data.enrollment } }); // Pass enrollment to state
                }
                
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
                <h1 className="h3 mb-3 font-weight-normal">Sign In</h1>
            </div>
            {values.error && <Alert color="danger">{values.error}</Alert>}
            <Form onSubmit={handleSubmit}>
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
                </FormGroup>
                {errorText.global && <Alert color="danger">{errorText.global}</Alert>}
                <Button color="primary" block type="submit">
                    Sign In
                </Button>
                <div className="text-center mt-3">
                    <a href="/signup">Don't have an account? Sign Up</a>
                </div>
            </Form>
        </Container>
    );
}
