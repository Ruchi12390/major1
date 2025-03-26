import React, { useState } from 'react';
import { Container, Button, ListGroup, ListGroupItem, Image } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { connect } from 'react-redux';
import Student from './forms/Student';
import Courses from './forms/Courses';
import UpdateStudentDetail from './forms/Student2';
import AddStudent from './forms/Personal';
import DeleteStudent from './forms/Skill';
import UpdateCourseDetails from './forms/Achievement';

const steps = [
    'Add Courses',
    'Add Student',
    'Add Remaining Student',
    'Add Single Student',
    'Delete Student',
    'Update Course Details',
    'Update Student Details',
];

const Builder = (props) => {
    const [activeStep, setActiveStep] = useState(0);
    const navigate = useNavigate(); // useNavigate instead of useHistory
    const { token, resume, image } = props;

    const getStepContent = (step) => {
        switch (step) {
            case 0:
                return <Courses />;
            case 1:
                return <Student />;
            case 2:
                return <Student />;
            case 3:
                return <AddStudent />;
            case 4:
                return <DeleteStudent />;
            case 5:
                return <UpdateCourseDetails />;
            case 6:
                return <UpdateStudentDetail />;
            default:
                throw new Error('Unknown step');
        }
    };

    const handleClick = (idx) => {
        setActiveStep(idx);
    };

    const handleNext = () => {
        setActiveStep((prevStep) => prevStep + 1);
    };

    const handleBack = () => {
        setActiveStep((prevStep) => prevStep - 1);
    };

    const clickSave = (event) => {
        if (event) event.preventDefault();

        if (resume._id) {
            // Implement save logic if needed
        } else if (token) {
            navigate('/signup'); // Redirect to signup if token is not available
        } else {
            navigate('/signup'); // Redirect to signup if token is not available
        }
    };

    return (
        <Container fluid className="d-flex flex-column min-vh-100">
            <div className="d-flex flex-column flex-grow-1 mt-4">
                <div className="d-flex">
                    <div className="d-none d-md-block me-3">
                        <ListGroup>
                            {steps.map((label, idx) => (
                                <ListGroupItem
                                    key={label}
                                    action
                                    active={activeStep === idx}
                                    onClick={() => handleClick(idx)}
                                >
                                    {label}
                                </ListGroupItem>
                            ))}
                        </ListGroup>
                    </div>
                    <div className="flex-grow-1">
                        <div className="card p-3">
                            {getStepContent(activeStep)}
                            <div className="d-flex justify-content-between mt-3">
                                <Button
                                    onClick={handleBack}
                                    disabled={activeStep === 0}
                                    variant="secondary"
                                >
                                    Back
                                </Button>
                                {activeStep === steps.length - 1 ? (
                                    <Button
                                        onClick={clickSave}
                                        variant="primary"
                                    >
                                        Save
                                    </Button>
                                ) : (
                                    <Button
                                        onClick={handleNext}
                                        variant="primary"
                                    >
                                        Next
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>
                    <div className="d-none d-md-block ms-3">
                        {image && (
                            <Image id="preview" src={image} thumbnail />
                        )}
                    </div>
                </div>
            </div>
        </Container>
    );
};

const mapStateToProps = (state) => ({
    resume: state.resume.data,
    token: state.resume.token,
    image: state.resume.image,
});

export default connect(mapStateToProps)(Builder);
