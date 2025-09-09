#!/usr/bin/env node
/**
 * Excel to JSON Converter for ALP Learning Paths
 * 
 * This script converts the ALP_Learning_Paths_2024.xlsx file to a JSON structure
 * that can be imported and used in the React prototype.
 * 
 * USAGE:
 * 1. Install required dependencies:
 *    npm install xlsx
 * 
 * 2. Run the conversion:
 *    node src/data/convertExcelToJson.js
 * 
 * 3. The script will read ALP_Learning_Paths_2024.xlsx and generate courseData.js
 * 
 * EXPECTED EXCEL STRUCTURE:
 * - Sheet 1: Learning paths data with columns:
 *   - Column A: Learning Path Name
 *   - Column B: Category Name  
 *   - Column C: Course Name
 *   - Column D: Lesson Name

 * 
 * OUTPUT:
 * - Generates courseData.js with the learningPaths object
 * - Includes helper functions for data manipulation
 */

import XLSX from 'xlsx';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get current directory for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// File paths
const EXCEL_FILE = path.join(__dirname, 'ALP_Learning_Paths_2024.xlsx');
const OUTPUT_FILE = path.join(__dirname, 'courseData.js');

function convertExcelToJson() {
  try {
    console.log('Reading Excel file:', EXCEL_FILE);
    
    // Read the Excel file
    const workbook = XLSX.readFile(EXCEL_FILE);
    const sheetName = workbook.SheetNames[0]; // Use first sheet
    const worksheet = workbook.Sheets[sheetName];
    
    // Convert sheet to JSON
    const rawData = XLSX.utils.sheet_to_json(worksheet);
    
    console.log(`Found ${rawData.length} rows of data`);
    
    // Transform data into the required structure
    const learningPaths = {};
    
    // First pass: collect all data and group properly
    const tempData = {};
    let currentCourseName = null;
    let currentPath = null;
    let currentCategory = null;
    
    rawData.forEach(row => {
      // Expected columns (note: 'Category ' has a trailing space in the Excel):
      const learningPath = (row['Learning Path'] || '').trim();
      const category = (row['Category '] || row['Category'] || '').trim();
      const courseName = (row['Course Name'] || '').trim();
      const lessonName = (row['Lesson Name'] || '').trim();
      
      // Skip empty rows or rows without learning path and category
      if (!learningPath || !category) {
        return;
      }
      
      // Clean up learning path name (remove numbering like "1. ")
      const cleanLearningPath = learningPath.replace(/^\d+\.\s*/, '');
      
      // Initialize structure
      if (!tempData[cleanLearningPath]) {
        tempData[cleanLearningPath] = {};
      }
      if (!tempData[cleanLearningPath][category]) {
        tempData[cleanLearningPath][category] = {};
      }
      
      // If we have a course name, this is a new course
      if (courseName) {
        currentCourseName = courseName;
        currentPath = cleanLearningPath;
        currentCategory = category;
        
        // Initialize course if it doesn't exist
        if (!tempData[cleanLearningPath][category][courseName]) {
          tempData[cleanLearningPath][category][courseName] = [];
        }
        
        // Add the lesson to this course if it exists
        if (lessonName) {
          tempData[cleanLearningPath][category][courseName].push(lessonName);
        }
      } else if (lessonName && currentCourseName && 
                currentPath === cleanLearningPath && 
                currentCategory === category) {
        // No course name, but we have a lesson and we're in the same context
        // Add this lesson to the current course
        if (!tempData[cleanLearningPath][category][currentCourseName].includes(lessonName)) {
          tempData[cleanLearningPath][category][currentCourseName].push(lessonName);
        }
      }
    });
    
    // Second pass: convert to final structure
    Object.entries(tempData).forEach(([learningPath, categories]) => {
      learningPaths[learningPath] = {};
      
      Object.entries(categories).forEach(([categoryName, courses]) => {
        learningPaths[learningPath][categoryName] = {
          courses: [],
          level: "Intermediate"
        };
        
        Object.entries(courses).forEach(([courseName, lessons]) => {
          // All courses should have their lessons in the lessons array
          learningPaths[learningPath][categoryName].courses.push({
            name: courseName,
            lessons: lessons
          });
        });
      });
    });
    
    // Generate the JavaScript file content
    const jsContent = `// ALP Learning Paths 2024 - Complete Course Catalog
// Auto-generated from: ALP_Learning_Paths_2024.xlsx
// Generated on: ${new Date().toISOString()}

export const learningPaths = ${JSON.stringify(learningPaths, null, 2)};

// Helper function to get all courses count
export const getTotalCourses = () => {
  let total = 0;
  Object.values(learningPaths).forEach(path => {
    Object.values(path).forEach(category => {
      total += category.courses.length;
    });
  });
  return total;
};

// Helper function to get all lessons count
export const getTotalLessons = () => {
  let total = 0;
  Object.values(learningPaths).forEach(path => {
    Object.values(path).forEach(category => {
      category.courses.forEach(course => {
        if (typeof course === 'object' && course.lessons) {
          total += course.lessons.length;
        }
      });
    });
  });
  return total;
};

// Helper function to get courses by level
export const getCoursesByLevel = (level) => {
  const courses = [];
  Object.entries(learningPaths).forEach(([pathName, path]) => {
    Object.entries(path).forEach(([categoryName, category]) => {
      if (category.level === level) {
        courses.push({
          path: pathName,
          category: categoryName,
          ...category
        });
      }
    });
  });
  return courses;
};

// Helper function to get all learning path names
export const getLearningPathNames = () => {
  return Object.keys(learningPaths);
};

// Helper function to get categories for a specific learning path
export const getCategoriesForPath = (pathName) => {
  return learningPaths[pathName] || {};
};

// Statistics
export const courseStats = {
  totalLearningPaths: Object.keys(learningPaths).length,
  totalCategories: Object.values(learningPaths).reduce((sum, path) => sum + Object.keys(path).length, 0),
  totalCourses: getTotalCourses(),
  totalLessons: getTotalLessons(),
  generatedAt: '${new Date().toISOString()}'
};
`;
    
    // Write the JavaScript file
    fs.writeFileSync(OUTPUT_FILE, jsContent, 'utf8');
    
    console.log('✅ Conversion completed successfully!');
    console.log(`📁 Output file: ${OUTPUT_FILE}`);
    console.log(`📊 Statistics:`);
    console.log(`   - Learning Paths: ${Object.keys(learningPaths).length}`);
    console.log(`   - Categories: ${Object.values(learningPaths).reduce((sum, path) => sum + Object.keys(path).length, 0)}`);
    console.log(`   - Total Courses: ${Object.values(learningPaths).reduce((sum, path) => {
      return sum + Object.values(path).reduce((catSum, cat) => catSum + cat.courses.length, 0);
    }, 0)}`);
    console.log(`   - Total Lessons: ${Object.values(learningPaths).reduce((sum, path) => {
      return sum + Object.values(path).reduce((catSum, cat) => {
        return catSum + cat.courses.reduce((courseSum, course) => {
          return courseSum + course.lessons.length;
        }, 0);
      }, 0);
    }, 0)}`);
    
    // Debug: show first course structure
    const firstPath = Object.keys(learningPaths)[0];
    const firstCategory = Object.keys(learningPaths[firstPath])[0];
    console.log(`\nSample course structure:`);
    console.log(`${firstPath} > ${firstCategory}:`);
    learningPaths[firstPath][firstCategory].courses.slice(0, 2).forEach(course => {
      console.log(`  - ${course.name} (${course.lessons.length} lessons)`);
    });
    
  } catch (error) {
    console.error('❌ Error converting Excel to JSON:', error.message);
    
    if (error.code === 'ENOENT') {
      console.error(`📄 Make sure the Excel file exists: ${EXCEL_FILE}`);
      console.error('📄 Current directory contents:');
      console.log(fs.readdirSync(__dirname));
    }
    
    process.exit(1);
  }
}

// Run the conversion (always for now)
convertExcelToJson();

export { convertExcelToJson };