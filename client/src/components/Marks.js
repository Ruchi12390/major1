import React, { useState, useEffect } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import { connect } from 'react-redux';
import { setPersonalDetails } from '../redux/actionCreators';
import MarksForm from '../components/forms/MarksForm';
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
const Marks = (props) => {
    const [showMarksForm, setShowMarksForm] = useState(false);
    const [numQuestions, setNumQuestions] = useState(0);
    const [numCOs, setNumCOs] = useState(5); // Default CO count
    const [students, setStudents] = useState([]);
    const [courses, setCourses] = useState([]);
    const [selectedCourseCode, setSelectedCourseCode] = useState('');
    const [totalStudents, setTotalStudents] = useState(0);

    const [selectedSemester, setSelectedSemester] = useState('');
    const [selectedType, setSelectedType] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [attemptedCount, setAttemptedCount] = useState({});
    const [coValues, setCoValues] = useState({}); 
    const [computedTable, setComputedTable] = useState({});
    const [numPOs, setNumPOs] = useState(0);
    const [coPoValues, setCoPoValues] = useState({});
    const [computedAverages, setComputedAverages] = useState({});
    const [targetRow, setTargetRow] = useState({});
    const [coAttemptCount, setCoAttemptCount] = useState({});
    const [courseNames, setCourseNames] = useState({});
    const [coAverageAttempt, setCoAverageAttempt] = useState({});
    useEffect(() => {
        const fetchCourses = async () => {
            const enrollment = localStorage.getItem("enrollment");
            if (!enrollment) return;

            try {
                const response = await axios.get(
                    `${process.env.REACT_APP_API_URL}/api/teacher-courses/${enrollment}`
                );
                setCourses(response.data);

                // Fetch course names for each courseCode
                const names = {};
                for (const course of response.data) {
                    names[course.courseCode] = await fetchCourseName(course.courseCode);
                }
                setCourseNames(names);
            } catch (error) {
                console.error("Error fetching courses:", error);
                setError("Error fetching courses");
            } finally {
                setLoading(false);
            }
        };

        fetchCourses();
    }, []);

    // Function to fetch course name
    const fetchCourseName = async (courseCode) => {
        try {
            const response = await axios.get(
                `${process.env.REACT_APP_API_URL}/api/course-name/${courseCode}`
            );
            return response.data.courseName;
        } catch (error) {
            console.error("Error fetching course name:", error);
            return "Unknown Course";
        }
    };

    useEffect(() => {
        const fetchStudents = async () => {
            if (selectedSemester && selectedCourseCode && selectedType) {
                try {
                    const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/students`, {
                        params: {
                            semester: selectedSemester,
                            courseCode: selectedCourseCode,
                            examType: selectedType
                        }
                    });
                    const filteredStudents = response.data.filter(student => student.semester === selectedSemester);
                    setStudents(filteredStudents);                   
                     setTotalStudents(filteredStudents.length);
                    calculateAttemptedCount(filteredStudents);
                } catch (error) {
                    console.error('Error fetching students:', error);
                }
            }
        };

        fetchStudents();
    }, [selectedSemester, selectedCourseCode, selectedType]);

    const handleCourseClick = (courseCode, semester) => {
        setSelectedCourseCode(courseCode);
        setSelectedSemester(semester);
        setShowMarksForm(false);
    };

    const handleShowClick = () => {
        if (selectedCourseCode && selectedSemester && selectedType) {
            setShowMarksForm(true);
        } else {
            alert('Please select a course, semester, and exam type.');
        }
    };
    
    
    
    const calculateAttemptedCount = (studentsList) => {
        const count = {};
        studentsList.forEach(student => {
            (student.marks || []).forEach((mark, index) => {
                if (mark !== null && mark !== '') {
                    count[`Q${index + 1}`] = (count[`Q${index + 1}`] || 0) + 1;
                }
            });
        });
        setAttemptedCount(count);
    };
    
    const handleCOValueChange = (coIndex, qIndex, value) => {
        setCoValues(prev => ({
            ...prev,
            [`CO${coIndex}`]: {
                ...prev[`CO${coIndex}`],
                [`Q${qIndex}`]: value
            }
        }));
    };
    
    const handleMarksChange = (id, questionIndex, marks) => {
        const updatedStudents = students.map(student =>
            student.id === id
                ? {
                      ...student,
                      marks: student.marks.map((m, i) => (i === questionIndex ? marks : m)),
                  }
                : student
        );
        setStudents(updatedStudents);
        calculateAttemptedCount(updatedStudents);
    };

    const handleTypeChange = (event) => {
        setSelectedType(event.target.value);
    };

    const handleNumQuestionsChange = (event) => {
        const value = parseInt(event.target.value) || 0;
        setNumQuestions(value);

        const updatedStudents = students.map((student) => {
            const currentMarks = student.marks || [];
            const updatedMarks = currentMarks.length >= value
                ? currentMarks.slice(0, value)
                : [...currentMarks, ...Array(value - currentMarks.length).fill('')];
            return { ...student, marks: updatedMarks };
        });

        setStudents(updatedStudents);
        calculateAttemptedCount(updatedStudents);
    };
    const handleInputChange = (coIndex, poIndex, value) => {
        const newValues = { ...coPoValues };
        if (!newValues[`CO${coIndex}`]) {
            newValues[`CO${coIndex}`] = {};
        }
        newValues[`CO${coIndex}`][`PO${poIndex}`] = value ? parseFloat(value) : 0;
        setCoPoValues(newValues);
        calculateAverages(newValues);
    };

    // Calculate averages for each CO and target row
    const calculateAverages = (values) => {
        const newAverages = {};
        const columnSums = {};
        const columnCounts = {};
        const target = {};

        Object.keys(values).forEach(coKey => {
            let sum = 0;
            let count = 0;

            for (let poIndex = 1; poIndex <= numPOs; poIndex++) {
                const value = values[coKey][`PO${poIndex}`] || 0;
                sum += value;
                count += value > 0 ? 1 : 0;

                columnSums[`PO${poIndex}`] = (columnSums[`PO${poIndex}`] || 0) + value;
                columnCounts[`PO${poIndex}`] = (columnCounts[`PO${poIndex}`] || 0) + (value > 0 ? 1 : 0);
            }

            newAverages[coKey] = count > 0 ? (sum / count).toFixed(3) : 0;
        });

        // Calculate target row (column-wise averages)
        for (let poIndex = 1; poIndex <= numPOs; poIndex++) {
            target[`PO${poIndex}`] = columnCounts[`PO${poIndex}`] > 0
                ? (columnSums[`PO${poIndex}`] / columnCounts[`PO${poIndex}`]).toFixed(3)
                : 0;
        }

        setComputedAverages(newAverages);
        setTargetRow(target);
    };
    


    
    const handleDownloadExcel = () => {
        const workbook = XLSX.utils.book_new();
    
        // Function to clean sheet names
        const cleanSheetName = (name) => name.replace(/[:\\/?*\[\]]/g, "").substring(0, 31); // Max length 31 chars
    
        // Extract data from Course Outcomes Table
        const coTable = document.getElementById('course-outcomes-table');
        const coSheet = XLSX.utils.table_to_sheet(coTable);
        XLSX.utils.book_append_sheet(workbook, coSheet, cleanSheetName("Course Outcomes"));
    
        // Extract data from Computed Table
        const computedTable = document.getElementById('computed-table');
        const computedSheet = XLSX.utils.table_to_sheet(computedTable);
        XLSX.utils.book_append_sheet(workbook, computedSheet, cleanSheetName("Computed CO Students"));
    
        // Extract data from Average Attempt Table
        const avgTable = document.getElementById('average-attempts-table');
        const avgSheet = XLSX.utils.table_to_sheet(avgTable);
        XLSX.utils.book_append_sheet(workbook, avgSheet, cleanSheetName("CO Wise Avg Attempts"));
    
        // Extract data from CO-PO Mapping Table
        const coPoTable = document.getElementById('co-po-mapping-table');
        const coPoSheet = XLSX.utils.table_to_sheet(coPoTable);
        XLSX.utils.book_append_sheet(workbook, coPoSheet, cleanSheetName("CO PO Mapping"));
    
        // Extract data from CO Attempt Ratios Table
        const coAttemptRatiosTable = document.getElementById('co-attempt-ratios');
        const coAttemptRatiosSheet = XLSX.utils.table_to_sheet(coAttemptRatiosTable);
        XLSX.utils.book_append_sheet(workbook, coAttemptRatiosSheet, cleanSheetName("CO Attempt Ratios"));
    
        // Extract data from Computed CO-PO Table
        const computedCoPoTable = document.getElementById('computed-co-po-table');
        const computedCoPoSheet = XLSX.utils.table_to_sheet(computedCoPoTable);
        XLSX.utils.book_append_sheet(workbook, computedCoPoSheet, cleanSheetName("Computed CO PO"));
    
        // Convert workbook to a file and save it
        const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
        const data = new Blob([excelBuffer], { type: "application/octet-stream" });
        saveAs(data, "CO_PO_Mapping.xlsx");
    };
    


    const computeCOPercentage = () => {
        const coAttemptedCounts = {};
        let totalCOs = 0;
        let totalAchieved = 0;
    
        Object.keys(coValues).forEach(coKey => {
            const questions = Object.keys(coValues[coKey]);
            let sumAttempts = 0;
    
            questions.forEach(qKey => {
                const count = attemptedCount[qKey] || 0;
                sumAttempts += count;
            });
    
            const numQuestions = questions.length;
            
            // Step 1: Average attempts per question
            const avgAttemptsPerQuestion = numQuestions > 0 ? sumAttempts / numQuestions : 0;
            
            // Step 2: Round to nearest whole number
            const roundedAttempts = Math.round(avgAttemptsPerQuestion);
            
            // Step 3: Divide by total students
            const coRatio = totalStudents > 0 ? (roundedAttempts / totalStudents).toFixed(3) : "0";
            
            coAttemptedCounts[coKey] = parseFloat(coRatio);
    
            totalAchieved += parseFloat(coRatio);
            totalCOs++;
        });
    
        const achievedValue = totalCOs > 0 ? (totalAchieved / totalCOs).toFixed(3) : "0";
        return { coAttemptedCounts, achievedValue };
    };
    
    
    
    // Compute CO-wise ratios and overall achievement
    const { coAttemptedCounts, achievedValue } = computeCOPercentage();
    // Declare targetRow outside to prevent redeclaration
    
    
    const computeCoPoTable = () => {
        let computedCoPo = {}; // Stores computed CO-PO values
        let poSums = new Array(numPOs).fill(0); // Ensures all PO columns start at 0
        let coAverages = {}; // Stores CO-wise averages
        let totalCOs = Object.keys(coPoValues).length;
        
        let poTargetValues = {}; // Stores PO target values
    
        Object.keys(coPoValues).forEach(coKey => {
            let rowTotal = 0;
            computedCoPo[coKey] = {};
    
            Object.keys(coPoValues[coKey]).forEach(poKey => {
                if (!coPoValues[coKey].hasOwnProperty(poKey)) return; // ✅ Ignore undefined PO values
    
                let coValue = coAttemptedCounts[coKey] || 0; // Get CO Ratio
                let poWeight = parseFloat(coPoValues[coKey][poKey] || 0); // Get CO-PO Weight
    
                // ✅ Skip calculation if no PO weight exists
                if (!poWeight || isNaN(poWeight)) {
                    computedCoPo[coKey][poKey] = 0;
                    return;
                }
    
                let computedValue = (coValue * poWeight).toFixed(9);
                computedCoPo[coKey][poKey] = parseFloat(computedValue);
                rowTotal += parseFloat(computedValue);
    
                // ✅ Fix indexing for PO sums
                let poIndex = parseInt(poKey.replace("PO", ""), 10) - 1;
                if (!isNaN(poIndex) && poIndex >= 0 && poIndex < numPOs) {
                    poSums[poIndex] += parseFloat(computedValue);
                }
            });
    
            coAverages[coKey] = (rowTotal / numPOs).toFixed(9);
        });
    
        // Compute PO Target row (Average of each PO column)
        poSums.forEach((sum, index) => {
            poTargetValues[`PO${index + 1}`] = (sum / totalCOs).toFixed(9);
        });
    
        return { computedCoPo, coAverages, poTargetValues };
    };
    
    
    
    
    
    // Compute CO-PO matrix
    const { computedCoPo, coAverages, poTargetValues } = computeCoPoTable();
    
    useEffect(() => {
        const computed = {};
        const coAttempt = {};  // Stores total students attempted per CO
        const coQuestionCount = {}; // Stores number of questions mapped to each CO

        for (let coIndex = 1; coIndex <= numCOs; coIndex++) {
            const coKey = `CO${coIndex}`;
            computed[coKey] = {};
            coAttempt[coKey] = 0;  // Initialize total attempts
            coQuestionCount[coKey] = 0; // Initialize question count for averaging

            for (let qIndex = 1; qIndex <= numQuestions; qIndex++) {
                const qKey = `Q${qIndex}`;
                const coValue = parseInt(coValues[coKey]?.[qKey] || 0, 10);
                const studentsAttempted = parseInt(attemptedCount[qKey] || 0, 10);

                computed[coKey][qKey] = coValue * studentsAttempted;

                // If this question belongs to this CO, update student attempts & question count
                if (coValue > 0) {
                    coAttempt[coKey] += studentsAttempted;
                    coQuestionCount[coKey] += 1;
                }
            }
        }

        // Compute average attempts per CO
        const coAverage = {};
        Object.keys(coAttempt).forEach((coKey) => {
            coAverage[coKey] = coQuestionCount[coKey] > 0 
                ? (coAttempt[coKey] / coQuestionCount[coKey]).toFixed(2) // Average with 2 decimal places
                : 0;
        });

        setComputedTable(computed);
        setCoAttemptCount(coAttempt);
        setCoAverageAttempt(coAverage);
    }, [coValues, attemptedCount, numCOs, numQuestions]);
    if (loading) return <p>Loading...</p>;
    if (error) return <p>{error}</p>;

    return (
        <div className="container mt-4" style={{ maxWidth: '1200px', marginTop: '20px', padding: '20px' }}>
            <h6>Department of Computer Engineering</h6>
            <hr className="my-4" style={{ height: '10px', backgroundColor: '#007bff', opacity: '0.75' }} />
            <div className="row">
                <div className="col-md-12">
                    <div className="mb-3">
                        <label className="form-label">Courses</label>
                        <ul className="list-group">
            {courses.map((course) => (
                <li
                    key={course.courseCode}
                    className={`list-group-item ${course.courseCode === selectedCourseCode ? "active" : ""}`}
                    onClick={() => handleCourseClick(course.courseCode, course.semester)}
                    style={{ cursor: "pointer" }}
                >
                    {courseNames[course.courseCode] || "Loading..."} ({course.courseCode}) (Semester: {course.semester})
                </li>
            ))}
        </ul>
                    </div>
                    <div className="mb-3">
                        <label htmlFor="examType" className="form-label">Select Exam Type</label>
                        <select id="examType" name="examType" value={selectedType} onChange={handleTypeChange} className="form-select">
                            <option value="" disabled>Select Exam Type</option>
                            <option value="mst1">MST1</option>
                            <option value="mst2">MST2</option>
                            <option value="mst3">MST3</option>
                            <option value="end-sem">End-Sem</option>
                        </select>
                    </div>
                    <div className="mb-3">
                        <label htmlFor="numQuestions" className="form-label">Number of Questions</label>
                        <input type="number" className="form-control" id="numQuestions" value={numQuestions} onChange={handleNumQuestionsChange} />
                    </div>
                    <button className="btn btn-primary" onClick={handleShowClick}>Show</button>
                </div>
            </div>
            {showMarksForm && (
                <div>
                    <MarksForm students={students} onMarksChange={handleMarksChange} numQuestions={numQuestions} selectedCourseCode={selectedCourseCode} selectedType={selectedType} />
                    <h5>Number of Students Attempted Each Question:</h5>
                    {Array.from({ length: numQuestions }).map((_, index) => (
                        <p key={index}>Q{index + 1}: {attemptedCount[`Q${index + 1}`] || 0} students</p>
                    ))}
                </div>
            )}
            <div className="mb-3">
    <label htmlFor="numCOs" className="form-label">Number of Course Outcomes (COs)</label>
    <input 
        type="number" 
        className="form-control" 
        id="numCOs" 
        value={numCOs} 
        onChange={(e) => setNumCOs(parseInt(e.target.value) || 0)} 
    />
</div>

<h5>Course Outcomes Table</h5>
<table id='course-outcomes-table' className="table table-bordered" >
    <thead>
        <tr>
            <th>CO \ Q</th>
            {Array.from({ length: numQuestions }).map((_, index) => (
                <th key={index}>Q{index + 1}</th>
            ))}
        </tr>
    </thead>
    <tbody>
    {Array.from({ length: numCOs }).map((_, coIndex) => (
        <tr key={coIndex}>
            <td>CO{coIndex + 1}</td>
            {Array.from({ length: numQuestions }).map((_, qIndex) => (
                <td key={qIndex}>
                    <input
                        type="number"
                        className="form-control"
                        value={coValues[`CO${coIndex + 1}`]?.[`Q${qIndex + 1}`] || ''}
                        onChange={(e) => handleCOValueChange(coIndex + 1, qIndex + 1, e.target.value)}
                    />
                </td>
            ))}
        </tr>
    ))}
</tbody>

</table >

            <h5>Computed Table (CO * Students Attempted)</h5>
            <table id='computed-table' className="table table-bordered">
                <thead>
                    <tr>
                        <th>CO \ Q</th>
                        {Array.from({ length: numQuestions }).map((_, index) => (
                            <th key={index}>Q{index + 1}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {Array.from({ length: numCOs }).map((_, coIndex) => (
                        <tr key={coIndex}>
                            <td>CO{coIndex + 1}</td>
                            {Array.from({ length: numQuestions }).map((_, qIndex) => (
                                <td key={qIndex}>{computedTable[`CO${coIndex + 1}`]?.[`Q${qIndex + 1}`] || 0}</td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* Second Table: Total Students Attempted per CO */}
            
            <h5>CO-wise Average Student Attempts</h5>
            <table id='average-attempts-table' className="table table-bordered">
                <thead>
                    <tr>
                        <th>CO</th>
                        <th>Average No. of Students Attempted</th>
                    </tr>
                </thead>
                <tbody>
                    {Object.keys(coAverageAttempt).map((coKey) => (
                        <tr key={coKey}>
                            <td>{coKey}</td>
                            <td>{Math.round(coAverageAttempt[coKey])}</td>

                        </tr>
                    ))}
                </tbody>
            </table>
            <div className="container mt-4">
            <h3>CO-PO Mapping Table</h3>

            {/* Input for Number of POs */}
            <div className="mb-3">
                <label className="form-label">Number of Program Outcomes (POs)</label>
                <input
                    type="number"
                    className="form-control"
                    value={numPOs}
                    onChange={(e) => setNumPOs(Math.max(0, parseInt(e.target.value) || 0))}
                />
            </div>

            

            {/* Table */}
            <h5>CO-PO Mapping Table</h5>
            <table id='co-po-mapping-table' className="table table-bordered">
                <thead>
                    <tr>
                        <th>CO \ PO</th>
                        {Array.from({ length: numPOs }).map((_, poIndex) => (
                            <th key={poIndex}>PO{poIndex + 1}</th>
                        ))}
                        <th>Average</th>
                    </tr>
                </thead>
                <tbody>
                    {Array.from({ length: numCOs }).map((_, coIndex) => (
                        <tr key={coIndex}>
                            <td>CO{coIndex + 1}</td>
                            {Array.from({ length: numPOs }).map((_, poIndex) => (
                                <td key={poIndex}>
                                    <input
                                        type="number"
                                        className="form-control"
                                        value={coPoValues[`CO${coIndex + 1}`]?.[`PO${poIndex + 1}`] || ""}
                                        onChange={(e) =>
                                            handleInputChange(coIndex + 1, poIndex + 1, e.target.value)
                                        }
                                    />
                                </td>
                            ))}
                            <td>{computedAverages[`CO${coIndex + 1}`] || 0}</td>
                        </tr>
                    ))}
                    {/* Target Row */}
                    <tr>
                        <td><strong>Target</strong></td>
                        {Array.from({ length: numPOs }).map((_, poIndex) => (
                            <td key={poIndex}><strong>{targetRow[`PO${poIndex + 1}`] || 0}</strong></td>
                        ))}
                        <td></td>
                    </tr>
                </tbody>
            </table>
        </div>
        <h5>CO Attempt Ratios</h5>
<table id="co-attempt-ratios" className="table table-bordered">
    <thead>
        <tr>
            <th>CO</th>
            <th>Ratio</th>
        </tr>
    </thead>
    <tbody>
        {Object.keys(coAttemptedCounts).map(coKey => (
            <tr key={coKey}>
                <td>{coKey}</td>
                <td>{coAttemptedCounts[coKey]}</td>
            </tr>
        ))}
        {/* Achieved Row */}
        <tr>
            <td><strong>Achieved</strong></td>
            <td><strong>{achievedValue}</strong></td>
        </tr>
    </tbody>
</table>
<h5>Computed CO-PO Table</h5>
<table id="computed-co-po-table" className="table table-bordered">
    <thead>
        <tr>
            <th>CO \ PO</th>
            {Array.from({ length: numPOs }).map((_, poIndex) => (
                <th key={poIndex}>PO{poIndex + 1}</th>
            ))}
            <th>Average</th> {/* ✅ Ensures "Average" is added only once */}
        </tr>
    </thead>
    <tbody>
        {Object.keys(computedCoPo).map(coKey => (
            <tr key={coKey}>
                <td>{coKey}</td>
                {/* ✅ Maps only the required PO values dynamically */}
                {Array.from({ length: numPOs }).map((_, poIndex) => {
                    const poKey = `PO${poIndex + 1}`;
                    return <td key={poKey}>{computedCoPo[coKey][poKey] || 0}</td>;
                })}
                <td>{coAverages[coKey]}</td> {/* ✅ Adds "Average" correctly */}
            </tr>
        ))}
        
        {/* ✅ Target Row (Ensures correct PO mapping) */}
        <tr>
            <td><strong>Target</strong></td>
            {Array.from({ length: numPOs }).map((_, poIndex) => {
                const poKey = `PO${poIndex + 1}`;
                return <td key={poKey}><strong>{poTargetValues[poKey]}</strong></td>;
            })}
            <td></td> {/* ✅ Prevents extra column issues */}
        </tr>
    </tbody>
</table>
<button className="btn btn-success" onClick={handleDownloadExcel}>Download Excel</button>





        </div>
    );
};

export default connect(state => ({ resume: state.resume.data }), { setPersonalDetails })(Marks);