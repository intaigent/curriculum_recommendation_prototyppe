import React, { useState } from 'react';
import { Upload, Users, Download, AlertCircle, BookOpen, Sparkles, ChevronRight, FolderOpen, ChevronDown, ChevronUp, Info } from 'lucide-react';
import { learningPaths } from './data/courseData';
import jsPDF from 'jspdf';

const SimplifiedALPPrototype = () => {
  const [projectData, setProjectData] = useState({
    focusAreas: '',
    targetStakeholder: '',
    businessContext: '',
    expectedOutcomes: ''
  });
  
  const [uploadedFile, setUploadedFile] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [recommendations, setRecommendations] = useState(null);
  const [selectedCourses, setSelectedCourses] = useState({});
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [showAdditionalTraining, setShowAdditionalTraining] = useState(true);

  // Learning paths are now imported from courseData.js

  const handleInputChange = (field, value) => {
    setProjectData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file && file.type === 'application/pdf') {
      setUploadedFile(file);
    }
  };

  const generateRecommendations = () => {
    if (!projectData.focusAreas || !projectData.targetStakeholder || !projectData.businessContext || !projectData.expectedOutcomes) {
      alert('Please fill in all required fields: Project Focus Areas, Target Stakeholder, Business Context & Constraints, and Expected Outcomes');
      return;
    }

    setIsGenerating(true);

    setTimeout(() => {
      setRecommendations({ confidence: 92 });
      // AI recommendations - select specific courses within recommended categories
      const recommendedSelections = {};

      // Helper function to add course selections for a category
      const addCourseSelections = (categoryName, courseIndices = []) => {
        const categoryId = categoryName.toLowerCase().replace(/[^a-z0-9]/g, '-');
        Object.entries(learningPaths).forEach(([pathName, categories]) => {
          Object.entries(categories).forEach(([catName, categoryData]) => {
            if (catName === categoryName) {
              categoryData.courses.forEach((course, index) => {
                const courseId = `${categoryId}-course-${index}`;
                if (courseIndices.length === 0 || courseIndices.includes(index)) {
                  recommendedSelections[courseId] = true;
                }
              });
            }
          });
        });
      };

      // Add AI recommended courses
      addCourseSelections('Bookkeeping and Your Business', [0, 1]); // First 2 courses
      addCourseSelections('Bookkeeping Ledgers', [0, 2]); // Cash Ledger + Expense Ledger
      addCourseSelections('Business Relationships', [0, 1, 2]); // First 3 courses
      addCourseSelections('Inventory Management', [0, 1, 3]); // Skip recordkeeping, include key courses
      addCourseSelections('Cost Management'); // All courses
      addCourseSelections('Finance and Accounting Basics', [0, 1, 2, 3]); // Skip cooperative-specific
      addCourseSelections('Financial Analysis and Planning', [0, 3, 4]); // Key planning courses
      addCourseSelections('Working with Credit', [0, 2]); // Introduction + customer credit
      addCourseSelections('Planning For Your Business', [0, 1, 4]); // Core planning courses
      addCourseSelections('Marketing', [0, 2, 3]); // Skip vision, focus on practical
      addCourseSelections('Managing Risk', [0, 1]); // Core risk management

      setSelectedCourses(recommendedSelections);
      setIsGenerating(false);
    }, 2000);
  };

  const toggleCourse = (courseId) => {
    setSelectedCourses(prev => ({ ...prev, [courseId]: !prev[courseId] }));
  };

  // Helper function to get course ID
  const getCourseId = (categoryName, courseIndex) => {
    const categoryId = categoryName.toLowerCase().replace(/[^a-z0-9]/g, '-');
    return `${categoryId}-course-${courseIndex}`;
  };

  // Helper function to get selected courses count for a category
  const getCategorySelectedCount = (categoryName, categoryData) => {
    let selectedCount = 0;
    categoryData.courses.forEach((course, index) => {
      const courseId = getCourseId(categoryName, index);
      if (selectedCourses[courseId]) {
        selectedCount++;
      }
    });
    return selectedCount;
  };

  // Helper function to toggle all courses in a category
  const toggleCategoryAll = (categoryName, categoryData) => {
    const selectedCount = getCategorySelectedCount(categoryName, categoryData);
    const shouldSelectAll = selectedCount < categoryData.courses.length;

    const updates = {};
    categoryData.courses.forEach((course, index) => {
      const courseId = getCourseId(categoryName, index);
      updates[courseId] = shouldSelectAll;
    });

    setSelectedCourses(prev => ({ ...prev, ...updates }));
  };

  // Helper function to get total selected courses count
  const getTotalSelectedCount = () => {
    return Object.values(selectedCourses).filter(Boolean).length;
  };

  // Helper function to get total courses count
  const getTotalCoursesCount = () => {
    let total = 0;
    Object.values(learningPaths).forEach(categories => {
      Object.values(categories).forEach(categoryData => {
        total += categoryData.courses.length;
      });
    });
    return total;
  };

  const exportToPDF = async () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    const margin = 20;
    const lineHeight = 7;
    let yPosition = margin;

    // Helper function to add text with word wrapping
    const addText = (text, x, y, maxWidth, fontSize = 12, style = 'normal') => {
      doc.setFontSize(fontSize);
      doc.setFont('helvetica', style);
      const lines = doc.splitTextToSize(text, maxWidth);
      doc.text(lines, x, y);
      return y + (lines.length * lineHeight);
    };

    // Helper function to check page overflow and add new page if needed
    const checkPageOverflow = (currentY, requiredSpace = 20) => {
      if (currentY + requiredSpace > doc.internal.pageSize.height - 20) {
        doc.addPage();
        return margin;
      }
      return currentY;
    };

    // Enhanced Header with ALP Logo
    doc.setFillColor(59, 130, 246);
    doc.rect(0, 0, pageWidth, 35, 'F');
    doc.setTextColor(255, 255, 255);

    // Add ALP Logo
    try {
      // Load the logo image
      const logoImg = new Image();
      logoImg.crossOrigin = 'anonymous';

      await new Promise((resolve, reject) => {
        logoImg.onload = () => {
          // Add logo to PDF with white background for better visibility
          doc.setFillColor(255, 255, 255);
          doc.rect(margin, 8, 25, 20, 'F');
          doc.addImage(logoImg, 'JPEG', margin + 2, 10, 21, 16);
          resolve();
        };
        logoImg.onerror = reject;
        logoImg.src = '/images/alp_logo.jpeg';
      });
    } catch (error) {
      // Fallback to ALP text if logo fails to load
      doc.setFillColor(255, 255, 255);
      doc.rect(margin, 8, 25, 20, 'F');
      doc.setFontSize(12);
      doc.setTextColor(59, 130, 246);
      doc.text('ALP', margin + 8, 20);
      doc.setTextColor(255, 255, 255);
    }

    // Title and metadata
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('ALP Curriculum Recommendation Report', margin + 35, 20);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    const currentDate = new Date().toLocaleDateString();
    doc.text(`Project Ref: ALP-TZ-2024-001  |  Generated: ${currentDate}`, margin + 35, 28);

    doc.setTextColor(0, 0, 0);
    yPosition = 45;

    // Executive Summary
    yPosition = addText('EXECUTIVE SUMMARY', margin, yPosition, pageWidth - 2 * margin, 14, 'bold');
    yPosition += 5;
    yPosition = addText('This comprehensive training curriculum has been designed specifically for agribusiness retailers in Tanzania to enhance their operational capacity, financial management, and stakeholder relationships. The program addresses critical skill gaps identified through needs assessment and aligns with local market conditions and regulatory requirements.', margin, yPosition, pageWidth - 2 * margin, 10);
    yPosition += 10;

    // Project Details Section with Enhanced Content
    yPosition = checkPageOverflow(yPosition, 30);
    yPosition = addText('PROJECT DETAILS', margin, yPosition, pageWidth - 2 * margin, 14, 'bold');
    yPosition += 5;

    yPosition = addText('Project Focus Areas:', margin, yPosition, pageWidth - 2 * margin, 12, 'bold');
    yPosition = addText('Comprehensive capacity building program for agribusiness retailers in Tanzania focusing on inventory management excellence, financial systems implementation, and supply chain optimization. The program emphasizes practical skills development for agricultural input management, stakeholder relationship building, and sustainable business growth strategies tailored to Tanzania\'s rural and semi-urban markets.', margin + 10, yPosition, pageWidth - 2 * margin - 10, 10);
    yPosition += 8;

    yPosition = addText('Target Stakeholder:', margin, yPosition, pageWidth - 2 * margin, 12, 'bold');
    yPosition = addText('Agribusiness Retailers - Small to medium-scale agricultural input dealers serving rural farming communities across Tanzania, including cooperative leaders and individual entrepreneurs managing agricultural supply stores.', margin + 10, yPosition, pageWidth - 2 * margin - 10, 10);
    yPosition += 8;

    yPosition = addText('Business Context & Constraints:', margin, yPosition, pageWidth - 2 * margin, 12, 'bold');
    yPosition = addText('Operating environment: Rural and semi-urban Tanzania with mixed literacy levels (40% primary education only), limited digital infrastructure (intermittent internet connectivity), seasonal business cycles tied to agricultural calendars. Participants serve smallholder farmers requiring agricultural inputs, tools, and supplies. Training delivery must accommodate Swahili language preferences and employ practical, hands-on learning methodologies suitable for adult learners with varied educational backgrounds.', margin + 10, yPosition, pageWidth - 2 * margin - 10, 10);
    yPosition += 12;

    yPosition = addText('Expected Outcomes:', margin, yPosition, pageWidth - 2 * margin, 12, 'bold');
    yPosition = addText('• Achieve 25% reduction in inventory losses through improved stock management systems\n• Enhance financial record-keeping accuracy by 80% with systematic bookkeeping practices\n• Strengthen supplier negotiation capabilities resulting in 15% cost savings\n• Improve farmer credit management reducing default rates by 30%\n• Establish sustainable business practices ensuring 20% profit margin improvement\n• Build digital payment system adoption reaching 60% of transactions', margin + 10, yPosition, pageWidth - 2 * margin - 10, 10);
    yPosition += 15;

    yPosition = addText('Project Duration & Budget:', margin, yPosition, pageWidth - 2 * margin, 12, 'bold');
    yPosition = addText('Duration: 6-month intensive program with 3-month follow-up support\nEstimated Budget: $45,000 USD (including materials, facilitator costs, and logistics)\nParticipants: 120 agribusiness retailers across 8 regions', margin + 10, yPosition, pageWidth - 2 * margin - 10, 10);
    yPosition += 15;

    // Selected Courses Section with Real Course Data
    yPosition = checkPageOverflow(yPosition, 30);
    yPosition = addText('TRAINING PLAN', margin, yPosition, pageWidth - 2 * margin, 14, 'bold');
    yPosition += 10;

    // Filter only individually selected courses from real course data
    const selectedCoursesFromData = [];
    Object.entries(learningPaths).forEach(([pathName, categories]) => {
      const selectedCategories = [];
      Object.entries(categories).forEach(([categoryName, categoryData]) => {
        const selectedCoursesInCategory = [];

        // Check each course individually
        categoryData.courses.forEach((course, courseIndex) => {
          const courseId = getCourseId(categoryName, courseIndex);
          if (selectedCourses[courseId]) {
            const courseName = typeof course === 'string' ? course : course.name;
            selectedCoursesInCategory.push(courseName);
          }
        });

        // Only include category if it has selected courses
        if (selectedCoursesInCategory.length > 0) {
          selectedCategories.push({
            name: categoryName,
            courses: selectedCoursesInCategory
          });
        }
      });

      // Only include learning path if it has categories with selected courses
      if (selectedCategories.length > 0) {
        selectedCoursesFromData.push({
          path: pathName,
          categories: selectedCategories
        });
      }
    });

    selectedCoursesFromData.forEach((pathGroup, pathIndex) => {
      yPosition = checkPageOverflow(yPosition, 25);
      yPosition = addText(`${pathIndex + 1}. ${pathGroup.path}`, margin, yPosition, pageWidth - 2 * margin, 11, 'bold');

      pathGroup.categories.forEach(category => {
        yPosition = checkPageOverflow(yPosition, 15);
        yPosition = addText(`   - ${category.name}`, margin + 5, yPosition, pageWidth - 2 * margin - 5, 10, 'bold');

        category.courses.forEach(course => {
          yPosition = checkPageOverflow(yPosition, 10);
          yPosition = addText(`     • ${course}`, margin + 10, yPosition, pageWidth - 2 * margin - 10, 9);
        });
      });
      yPosition += 5;
    });



    // Save the PDF
    doc.save('ALP_Curriculum_Recommendation_Report_MockUp.pdf');
  };


  const viewMaterials = (categoryName) => {
    // Convert category name to folder path format
    const folderName = categoryName.toLowerCase().replace(/[^a-z0-9]/g, '-');
    const materialsPath = `./materials/${folderName}/`;

    // In a real implementation, this would open the folder or navigate to materials
    // For prototype purposes, show what would happen
    alert(`Opening materials folder: ${materialsPath}\n\nContents would include:\n- Course slides and presentations\n- Reading materials and handouts\n- Assessment materials\n- Video resources\n- Interactive exercises\n\nFor: ${categoryName}`);

    // In production, you might use:
    // window.open(materialsPath, '_blank'); // For web links
    // or navigate to a materials management system
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Notion-style Header */}
      <div className="border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-6 py-8">
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-2xl font-semibold text-gray-900">
              ALP Curriculum Recommendation System
            </h1>
          </div>
          <p className="text-gray-600 text-base mb-2">
            Build customized training plans for your ALP projects
          </p>
          <div className="bg-blue-50 border-l-4 border-blue-400 p-3 rounded-r">
            <h3 className="font-medium text-blue-900 text-sm mb-1">How to use this tool:</h3>
            <p className="text-blue-800 text-sm">
              1. Fill in your project details below → 2. Click "Generate Recommendations" → 3. Review and select courses → 4. Export your customized training plan
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-8 lg:px-12 py-8">
        <div className="grid lg:grid-cols-7 gap-8">
          {/* Notion-style Input Section */}
          <div className="lg:col-span-3 space-y-6 bg-white rounded-lg shadow-sm border border-gray-100 p-6">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Project Details</h2>
                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">Step 1 of 4</span>
              </div>
              <p className="text-sm text-gray-600 mb-6">
                Provide information about your project to receive customized course recommendations.
              </p>

              <div className="space-y-5">
                {/* Project Focus Areas */}
                <div>
                  <label className="text-sm text-gray-700 font-medium mb-2 block">
                    Project Focus Areas <span className="text-red-500">*</span>
                  </label>
                  <p className="text-xs text-gray-500 mb-2">
                    Describe what specific skills or knowledge gaps your project aims to address. Be specific about the training objectives and desired capabilities.
                  </p>
                  <textarea
                    value={projectData.focusAreas}
                    onChange={(e) => handleInputChange('focusAreas', e.target.value)}
                    placeholder="Example: Train agribusiness retailers in Tanzania to improve inventory management capacity for agricultural inputs and supplies. Strengthen finance and bookkeeping skills for better business operations and cash flow management."
                    rows={4}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all hover:border-gray-300 resize-none"
                  />
                </div>

                {/* Target Stakeholder */}
                <div>
                  <label className="text-sm text-gray-700 font-medium mb-2 block">
                    Target Stakeholder <span className="text-red-500">*</span>
                  </label>
                  <p className="text-xs text-gray-500 mb-2">
                    Choose the primary group that will receive the training. This helps tailor the curriculum to their specific needs and context.
                  </p>
                  <select
                    value={projectData.targetStakeholder}
                    onChange={(e) => handleInputChange('targetStakeholder', e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all hover:border-gray-300 bg-white"
                  >
                    <option value="">Select stakeholder type...</option>
                    <option value="producer_organizations">Producer Organizations (Cooperatives, Farmer Groups)</option>
                    <option value="individual_farmers">Individual Farmers (Smallholder, Commercial)</option>
                    <option value="agribusiness_retailers">Agribusiness Retailers (Input Dealers, Supply Stores)</option>
                  </select>
                </div>

                {/* Business Context & Constraints */}
                <div>
                  <label className="text-sm text-gray-700 font-medium mb-2 block">
                    Business Context & Constraints <span className="text-red-500">*</span>
                  </label>
                  <p className="text-xs text-gray-500 mb-2">
                    Describe the operating environment, literacy levels, infrastructure, language preferences, and any training delivery constraints or requirements.
                  </p>
                  <textarea
                    value={projectData.businessContext}
                    onChange={(e) => handleInputChange('businessContext', e.target.value)}
                    placeholder="Example: Agribusiness retailers operating in rural and semi-urban Tanzania. Mixed literacy levels, limited digital infrastructure, seasonal business cycles. Serving smallholder farmers with agricultural inputs, tools, and supplies. Training must accommodate local languages and practical, hands-on learning approaches."
                    rows={4}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all hover:border-gray-300 resize-none"
                  />
                </div>

                {/* Expected Outcomes */}
                <div>
                  <label className="text-sm text-gray-700 font-medium mb-2 block">
                    Expected Outcomes <span className="text-red-500">*</span>
                  </label>
                  <p className="text-xs text-gray-500 mb-2">
                    List specific, measurable outcomes you want to achieve. Include concrete metrics, percentages, or targets where possible.
                  </p>
                  <textarea
                    value={projectData.expectedOutcomes}
                    onChange={(e) => handleInputChange('expectedOutcomes', e.target.value)}
                    placeholder="Example: Improve inventory turnover and reduce stock losses by 25%. Enhance financial record-keeping and cash flow management. Strengthen supplier negotiation and farmer credit management capabilities. Build sustainable business practices for long-term profitability."
                    rows={4}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all hover:border-gray-300 resize-none"
                  />
                </div>

                {/* File Upload */}
                <div>
                  <label className="text-sm text-gray-700 font-medium mb-2 block">
                    ALP Metrics Report <span className="text-gray-400">(Optional)</span>
                  </label>
                  <p className="text-xs text-gray-500 mb-2">
                    Upload existing assessment or baseline data to help refine recommendations. Supports PDF format only.
                  </p>
                  <div className="relative border border-dashed border-gray-300 rounded-md p-6 text-center hover:border-gray-400 transition-colors group">
                    <Upload className="mx-auto h-6 w-6 text-gray-400 group-hover:text-gray-500 mb-2" />
                    <input
                      type="file"
                      accept=".pdf"
                      onChange={handleFileUpload}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      id="file-upload"
                    />
                    <p className="text-sm text-gray-600 font-medium">Click to upload or drag and drop</p>
                    <p className="text-xs text-gray-400 mt-1">PDF files only</p>
                    {uploadedFile && (
                      <div className="mt-3 text-xs text-green-600 font-medium">
                        ✓ {uploadedFile.name}
                      </div>
                    )}
                  </div>
                </div>

                {/* Generate Button */}
                <button
                  onClick={generateRecommendations}
                  disabled={isGenerating}
                  className="w-full py-2.5 bg-blue-500 text-white text-sm font-medium rounded-md hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
                >
                  {isGenerating ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                      <span>Analyzing...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4" />
                      <span>Generate Recommendations</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Recommendations and Course Selection Section */}
          <div className="lg:col-span-4 bg-white rounded-lg shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900">Course Recommendations</h2>
              {!recommendations && !isGenerating && (
                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">Step 2 of 4</span>
              )}
            </div>

            {!recommendations && !isGenerating && (
              <div className="text-center py-16 px-6">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertCircle className="h-6 w-6 text-gray-400" />
                </div>
                <h3 className="text-sm font-medium text-gray-900 mb-1">Ready to generate recommendations</h3>
                <p className="text-sm text-gray-500 mb-3">Complete all required fields in the Project Details form and click "Generate Recommendations"</p>
                <div className="bg-blue-50 border border-blue-200 rounded-md p-3 text-left">
                  <h4 className="text-xs font-medium text-blue-900 mb-1">What happens next:</h4>
                  <ul className="text-xs text-blue-800 space-y-1">
                    <li>• AI analyzes your project context and requirements</li>
                    <li>• Personalized course selection appears here</li>
                    <li>• Review and customize your learning pathway</li>
                    <li>• Export a comprehensive training plan</li>
                  </ul>
                </div>
              </div>
            )}

            {isGenerating && (
              <div className="text-center py-16 px-6">
                <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-2 border-blue-200 border-t-blue-500"></div>
                </div>
                <h3 className="text-sm font-medium text-gray-900 mb-1">Analyzing project</h3>
                <p className="text-sm text-gray-500">Processing your requirements to suggest optimal learning paths</p>
              </div>
            )}

            {recommendations && (
              <div className="space-y-6">
                {/* Course Selection - Now at the top */}
                <div className="border border-gray-200 rounded-md p-4 flex flex-col h-[36rem] md:h-[40rem] lg:h-[48rem] relative">
                  <div className="flex items-center justify-between mb-3 flex-shrink-0">
                    <div className="flex items-center space-x-3">
                      <h3 className="text-sm font-medium text-gray-900">Course Selection</h3>
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                        {getTotalSelectedCount()} of {getTotalCoursesCount()} courses selected
                      </span>
                    </div>
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">Step 3 of 4</span>
                  </div>
                  <p className="text-xs text-gray-600 mb-3 flex-shrink-0">
                    Review AI recommendations (marked with ✨) and select additional courses. Click course titles to see details or use "View Materials" to explore resources.
                  </p>
                  <div className="overflow-y-auto flex-1 space-y-4 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 hover:scrollbar-thumb-gray-400">
                    {Object.entries(learningPaths).map(([pathName, categories]) => (
                      <div key={pathName} className="mb-6">
                        {/* Enhanced Learning Path Header */}
                        <div className="bg-gradient-to-r from-blue-50 to-blue-100 border-l-4 border-blue-500 rounded-r-md p-3 mb-4">
                          <div className="flex items-center space-x-2">
                            <BookOpen className="w-5 h-5 text-blue-600" />
                            <h4 className="text-lg font-bold text-blue-900">{pathName}</h4>
                          </div>
                        </div>
                        <div className="space-y-2">
                          {Object.entries(categories).map(([categoryName, categoryData]) => {
                            const categoryId = categoryName.toLowerCase().replace(/[^a-z0-9]/g, '-');
                            const selectedCount = getCategorySelectedCount(categoryName, categoryData);
                            const totalCount = categoryData.courses.length;
                            const allSelected = selectedCount === totalCount;
                            const someSelected = selectedCount > 0;

                            return (
                              <div
                                key={categoryName}
                                className="border border-gray-200 rounded-md p-3 hover:shadow-sm transition-all"
                              >
                                {/* Category Header */}
                                <div className="flex items-center justify-between mb-3">
                                  <div className="flex items-center space-x-3">
                                    {/* Category Select All Checkbox */}
                                    <button
                                      onClick={() => toggleCategoryAll(categoryName, categoryData)}
                                      className="flex items-center space-x-2 hover:bg-gray-50 rounded px-1 py-0.5 transition-colors"
                                    >
                                      <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                                        allSelected
                                          ? 'bg-blue-500 border-blue-500'
                                          : someSelected
                                          ? 'bg-blue-100 border-blue-400'
                                          : 'border-gray-300'
                                      }`}>
                                        {allSelected && <div className="w-1.5 h-1.5 bg-white rounded-sm"></div>}
                                        {someSelected && !allSelected && <div className="w-1.5 h-1.5 bg-blue-500 rounded-sm"></div>}
                                      </div>
                                      <h5 className="text-sm font-medium text-gray-900">{categoryName}</h5>
                                    </button>

                                    {/* Badges */}
                                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                                      {selectedCount}/{totalCount}
                                    </span>
                                  </div>

                                  <button
                                    onClick={() => viewMaterials(categoryName)}
                                    className="inline-flex items-center px-2 py-1 text-xs font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded hover:bg-blue-100 hover:text-blue-700 transition-colors"
                                  >
                                    <FolderOpen className="w-3 h-3 mr-1" />
                                    View Materials
                                  </button>
                                </div>

                                {/* Individual Courses */}
                                <div className="space-y-2">
                                  {categoryData.courses.map((course, courseIndex) => {
                                    const courseName = typeof course === 'string' ? course : course.name;
                                    const lessons = typeof course === 'object' && course.lessons ? course.lessons : [];
                                    const hasLessons = lessons.length > 0;
                                    const courseId = getCourseId(categoryName, courseIndex);
                                    const isCourseSelected = selectedCourses[courseId];

                                    // Check if this specific course is AI recommended
                                    const isRecommended = isCourseSelected && (
                                      (categoryName === 'Bookkeeping and Your Business' && courseIndex < 2) ||
                                      (categoryName === 'Bookkeeping Ledgers' && [0, 2].includes(courseIndex)) ||
                                      (categoryName === 'Business Relationships' && courseIndex < 3) ||
                                      (categoryName === 'Inventory Management' && [0, 1, 3].includes(courseIndex)) ||
                                      (categoryName === 'Cost Management') ||
                                      (categoryName === 'Finance and Accounting Basics' && courseIndex < 4) ||
                                      (categoryName === 'Financial Analysis and Planning' && [0, 3, 4].includes(courseIndex)) ||
                                      (categoryName === 'Working with Credit' && [0, 2].includes(courseIndex)) ||
                                      (categoryName === 'Planning For Your Business' && [0, 1, 4].includes(courseIndex)) ||
                                      (categoryName === 'Marketing' && [0, 2, 3].includes(courseIndex)) ||
                                      (categoryName === 'Managing Risk' && courseIndex < 2)
                                    );

                                    return (
                                      <div key={courseIndex} className="flex items-start space-x-3 group ml-6">
                                        {/* Course Checkbox */}
                                        <button
                                          onClick={() => toggleCourse(courseId)}
                                          className="mt-0.5 flex-shrink-0"
                                        >
                                          <div className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-colors ${
                                            isCourseSelected ? 'bg-blue-500 border-blue-500' : 'border-gray-300 hover:border-gray-400'
                                          }`}>
                                            {isCourseSelected && <div className="w-1.5 h-1.5 bg-white rounded-sm"></div>}
                                          </div>
                                        </button>

                                        {/* Course Content */}
                                        <div className="flex-1 min-w-0">
                                          <div className="flex items-center space-x-2 mb-1">
                                            <span
                                              className={`text-sm cursor-pointer transition-colors ${
                                                isCourseSelected ? 'text-gray-700 font-normal' : 'text-gray-600 hover:text-gray-700'
                                              }`}
                                              onClick={() => toggleCourse(courseId)}
                                            >
                                              {courseName}
                                            </span>
                                            {isRecommended && (
                                              <span className="inline-flex items-center px-1.5 py-0.5 text-xs font-medium bg-blue-100 text-blue-800 rounded">
                                                <Sparkles className="w-2.5 h-2.5 mr-1" />
                                                AI Pick
                                              </span>
                                            )}
                                          </div>

                                          {/* Lessons Preview (only if selected and has lessons) */}
                                          {isCourseSelected && hasLessons && (
                                            <div className="relative group">
                                              <div className="text-xs text-gray-500 cursor-help">
                                                {lessons.length} lesson{lessons.length !== 1 ? 's' : ''} • Hover for details
                                              </div>

                                              {/* Tooltip for lessons */}
                                              <div className="absolute z-50 invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-opacity duration-200 top-full left-0 mt-1 w-80 max-w-sm">
                                                <div className="bg-gray-900 text-white text-xs rounded-lg py-2 px-3 shadow-lg">
                                                  <div className="font-medium mb-2">{courseName} - Lessons</div>
                                                  <div className="text-gray-300 text-xs space-y-1 max-h-32 overflow-y-auto">
                                                    {lessons.map((lesson, lessonIdx) => (
                                                      <div key={lessonIdx} className="flex items-start">
                                                        <span className="mr-2 text-gray-400 flex-shrink-0">{lessonIdx + 1}.</span>
                                                        <span>{lesson}</span>
                                                      </div>
                                                    ))}
                                                  </div>
                                                  {/* Arrow */}
                                                  <div className="absolute -top-1 left-4 w-2 h-2 bg-gray-900 rotate-45"></div>
                                                </div>
                                              </div>
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                  {/* Subtle fade indicator for more content */}
                  <div className="absolute bottom-4 left-0 right-0 h-6 bg-gradient-to-t from-white to-transparent pointer-events-none rounded-b-md"></div>
                </div>

                {/* Collapsible Training Analysis */}
                <div className="border border-gray-200 rounded-md p-4">
                  <button
                    onClick={() => setShowAnalysis(!showAnalysis)}
                    className="w-full flex items-center justify-between text-left hover:bg-gray-50 rounded p-2 -m-2"
                  >
                    <div className="flex items-center space-x-2">
                      <Info className="w-4 h-4 text-gray-500" />
                      <h3 className="text-sm font-medium text-gray-900">Why these courses?</h3>
                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">Optional Details</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-gray-500">
                        {showAnalysis ? 'Hide' : 'Show'} analysis
                      </span>
                      {showAnalysis ? <ChevronUp className="w-4 h-4 text-gray-500" /> : <ChevronDown className="w-4 h-4 text-gray-500" />}
                    </div>
                  </button>

                  {showAnalysis && (
                    <div className="mt-4 space-y-3 text-sm text-gray-600">
                      <div className="bg-blue-50 border-l-4 border-blue-400 p-3 rounded-r">
                        <h4 className="font-semibold text-blue-900 mb-2">🏗️ Financial Foundation Building</h4>
                        <p className="text-blue-800">Establishing robust financial management systems through <span className="font-medium">Bookkeeping and Your Business</span>, <span className="font-medium">Bookkeeping Ledgers</span>, and <span className="font-medium">Finance and Accounting Basics</span>. These foundational skills enable systematic record-keeping and financial literacy essential for sustainable agribusiness operations in Tanzania's rural markets.</p>
                      </div>

                      <div className="bg-green-50 border-l-4 border-green-400 p-3 rounded-r">
                        <h4 className="font-semibold text-green-900 mb-2">📦 Operational Excellence</h4>
                        <p className="text-green-800">Optimizing core business operations through <span className="font-medium">Inventory Management</span>, <span className="font-medium">Cost Management</span>, and <span className="font-medium">Planning For Your Business</span>. Addresses the critical need to reduce stock losses by 25% and improve turnover rates in seasonal agricultural input markets.</p>
                      </div>

                      <div className="bg-orange-50 border-l-4 border-orange-400 p-3 rounded-r">
                        <h4 className="font-semibold text-orange-900 mb-2">🤝 Stakeholder Relationship Management</h4>
                        <p className="text-orange-800">Strengthening partnerships through <span className="font-medium">Business Relationships</span>, <span className="font-medium">Working with Credit</span>, and <span className="font-medium">Marketing</span>. Critical for building trust with smallholder farmers and managing credit systems while expanding market reach in rural communities.</p>
                      </div>

                      <div className="bg-purple-50 border-l-4 border-purple-400 p-3 rounded-r">
                        <h4 className="font-semibold text-purple-900 mb-2">📈 Strategic Growth & Risk Management</h4>
                        <p className="text-purple-800">Advanced capabilities through <span className="font-medium">Financial Analysis and Planning</span> and <span className="font-medium">Managing Risk</span>. Enables data-driven decision making and proactive risk mitigation for weather, market volatility, and credit risks inherent in agricultural supply chains.</p>
                      </div>

                      <div className="bg-gray-50 border border-gray-200 p-3 rounded">
                        <p className="text-gray-700 text-xs"><span className="font-medium">Training Approach:</span> Sequential skill building from foundational financial literacy to advanced strategic management, designed for mixed literacy levels with practical, hands-on methodologies suitable for Tanzania's rural business environment.</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Additional Professional Training Recommendations */}
                <div className="border border-orange-200 rounded-md p-4 bg-orange-50">
                  <button
                    onClick={() => setShowAdditionalTraining(!showAdditionalTraining)}
                    className="w-full flex items-center justify-between text-left hover:bg-orange-100 rounded p-2 -m-2"
                  >
                    <div className="flex items-center space-x-2">
                      <h3 className="text-sm font-medium text-orange-900">Additional professional training recommendations</h3>
                      <span className="text-xs bg-orange-200 text-orange-800 px-2 py-1 rounded">4 Specialized Modules</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-orange-700">
                        {showAdditionalTraining ? 'Hide' : 'Show'} modules
                      </span>
                      {showAdditionalTraining ? <ChevronUp className="w-4 h-4 text-orange-700" /> : <ChevronDown className="w-4 h-4 text-orange-700" />}
                    </div>
                  </button>

                  {showAdditionalTraining && (
                    <div className="mt-4 space-y-3 text-sm text-orange-800">
                      <div>
                        <h4 className="font-medium">Agricultural Input Quality Assessment & Storage</h4>
                        <p className="text-xs mt-1">Evaluating seed viability, fertilizer composition, and pesticide efficacy. Proper storage techniques to prevent input degradation and maintain quality standards for smallholder farmers.</p>
                      </div>
                      <div>
                        <h4 className="font-medium">Crop Cycle Advisory & Input Timing</h4>
                        <p className="text-xs mt-1">Understanding local crop calendars and seasonal input requirements for Tanzania. Advising farmers on optimal timing for seed, fertilizer, and pesticide application based on crop varieties.</p>
                      </div>
                      <div>
                        <h4 className="font-medium">Regulatory Compliance for Agricultural Chemicals</h4>
                        <p className="text-xs mt-1">Understanding licensing requirements for selling pesticides and fertilizers in Tanzania. Safety protocols and record-keeping for restricted agricultural inputs.</p>
                      </div>
                      <div>
                        <h4 className="font-medium">Mobile Money & Digital Payment Integration</h4>
                        <p className="text-xs mt-1">Setting up M-Pesa, Tigo Pesa, and other Tanzania-specific digital payment platforms. Managing mixed cash/digital transactions with rural customers.</p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium text-gray-900">Export Training Plan</h3>
                    <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded">Step 4 of 4</span>
                  </div>
                  <p className="text-xs text-gray-600">
                    Generate a comprehensive PDF report with your selected courses, training rationale, and implementation guidance.
                  </p>
                  <div className="flex space-x-2">
                    <button
                      onClick={exportToPDF}
                      disabled={getTotalSelectedCount() === 0}
                      className="flex-1 py-2 px-4 bg-gray-900 text-white text-sm font-medium rounded-md hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Export PDF Report
                    </button>

                    <button
                      onClick={() => {
                        // Reset to AI recommended individual courses
                        const recommendedSelections = {};

                        // Helper function to add course selections for a category
                        const addCourseSelections = (categoryName, courseIndices = []) => {
                          const categoryId = categoryName.toLowerCase().replace(/[^a-z0-9]/g, '-');
                          Object.entries(learningPaths).forEach(([pathName, categories]) => {
                            Object.entries(categories).forEach(([catName, categoryData]) => {
                              if (catName === categoryName) {
                                categoryData.courses.forEach((course, index) => {
                                  const courseId = `${categoryId}-course-${index}`;
                                  if (courseIndices.length === 0 || courseIndices.includes(index)) {
                                    recommendedSelections[courseId] = true;
                                  }
                                });
                              }
                            });
                          });
                        };

                        // Add AI recommended courses (same as in generateRecommendations)
                        addCourseSelections('Bookkeeping and Your Business', [0, 1]);
                        addCourseSelections('Bookkeeping Ledgers', [0, 2]);
                        addCourseSelections('Business Relationships', [0, 1, 2]);
                        addCourseSelections('Inventory Management', [0, 1, 3]);
                        addCourseSelections('Cost Management');
                        addCourseSelections('Finance and Accounting Basics', [0, 1, 2, 3]);
                        addCourseSelections('Financial Analysis and Planning', [0, 3, 4]);
                        addCourseSelections('Working with Credit', [0, 2]);
                        addCourseSelections('Planning For Your Business', [0, 1, 4]);
                        addCourseSelections('Marketing', [0, 2, 3]);
                        addCourseSelections('Managing Risk', [0, 1]);

                        setSelectedCourses(recommendedSelections);
                      }}
                      className="px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-50 transition-colors"
                      title="Reset to original AI recommendations"
                    >
                      Reset to AI Picks
                    </button>
                  </div>

                  {getTotalSelectedCount() === 0 && (
                    <div className="bg-amber-50 border border-amber-200 rounded-md p-3">
                      <p className="text-xs text-amber-800">
                        <strong>Note:</strong> Select at least one course to enable PDF export.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SimplifiedALPPrototype;