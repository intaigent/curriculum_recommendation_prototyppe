import React, { useState } from 'react';
import { Upload, Users, Download, AlertCircle, BookOpen, Sparkles, ChevronRight } from 'lucide-react';

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

  // Simplified ALP Learning Paths structure
  const learningPaths = {
    "Fundamentals of Cooperatives": {
      "Understanding Cooperatives": {
        courses: ["Introduction to Cooperatives", "Cooperative Values and Principles", "Cooperative Governance"],
        duration: "4-5 hours",
        level: "Basic"
      },
      "Leadership": {
        courses: ["Introduction to Leadership", "Managing Meetings", "Resolving Conflicts"],
        duration: "3-4 hours",
        level: "Intermediate"
      }
    },
    "Bookkeeping Essentials": {
      "Bookkeeping Ledgers": {
        courses: ["Cash Ledger", "Inventory Ledger", "Expense Ledger"],
        duration: "4-5 hours",
        level: "Specialized"
      }
    },
    "Producer Organization Essentials": {
      "Operations": {
        courses: ["Introduction to Operations", "Collection from Farmers", "Receiving and Storage", "Delivery to Buyers"],
        duration: "4-5 hours",
        level: "Intermediate"
      }
    },
    "Finance and Accounting": {
      "Finance and Accounting Basics": {
        courses: ["Introduction to Finance and Accounting", "Financial Statements", "Balance Sheets"],
        duration: "6-8 hours",
        level: "Intermediate"
      }
    }
  };

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
      setSelectedCourses({
        'understanding-cooperatives': true,
        'bookkeeping-ledgers': true,
        'operations': true
      });
      setIsGenerating(false);
    }, 2000);
  };

  const toggleCourse = (courseId) => {
    setSelectedCourses(prev => ({ ...prev, [courseId]: !prev[courseId] }));
  };

  const exportToPDF = () => {
    alert('PDF export functionality - would generate learning path report');
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Notion-style Header */}
      <div className="border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-6 py-8">
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-2xl font-semibold text-gray-900">
              ALP Curriculum Recommendation
            </h1>
          </div>
          <p className="text-gray-600 text-base">
            Generate personalized course recommendations based on your project objectives
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-5 gap-8">
          {/* Notion-style Input Section */}
          <div className="lg:col-span-2 space-y-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Project Details</h2>
              
              <div className="space-y-5">
                {/* Project Focus Areas */}
                <div>
                  <label className="text-sm text-gray-700 font-medium mb-2 block">
                    Project Focus Areas <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={projectData.focusAreas}
                    onChange={(e) => handleInputChange('focusAreas', e.target.value)}
                    placeholder="Improve inventory management and supplier relationships for agricultural inputs. Strengthen financial record-keeping for better cash flow planning."
                    rows={3}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all hover:border-gray-300 resize-none"
                  />
                </div>

                {/* Target Stakeholder */}
                <div>
                  <label className="text-sm text-gray-700 font-medium mb-2 block">
                    Target Stakeholder <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={projectData.targetStakeholder}
                    onChange={(e) => handleInputChange('targetStakeholder', e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all hover:border-gray-300 bg-white"
                  >
                    <option value="">Select stakeholder type...</option>
                    <option value="producer_organizations">Producer Organizations</option>
                    <option value="individual_farmers">Individual Farmers</option>
                    <option value="enterprises_retailer">Enterprises/Retailer</option>
                  </select>
                </div>

                {/* Business Context & Constraints */}
                <div>
                  <label className="text-sm text-gray-700 font-medium mb-2 block">
                    Business Context & Constraints <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={projectData.businessContext}
                    onChange={(e) => handleInputChange('businessContext', e.target.value)}
                    placeholder="Rural agricultural supply store in Northern Tanzania. Limited internet access, seasonal cash constraints, serving 200+ smallholder farmers. 3-month training window before planting season."
                    rows={3}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all hover:border-gray-300 resize-none"
                  />
                </div>

                {/* Expected Outcomes */}
                <div>
                  <label className="text-sm text-gray-700 font-medium mb-2 block">
                    Expected Outcomes <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={projectData.expectedOutcomes}
                    onChange={(e) => handleInputChange('expectedOutcomes', e.target.value)}
                    placeholder="Reduce inventory waste by 30%. Improve farmer payment terms and supplier negotiations. Better business planning and seasonal cash management skills."
                    rows={3}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all hover:border-gray-300 resize-none"
                  />
                </div>

                {/* File Upload */}
                <div>
                  <label className="text-sm text-gray-700 font-medium mb-2 block">
                    ALP Metrics Report <span className="text-gray-400">(Optional)</span>
                  </label>
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

          {/* Notion-style Results Section */}
          <div className="lg:col-span-3">
            <div className="sticky top-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Recommendations</h2>

              {!recommendations && !isGenerating && (
                <div className="text-center py-16 px-6">
                  <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <AlertCircle className="h-6 w-6 text-gray-400" />
                  </div>
                  <h3 className="text-sm font-medium text-gray-900 mb-1">Ready to analyze</h3>
                  <p className="text-sm text-gray-500">Complete the form to receive personalized course recommendations</p>
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
                  {/* Explanation */}
                  <div className="border border-gray-200 rounded-md p-4">
                    <h3 className="text-sm font-medium text-gray-900 mb-3">Recommendation rationale</h3>
                    <div className="space-y-2 text-sm text-gray-600">
                      <p><span className="font-medium text-gray-900">Understanding Cooperatives:</span> Essential foundation for stakeholder governance and organizational structures</p>
                      <p><span className="font-medium text-gray-900">Bookkeeping Ledgers:</span> Addresses financial management challenges identified in your focus areas</p>
                      <p><span className="font-medium text-gray-900">Operations:</span> Critical for achieving your expected implementation and improvement outcomes</p>
                    </div>
                  </div>

                  {/* Learning Paths */}
                  <div className="space-y-4">
                    {Object.entries(learningPaths).map(([pathName, categories]) => (
                      <div key={pathName}>
                        <h3 className="text-sm font-medium text-gray-900 mb-3">{pathName}</h3>
                        <div className="space-y-2">
                          {Object.entries(categories).map(([categoryName, categoryData]) => {
                            const categoryId = categoryName.toLowerCase().replace(/[^a-z0-9]/g, '-');
                            const isSelected = selectedCourses[categoryId];
                            const isRecommended = categoryId === 'understanding-cooperatives' || 
                                                categoryId === 'bookkeeping-ledgers' || 
                                                categoryId === 'operations';
                            
                            return (
                              <div 
                                key={categoryName} 
                                className={`border rounded-md p-4 cursor-pointer transition-all hover:shadow-sm ${
                                  isSelected 
                                    ? 'border-blue-300 bg-blue-50' 
                                    : 'border-gray-200 hover:border-gray-300'
                                }`}
                                onClick={() => toggleCourse(categoryId)}
                              >
                                <div className="flex items-start space-x-3">
                                  <div className="mt-0.5">
                                    <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                                      isSelected ? 'bg-blue-500 border-blue-500' : 'border-gray-300'
                                    }`}>
                                      {isSelected && <div className="w-1.5 h-1.5 bg-white rounded-sm"></div>}
                                    </div>
                                  </div>
                                  
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between mb-2">
                                      <div className="flex items-center space-x-2">
                                        <h4 className="text-sm font-medium text-gray-900">{categoryName}</h4>
                                        {isRecommended && (
                                          <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-800 rounded">
                                            <Sparkles className="w-3 h-3 mr-1" />
                                            AI Pick
                                          </span>
                                        )}
                                      </div>
                                      <ChevronRight className="w-4 h-4 text-gray-400" />
                                    </div>
                                    
                                    <div className="flex items-center space-x-4 text-xs text-gray-500 mb-3">
                                      <span className="flex items-center">
                                        <Users className="w-3 h-3 mr-1" />
                                        {categoryData.level}
                                      </span>
                                    </div>
                                    
                                    <div className="flex flex-wrap gap-1">
                                      {categoryData.courses.map((courseName, idx) => (
                                        <span 
                                          key={idx} 
                                          className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded"
                                        >
                                          {courseName}
                                        </span>
                                      ))}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Additional Recommendations */}
                  <div className="border border-orange-200 rounded-md p-4 bg-orange-50">
                    <h3 className="text-sm font-medium text-orange-900 mb-3">Additional course development</h3>
                    <div className="space-y-3 text-sm text-orange-800">
                      <div>
                        <h4 className="font-medium">Context-specific training modules</h4>
                        <p className="text-xs mt-1">Specialized content addressing your specific focus areas and business constraints</p>
                      </div>
                      <div>
                        <h4 className="font-medium">Performance monitoring framework</h4>
                        <p className="text-xs mt-1">Training on tracking implementation rates and measuring outcomes aligned with your expected results</p>
                      </div>
                    </div>
                  </div>

                  {/* Export */}
                  <div className="flex space-x-2 pt-2">
                    <button
                      onClick={exportToPDF}
                      disabled={Object.keys(selectedCourses).filter(id => selectedCourses[id]).length === 0}
                      className="flex-1 py-2 px-4 bg-gray-900 text-white text-sm font-medium rounded-md hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Export
                    </button>
                    
                    <button
                      onClick={() => {
                        setSelectedCourses({
                          'understanding-cooperatives': true,
                          'bookkeeping-ledgers': true,
                          'operations': true
                        });
                      }}
                      className="px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-50 transition-colors"
                    >
                      Reset
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SimplifiedALPPrototype;