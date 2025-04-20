const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { Sequelize, DataTypes } = require('sequelize');
const cors = require('cors');
require('dotenv').config();
const multer = require('multer');
const csv = require('csv-parser');
const fs = require('fs');
const app = express();
const { Op } = require('sequelize');
app.use(cors());
app.use(express.json());

const sequelize = new Sequelize(process.env.DB_URL, {
    dialect: 'postgres',
});
const User = sequelize.define('User', {
  id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
  },
  name: {
      type: DataTypes.STRING,
      allowNull: false,
  },
  email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true, // Ensure this is set for unique emails
  },
  password: {
      type: DataTypes.STRING,
      allowNull: false,
  },
  role: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'student', // Set a default value if needed
  },
  enrollment: {
      type: DataTypes.STRING,
      allowNull: true, // Adjust based on your requirements
  }
});


const Attendance = sequelize.define('Attendance', {
  student_id: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  course_code: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  date: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  present: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  updatedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  }
}, {
  indexes: [
    {
      unique: true,
      fields: ['student_id', 'course_code', 'date']
    }
  ]
});

const CourseInformation = sequelize.define('CourseInformation', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true, // Automatically increment the ID
    primaryKey: true, // Set this field as the primary key
  },
  courseName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  courseCode: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true, // Ensure course codes are unique
  },
  semester: {
    type: DataTypes.STRING,
    allowNull: false,
  },
}, {
  timestamps: true, // Adds createdAt and updatedAt fields
});// Ensure the correct sequelize instance is used



const StudentInformation = sequelize.define('StudentInformation', {
    firstName: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    lastName: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    enrollment: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    semester: {
        type: DataTypes.STRING,
        allowNull: false,
    },
}, {
    tableName: 'StudentInformations', // Explicitly define the table name
    timestamps: true,
});
// Associations between models

// Defining associations for Sequelize models
StudentInformation.hasMany(Attendance, {
  foreignKey: 'student_id',
  sourceKey: 'enrollment',
  as: 'attendanceRecords'
});

Attendance.belongsTo(StudentInformation, {
  foreignKey: 'student_id',
  targetKey: 'enrollment',
  as: 'studentInfo'
});

// Attendance model does not need an explicit association with StudentInformation,
// because we are directly using enrollment (stored as student_id in Attendance).


sequelize.sync().then(() => {
    console.log('Database & tables created!');
});

// Configure Multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');  // Save files in 'uploads/' directory
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);  // Unique filename
    }
});

const upload = multer({ storage });

app.post('/api/signup', async (req, res) => {
  const { name,email, password, role, enrollment } = req.body;  // Added enrollment

  try {
      const hashedPassword = await bcrypt.hash(password, 10);

      const newUser = await User.create({
          name,
          email,
          password: hashedPassword,
          role,
          enrollment  // Now properly using enrollment
      });

      res.status(201).json({ message: 'User created successfully' });
  } catch (error) {
      console.error(error);
      if (error.name === 'SequelizeUniqueConstraintError') {
          return res.status(400).json({ error: 'Email already exists' });
      }
      res.status(500).json({ error: 'An error occurred' });
  }
});

// server/routes/courses.js
app.post('/api/manual-course', async (req, res) => {
  const { courseName, courseCode, semester } = req.body;
  console.log('Received course data:', { courseName, courseCode, semester });
  if (!courseName || !courseCode || !semester) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    await CourseInformation.create({
      courseName,
      courseCode,
      semester, 
    });
    res.status(201).json({ message: 'Course added successfully' });
  } catch (error) {
    console.error('Error adding course:', error);
    res.status(500).json({ message: 'Error adding course', error: error.message });
  }
});

app.post('/api/upload-courses', upload.single('file'), async (req, res) => {
  const { file } = req;
  const { semester } = req.body;

  if (!file) {
    console.error('No file uploaded');
    return res.status(400).json({ error: 'No file uploaded' });
  }

  const results = [];

  try {
    fs.createReadStream(file.path)
      .pipe(csv())
      .on('data', (data) => {
        // Assuming CSV columns: courseName, courseCode
        results.push({
          courseName: data.courseName,
          courseCode: data.courseCode,
          semester:data.semester, // Convert to integer
        });
      })
      .on('end', async () => {
        try {
          await CourseInformation.bulkCreate(results);
          fs.unlinkSync(file.path); // Remove the uploaded file after processing
          res.status(200).json({ message: 'Courses uploaded successfully' });
        } catch (error) {
          console.error('Error saving data:', error);
          res.status(500).json({ error: 'Error saving data' });
        }
      });
  } catch (error) {
    console.error('Error processing file:', error);
    res.status(500).json({ error: 'Error processing file' });
  }
});


app.post('/api/manual-entry', async (req, res) => {
    const { firstName, lastName, enrollment, semester } = req.body;

    try {
        const newStudent = await StudentInformation.create({
            firstName,
            lastName,
            enrollment,
            semester
        });

        res.status(201).json({ message: 'Student added successfully' });
    } catch (error) {
        console.error('Error adding student:', error);
        if (error.name === 'SequelizeUniqueConstraintError') {
            return res.status(400).json({ error: 'Enrollment number already exists' });
        }
        res.status(500).json({ error: 'An error occurred' });
    }
});

app.post('/api/upload', upload.single('file'), async (req, res) => {
    const { file } = req;
    const { semester } = req.body;

    if (!file) {
        console.error('No file uploaded');
        return res.status(400).json({ error: 'No file uploaded' });
    }

    const results = [];

    try {
        fs.createReadStream(file.path)
            .pipe(csv())
            .on('data', (data) => {
                // Assuming CSV columns: firstName, lastName, enrollment
                results.push({
                    firstName: data.firstName,
                    lastName: data.lastName,
                    enrollment: data.enrollment,
                    semester: semester,
                });
            })
            .on('end', async () => {
                try {
                    await StudentInformation.bulkCreate(results);
                    fs.unlinkSync(file.path); // Remove the uploaded file after processing
                    res.status(200).json({ message: 'File uploaded ' });
                } catch (error) {
                    console.error('Error saving data:', error);
                    res.status(500).json({ error: 'Error saving data' });
                }
            });
    } catch (error) {
        console.error('Error processing file:', error);
        res.status(500).json({ error: 'Error processing file' });
    }
});
app.delete('/api/delete-student', async (req, res) => {
    const { enrollment } = req.body;
  
    if (!enrollment) {
      return res.status(400).json({ message: 'Enrollment number is required' });
    }
  
    try {
      const result = await StudentInformation.destroy({
        where: { enrollment },
      });
  
      if (result === 0) {
        return res.status(404).json({ message: 'Student not found' });
      }
  
      res.status(200).json({ message: 'Student deleted successfully' });
    } catch (error) {
      console.error('Error deleting student:', error);
      res.status(500).json({ message: 'Error deleting student', error: error.message });
    }
  });
  
  app.get('/api/get-student', async (req, res) => {
    const { enrollmentNumber } = req.query;
  
    if (!enrollmentNumber) {
      return res.status(400).json({ message: 'Enrollment number is required' });
    }
  
    try {
      const student = await StudentInformation.findOne({ where: { enrollment: enrollmentNumber } });
      if (!student) {
        return res.status(404).json({ message: 'Student not found' });
      }
      res.status(200).json(student);
    } catch (error) {
      console.error('Error fetching student details:', error);
      res.status(500).json({ message: 'Error fetching student details', error: error.message });
    }
  });
  app.put('/api/update-student', async (req, res) => {
    const { enrollmentNumber, firstName, lastName, semester } = req.body;
  
    if (!enrollmentNumber) {
      return res.status(400).json({ message: 'Enrollment number is required' });
    }
  
    try {
      const [updated] = await StudentInformation.update({
        firstName,
        lastName,
        semester
      }, {
        where: { enrollment: enrollmentNumber }
      });
  
      if (updated) {
        res.status(200).json({ message: 'Student updated successfully' });
      } else {
        res.status(404).json({ message: 'Student not found' });
      }
    } catch (error) {
      console.error('Error updating student:', error);
      res.status(500).json({ message: 'Error updating student', error: error.message });
    }
  });
  app.get('/api/student/:enrollment', async (req, res) => {
    const { enrollment } = req.params;

    try {
        const student = await StudentInformation.findOne({ where: { enrollment } });

        if (!student) {
            return res.status(404).json({ error: 'Student record not found' });
        }

        res.status(200).json({ student });
    } catch (error) {
        console.error('Error fetching student information:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

  app.put('/api/update-course', async (req, res) => {
    const { courseCode, courseName, semester } = req.body;
  
    try {
      // Find the course by courseCode
      const course = await CourseInformation.findOne({ where: { courseCode } });
      if (!course) {
        return res.status(404).json({ message: 'Course not found' });
      }
  
      // Update course details
      await course.update({ courseName, semester });
  
      res.json({ message: 'Course updated successfully' });
    } catch (error) {
      console.error('Error updating course:', error);
      res.status(500).json({ message: 'Error updating course' });
    }
  });
  app.get('/api/course/:courseCode', async (req, res) => {
    const { courseCode } = req.params;
  
    try {
      // Find the course by courseCode
      const course = await CourseInformation.findOne({ where: { courseCode } });
      if (!course) {
        return res.status(404).json({ message: 'Course not found' });
      }
  
      res.json(course);
    } catch (error) {
      console.error('Error fetching course details:', error);
      res.status(500).json({ message: 'Error fetching course details' });
    }
  }); 
  app.get('/api/students', async (req, res) => {
    try {
      const students = await StudentInformation.findAll();
      res.json(students);
    } catch (error) {
      console.error('Error fetching students:', error);
      res.status(500).json({ message: 'Error fetching students' });
    }
  });
  app.get('/api/course-info', async (req, res) => {
    try {
      // Assuming CourseInformation is your model
      const courseInfos = await CourseInformation.findAll({
        attributes: ['courseCode', 'courseName','semester'] // Adjust attributes as needed
      });
      res.json(courseInfos);
    } catch (error) {
      console.error('Error fetching course information:', error);
      res.status(500).json({ message: 'Error fetching course information' });
    }
  });
  app.post('/api/attendance', async (req, res) => {
    try {
        const { student_id, course_code, date, present } = req.body;

        // Validate input data
        if (!student_id || !course_code || !date || present === undefined) {
            return res.status(400).send('Missing required fields.');
        }

        // Ensure date is in a valid format
        const parsedDate = new Date(date);
        if (isNaN(parsedDate.getTime())) {
            return res.status(400).send('Invalid date format.');
        }

        // Upsert the attendance record
        await Attendance.upsert({
            student_id,
            course_code,
            date: parsedDate,
            present,
        });

        res.status(200).send('Attendance record saved.');
    } catch (error) {
        console.error('Error saving attendance record:', error.message || error);
        res.status(500).send(`Error saving attendance record: ${error.message || error}`);
    }
});
const StudentMarks = sequelize.define('StudentMarks', {
  id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
  },
  studentId: {
      type: DataTypes.STRING,
      allowNull: false,
  },
  courseCode: {
      type: DataTypes.STRING,
      allowNull: false,
      references: {
          model: 'CourseInformations', // Ensure this matches your CourseInformation table name
          key: 'courseCode',
      },
  },
  examType: {
      type: DataTypes.STRING,
      allowNull: false,
  },
  marks: {
      type: DataTypes.JSONB,
      allowNull: false,
  },
}, {
  timestamps: true,
}); // Ensure this matches your setup

const CoPoMapping = sequelize.define('CoPoMapping', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    courseCode: {
        type: DataTypes.STRING,
        allowNull: false,
        references: {
            model: 'CourseInformations', // Ensure this matches your CourseInformation table name
            key: 'courseCode',
        },
    },
    co_po_data: {
        type: DataTypes.JSONB, // Stores CO-PO mapping as JSON
        allowNull: false,
    },
}, {
    timestamps: true,
});

module.exports = CoPoMapping;

app.post('/api/save-marks', async (req, res) => {
  try {
      const { marksData, courseId, examType } = req.body;

      if (!Array.isArray(marksData) || !courseId || !examType) {
          return res.status(400).json({ error: 'Invalid data' });
      }

      // Start a transaction
      const transaction = await sequelize.transaction();

      try {
          // Iterate over marksData and save each entry
          for (const { studentId, marks } of marksData) {
              await StudentMarks.create({
                  studentId,
                  courseCode: courseId,
                  examType,
                  marks
              }, { transaction });
          }

          // Commit the transaction
          await transaction.commit();

          res.status(200).json({ message: 'Marks saved successfully' });
      } catch (error) {
          // Rollback the transaction in case of error
          await transaction.rollback();
          console.error('Error saving marks:', error);
          res.status(500).json({ error: 'Error saving marks' });
      }
  } catch (error) {
      console.error('Error in /api/save-marks:', error);
      res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/api/question-attempts', async (req, res) => {
  try {
      const attempts = await StudentMarks.findAll({
          attributes: [
              [sequelize.fn('jsonb_array_length', sequelize.col('marks')), 'attemptsCount']
          ]
      });

      res.status(200).json(attempts);
  } catch (error) {
      console.error('Error fetching attempts:', error);
      res.status(500).json({ error: 'Error fetching attempts' });
  }
});

app.get('/marks', async (req, res) => {
  const { semester, courseCode, examType } = req.query;

  try {
    const students = await StudentInformation.findAll({
      include: {
        model: StudentMarks,
        where: { examType },
        required: false,
      },
      where: { semester },
    });

    res.json(students);
  } catch (error) {
    console.error('Error fetching student marks:', error);
    res.status(500).json({ error: 'Failed to fetch student marks' });
  }
});

app.get('/api/attendance/count', async (req, res) => {
  const { student_id, course_code } = req.query;

  if (!student_id || !course_code) {
    return res.status(400).json({ error: 'Missing student_id or course_code' });
  }

  try {
    const attendanceCount = await Attendance.findOne({
      attributes: [
        [Sequelize.fn('COUNT', Sequelize.literal(`CASE WHEN present = true THEN 1 END`)), 'present'],
        [Sequelize.fn('COUNT', Sequelize.literal(`CASE WHEN present = false THEN 1 END`)), 'absent']
      ],
      where: {
        student_id,
        course_code
      }
    });

    if (!attendanceCount) {
      return res.status(404).json({ error: 'Attendance not found' });
    }

    res.json({
      present: attendanceCount.get('present') || 0,
      absent: attendanceCount.get('absent') || 0
    });
  } catch (error) {
    console.error('Error fetching attendance count:', error);
    res.status(500).json({ error: 'Failed to fetch attendance count' });
  }
});

// In your attendance controller (Node.js/Express)

// User login route
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    // Find the user by email
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Compare the passwords
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Fetch student's enrollment from user info
    const enrollment = user.enrollment;
    
    // Fetch attendance based on enrollment (student_id in Attendance)
    const attendanceRecords = await Attendance.findAll({
      where: { student_id: enrollment }
    });

    // Sending back the user info, role, enrollment, and attendance records
    res.status(200).json({
      token: 'your_jwt_token', 
      // Assuming you're sending a token
      role: user.role,         // Include the role from the user table
      enrollment,              // Include enrollment as well
      attendance: attendanceRecords
    });
  } catch (error) {
    console.error('Error logging in:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Attendance Model
Attendance.belongsTo(CourseInformation, { foreignKey: 'course_code', targetKey: 'courseCode', as: 'course' });

// CourseInformation Model
CourseInformation.hasMany(Attendance, { foreignKey: 'course_code', sourceKey: 'courseCode' });
// Assuming you have a 'Teacher' and 'CourseInformation' model


app.get('/api/attendance/:studentId', async (req, res) => {
  const { studentId } = req.params;  // Corrected to studentId

  try {
      const attendanceRecords = await Attendance.findAll({
          where: { student_id: studentId },  // Use studentId here
          include: [{
              model: CourseInformation,
              as: 'course',  // alias for the relation
              attributes: ['courseName'], // Only get the course name
          }]
      });

      res.json(attendanceRecords);
  } catch (error) {
      console.error('Error fetching attendance:', error);
      res.status(500).json({ error: 'Internal server error' });
  }
});


app.get('/api/marks/:enrollment', async (req, res) => {
  const { enrollment } = req.params;
  
  try {
      // Fetch the student marks based on enrollment
      const marksRecords = await StudentMarks.findAll({
          where: {studentId: enrollment}, // Assuming "enrollment" is the column name in your StudentMarks table
          attributes: ['courseCode', 'examType', 'marks'], // Fetch only the relevant fields
      });

      if (marksRecords.length === 0) {
          return res.status(404).json({ message: 'No marks found for this student.' });
      }

      // Send back the records in JSON format
      res.json(marksRecords);
  } catch (error) {
      console.error('Error fetching student marks:', error);
      res.status(500).json({ message: 'Server error, please try again later.' });
  }
});


// In your models (assuming the relationship is courseCode)
Attendance.belongsTo(CourseInformation, { foreignKey: 'course_code', targetKey: 'courseCode' });
CourseInformation.hasMany(Attendance, { foreignKey: 'course_code', sourceKey: 'courseCode' });
app.get('/api/record', async (req, res) => {
  const { fromDate, toDate, courseCode, semester } = req.query;

  // Input validation (basic check)
  if (!fromDate || !toDate || !semester) {
      return res.status(400).json({ error: 'fromDate, toDate, and semester are required' });
  }

  try {
      // Fetch attendance records for a specific course or all courses
      const attendanceRecords = await Attendance.findAll({
          where: {
              date: {
                  [Op.between]: [new Date(fromDate), new Date(toDate)],
              },
          },
          include: [
              {
                  model: CourseInformation,
                  where: {
                      ...(courseCode ? { courseCode: courseCode } : {}), // Apply courseCode filter only if it exists
                      semester: semester,
                  },
                  attributes: ['courseCode', 'semester'],
              }
          ],
      });

      res.json(attendanceRecords);
  } catch (error) {
      console.error('Error fetching attendance records:', error.message);
      console.error(error.stack);
      res.status(500).json({ error: 'Error fetching attendance records' });
  }
});





//models/Teacher.js
const Teacher = sequelize.define('Teacher', {
  id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
  },
  userId: {
      type: DataTypes.STRING,
      allowNull: false, // References User model's id
  },
  name: {
      type: DataTypes.STRING,
      allowNull: false,
  },
  email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique:false,
  },
  semester: {
    type: DataTypes.STRING,
    allowNull: false,
 },
  courseCode: {
      type: DataTypes.STRING,
      allowNull: false,
  },
});


// GET user-info endpoint using URL parameters
// GET user-info endpoint using URL parameters
app.get('/api/user-info/:enrollment', async (req, res) => {
  const { enrollment } = req.params; // Get enrollment from route parameters

  try {
      // Find user by enrollment
      const user = await User.findOne({ where: { enrollment } });

      if (!user) {
          return res.status(404).json({ message: 'User not found' });
      }

      res.status(200).json(user);
  } catch (error) {
      console.error('Error fetching user info:', error);
      res.status(500).json({ message: 'An error occurred while fetching user info.' });
  }
});

app.post('/api/teacher/courses', async (req, res) => {
   console.log('Received request body:', req.body); // Add this line
    
  const { teacherId, name, email, courseIds, semester } = req.body;

  // Debug: Log incoming request
  console.log('Received request body:', req.body);

  try {
      if (!Array.isArray(courseIds) || courseIds.length === 0) {
          return res.status(400).json({ message: 'No courses selected.' });
      }

      // Loop through the selected courses and create teacher entries
      const teacherEntries = courseIds.map(courseId => ({
          userId: teacherId,
          name: name,
          email: email,
          courseCode: courseId,
          semester: semester
      }));

      // Check for existing entries to avoid duplicates
      for (const entry of teacherEntries) {
          const existingTeacher = await Teacher.findOne({
              where: { email: entry.email, courseCode: entry.courseCode }
          });
          if (!existingTeacher) {
              await Teacher.create(entry);
          }
      }

      res.status(200).json({ message: 'Courses assigned successfully!' });
  } catch (error) {
      // Log detailed error information
      console.error('Error assigning courses:', error);
      res.status(500).json({ message: 'An error occurred while assigning courses.' });
  }
});
app.get('/api/teacher-courses/:enrollment', async (req, res) => {
  const { enrollment } = req.params;
  
  try {
      // Fetch the courses taught by the teacher based on their enrollment ID
      const teacherCourses = await Teacher.findAll({
          where: { userId:enrollment }, // Adjust according to your actual column name
          attributes: ['courseCode', 'semester'], // Assuming these fields exist
      });

      res.status(200).json(teacherCourses);
  } catch (error) {
      console.error('Error fetching teacher courses:', error);
      res.status(500).json({ message: 'Error fetching courses' });
  }
});
app.get('/api/exam-attempts', async (req, res) => {
  const { courseCode, examType } = req.query;

  if (!courseCode || !examType) {
      return res.status(400).json({ error: 'Missing courseCode or examType' });
  }

  try {
      const attemptsCount = await StudentMarks.count({
          where: {
              courseCode,
              examType,
              marks: { [Op.ne]: null }, // Count only non-null marks (attempted questions)
          },
      });

      res.json({ attempts: attemptsCount });
  } catch (error) {
      console.error('Error fetching exam attempts:', error);
      res.status(500).json({ error: 'Internal server error' });
  }
});


Teacher.belongsTo(CourseInformation, { foreignKey: 'courseCode', targetKey: 'courseCode' });
CourseInformation.hasMany(Teacher, { foreignKey: 'courseCode', sourceKey: 'courseCode' });



app.get("/api/course-name/:courseCode", async (req, res) => {
    const { courseCode } = req.params;

    try {
        const course = await CourseInformation.findOne({
            where: {
                courseCode: { [Op.iLike]: courseCode }, // Case-insensitive search
            },
        });

        if (!course) {
            return res.status(404).json({ message: "Course not found" });
        }

        res.status(200).json({ courseName: course.courseName });
    } catch (error) {
        console.error("Error fetching course name:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

app.get('/api/student-marks/:courseCode/:examType', async (req, res) => {
  try {
    const { courseCode, examType } = req.params;
    const marks = await StudentMarks.findAll({
      where: { courseCode, examType },
    });
    res.json(marks);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching marks' });
  }
});





const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
