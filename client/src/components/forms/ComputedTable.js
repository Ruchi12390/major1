import React, { useEffect, useState } from "react";
import axios from "axios";
import Table from "react-bootstrap/Table";

const ComputedTable = () => {
  const [data, setData] = useState([]);
  const [questions, setQuestions] = useState([]);

  useEffect(() => {
    axios.get("http://localhost:5000/api/computed-table")
      .then(response => {
        if (response.data.success && response.data.data.length > 0) {
          setData(response.data.data);

          // Extract dynamic question headers (assuming all rows have same question keys)
          const questionKeys = Object.keys(response.data.data[0]).filter(key => key.startsWith("Q"));
          setQuestions(questionKeys);
        }
      })
      .catch(error => console.error("Error fetching computed table:", error));
  }, []);

  return (
    <div className="container mt-4">
      <h3>Computed Table (CO * Students Attempted)</h3>
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>CO \ Q</th>
            {questions.map((q, index) => (
              <th key={index}>{q}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, index) => (
            <tr key={index}>
              <td>CO{row.co_id}</td>
              {questions.map((q, idx) => (
                <td key={idx}>{row[q]}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
};

export default ComputedTable;
