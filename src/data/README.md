# ALP Course Data Management

This folder contains the course catalog data and conversion utilities for the ALP Curriculum Recommendation System.

## Files Overview

### 📊 **ALP_Learning_Paths_2024.xlsx**
- Original Excel file containing the complete course catalog
- Source of truth for all learning paths, categories, and courses
- **Structure expected:**
  - Column A: Learning Path Name
  - Column B: Category Name
  - Column C: Course Name
  - Column D: Lesson Name

### 🔄 **convertExcelToJson.js**
- Node.js script to convert Excel file to JavaScript object
- Automatically generates `courseData.js` from the Excel file
- Includes data validation and statistics

### 📝 **courseData.js**
- Generated JavaScript file containing the course catalog
- Used by the React prototype to display courses
- Contains helper functions for data manipulation

## How to Use

### Option 1: Manual Update (Current)
The current `courseData.js` was created manually with sample data. To use your actual Excel data:

1. **Install dependencies:**
   ```bash
   npm install xlsx
   ```

2. **Run the conversion script:**
   ```bash
   node src/data/convertExcelToJson.js
   ```

3. **Verify the output:**
   - Check `courseData.js` for correct data structure
   - Review console output for statistics

### Option 2: Update Excel File
If you need to modify the course catalog:

1. **Edit `ALP_Learning_Paths_2024.xlsx`**
2. **Re-run the conversion script**
3. **Restart the development server** to see changes

## Data Structure

The generated `courseData.js` exports a `learningPaths` object with this structure:

```javascript
export const learningPaths = {
  "Learning Path Name": {
    "Category Name": {
      courses: [
        {
          name: "Course Name",
          lessons: ["Lesson 1", "Lesson 2", "Lesson 3"]
        }
      ],
      level: "Intermediate"
    }
  }
};
```

## Helper Functions

The `courseData.js` file includes several utility functions:

- `getTotalCourses()` - Returns total number of courses
- `getTotalLessons()` - Returns total number of lessons across all courses
- `getCoursesByLevel(level)` - Filters courses by difficulty level
- `getLearningPathNames()` - Gets all learning path names
- `getCategoriesForPath(pathName)` - Gets categories for a specific path
- `courseStats` - Object containing catalog statistics

## Adding New Courses

### Method 1: Update Excel File
1. Add new rows to `ALP_Learning_Paths_2024.xlsx`
2. Run conversion script
3. Restart development server

### Method 2: Direct JavaScript Edit
1. Edit `courseData.js` directly
2. Follow the existing structure
3. Save and let hot-reload update the interface

## Prototype Integration

The React prototype (`SimplifiedALPPrototype.jsx`) imports and uses this data:

```javascript
import { learningPaths } from './data/courseData';

// Displays all learning paths as expandable sections
// Shows categories as selectable cards
// Lists courses as tags within each category
```

## File Validation

Before using the conversion script, ensure your Excel file has:
- ✅ Consistent column headers
- ✅ No empty required fields (Path, Category, Course)
- ✅ All required fields filled (Learning Path, Category, Course Name)
- ✅ Lesson names provided where applicable

## Troubleshooting

**Error: Cannot find module 'xlsx'**
```bash
npm install xlsx
```

**Error: ENOENT - Excel file not found**
- Verify `ALP_Learning_Paths_2024.xlsx` exists in this folder
- Check file permissions

**Empty or incorrect output**
- Verify Excel column headers match expected format
- Check for empty rows in the Excel file
- Ensure data starts from row 2 (row 1 should be headers)

## Current Status

📊 **Current Data (manually created):**
- 8 Learning Paths
- 24 Categories  
- 72+ Individual Courses

🔄 **To use your actual Excel data:**
Run the conversion script to replace the manual data with your complete catalog.