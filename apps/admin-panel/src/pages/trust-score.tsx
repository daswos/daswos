import React from 'react';
import { Separator } from '@/components/ui/separator';
import { ShieldCheck, Award, BarChart, FileText, UserCheck, Clock, AlertTriangle } from 'lucide-react';

const TrustScore: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Trust Score Explained</h1>
      <p className="text-lg text-gray-700 mb-8">
        Our Trust Score system is designed to help you make informed decisions by providing a reliable 
        measure of trustworthiness for information, products, and sellers on our platform.
      </p>
      
      <Separator className="my-6" />
      
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-6">What is the Trust Score?</h2>
        
        <div className="bg-blue-50 p-6 rounded-lg mb-8">
          <div className="flex items-center mb-4">
            <ShieldCheck className="w-8 h-8 text-blue-600 mr-3" />
            <h3 className="text-xl font-semibold">Definition</h3>
          </div>
          <p className="mb-4">
            The Trust Score is a numerical rating from 0 to 100 that indicates the level of trustworthiness 
            of content, products, or sellers on the DasWos platform. It's calculated using our proprietary 
            algorithm that evaluates multiple factors.
          </p>
          <p>
            A higher Trust Score indicates a greater level of trustworthiness based on our verification process 
            and user feedback. It helps you quickly identify reliable sources and make confident decisions.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gray-50 p-5 rounded-lg">
            <div className="flex items-center mb-3">
              <FileText className="w-6 h-6 text-gray-700 mr-2" />
              <h4 className="font-medium">Information Trust Score</h4>
            </div>
            <p className="text-sm text-gray-600">
              Evaluates the reliability of information sources, factual accuracy, and verification status.
            </p>
          </div>
          
          <div className="bg-gray-50 p-5 rounded-lg">
            <div className="flex items-center mb-3">
              <Award className="w-6 h-6 text-gray-700 mr-2" />
              <h4 className="font-medium">Product Trust Score</h4>
            </div>
            <p className="text-sm text-gray-600">
              Assesses product quality, description accuracy, customer satisfaction, and compliance with standards.
            </p>
          </div>
          
          <div className="bg-gray-50 p-5 rounded-lg">
            <div className="flex items-center mb-3">
              <UserCheck className="w-6 h-6 text-gray-700 mr-2" />
              <h4 className="font-medium">Seller Trust Score</h4>
            </div>
            <p className="text-sm text-gray-600">
              Measures seller verification status, transaction history, customer service quality, and reliability.
            </p>
          </div>
        </div>
      </section>
      
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-6">How Trust Scores Are Calculated</h2>
        
        <div className="border border-gray-200 p-6 rounded-lg mb-8">
          <div className="flex items-center mb-4">
            <BarChart className="w-8 h-8 text-indigo-600 mr-3" />
            <h3 className="text-xl font-semibold">Trust Score Factors</h3>
          </div>
          <p className="mb-6">
            Our algorithm evaluates multiple factors to determine Trust Scores. While the specific weights 
            and formulas are proprietary, here are the key factors we consider:
          </p>
          
          <div className="space-y-4">
            <div className="flex">
              <div className="flex-shrink-0 mt-1 mr-4">
                <div className="bg-green-100 rounded-full p-2">
                  <ShieldCheck className="w-5 h-5 text-green-600" />
                </div>
              </div>
              <div>
                <h4 className="font-medium mb-1">Verification Status</h4>
                <p className="text-gray-600">
                  Whether the item has completed our verification process and at what level.
                  SafeSphere-verified content receives higher scores.
                </p>
              </div>
            </div>
            
            <div className="flex">
              <div className="flex-shrink-0 mt-1 mr-4">
                <div className="bg-blue-100 rounded-full p-2">
                  <UserCheck className="w-5 h-5 text-blue-600" />
                </div>
              </div>
              <div>
                <h4 className="font-medium mb-1">User Feedback</h4>
                <p className="text-gray-600">
                  Ratings, reviews, and feedback from users who have interacted with the information,
                  product, or seller.
                </p>
              </div>
            </div>
            
            <div className="flex">
              <div className="flex-shrink-0 mt-1 mr-4">
                <div className="bg-purple-100 rounded-full p-2">
                  <Clock className="w-5 h-5 text-purple-600" />
                </div>
              </div>
              <div>
                <h4 className="font-medium mb-1">Historical Performance</h4>
                <p className="text-gray-600">
                  Track record over time, including consistency in quality and reliability.
                </p>
              </div>
            </div>
            
            <div className="flex">
              <div className="flex-shrink-0 mt-1 mr-4">
                <div className="bg-amber-100 rounded-full p-2">
                  <AlertTriangle className="w-5 h-5 text-amber-600" />
                </div>
              </div>
              <div>
                <h4 className="font-medium mb-1">Compliance</h4>
                <p className="text-gray-600">
                  Adherence to DasWos policies, industry standards, and legal requirements.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-6">Trust Score Ranges</h2>
        
        <div className="space-y-6">
          <div className="flex">
            <div className="flex-shrink-0 w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mr-6">
              <span className="text-green-800 font-bold text-xl">90-100</span>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-green-700 mb-2">Excellent Trust</h3>
              <p className="text-gray-700">
                Items with scores in this range have completed our most rigorous verification process and 
                have consistently demonstrated the highest levels of trustworthiness. These are typically 
                SafeSphere-verified with exceptional user ratings.
              </p>
            </div>
          </div>
          
          <div className="flex">
            <div className="flex-shrink-0 w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mr-6">
              <span className="text-blue-800 font-bold text-xl">75-89</span>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-blue-700 mb-2">High Trust</h3>
              <p className="text-gray-700">
                These items have completed verification and have good track records. They are generally 
                reliable and have received positive user feedback.
              </p>
            </div>
          </div>
          
          <div className="flex">
            <div className="flex-shrink-0 w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mr-6">
              <span className="text-yellow-800 font-bold text-xl">50-74</span>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-yellow-700 mb-2">Moderate Trust</h3>
              <p className="text-gray-700">
                Items in this range may be in the process of verification or have mixed user feedback. 
                They might be newer to the platform or have some inconsistencies in their performance.
              </p>
            </div>
          </div>
          
          <div className="flex">
            <div className="flex-shrink-0 w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mr-6">
              <span className="text-orange-800 font-bold text-xl">25-49</span>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-orange-700 mb-2">Low Trust</h3>
              <p className="text-gray-700">
                These items have not completed verification or have received negative feedback. 
                Approach with caution and do additional research before making decisions.
              </p>
            </div>
          </div>
          
          <div className="flex">
            <div className="flex-shrink-0 w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mr-6">
              <span className="text-red-800 font-bold text-xl">0-24</span>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-red-700 mb-2">Very Low Trust</h3>
              <p className="text-gray-700">
                Items with scores in this range have significant issues with reliability, accuracy, 
                or compliance. We recommend extreme caution and thorough research before engagement.
              </p>
            </div>
          </div>
        </div>
      </section>
      
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-6">How to Use Trust Scores</h2>
        
        <div className="bg-gray-50 p-6 rounded-lg">
          <p className="mb-4">
            The Trust Score is designed to be one factor in your decision-making process. Here's how to use it effectively:
          </p>
          
          <ul className="list-disc pl-6 space-y-2">
            <li>
              <strong>Compare Scores:</strong> Use Trust Scores to compare similar information sources or products.
            </li>
            <li>
              <strong>Consider Your Risk Tolerance:</strong> Depending on your personal risk tolerance, you might 
              set a minimum Trust Score threshold for your interactions.
            </li>
            <li>
              <strong>Look Beyond the Score:</strong> While Trust Scores provide a quick assessment, always review 
              the detailed verification information and user reviews for a complete picture.
            </li>
            <li>
              <strong>Report Discrepancies:</strong> If you believe a Trust Score does not accurately reflect your 
              experience, please report it to help us improve our system.
            </li>
          </ul>
        </div>
      </section>
      
      <section>
        <h2 className="text-2xl font-semibold mb-6">Trust Score Updates</h2>
        
        <p className="mb-4">
          Trust Scores are not static and can change over time based on new information, user feedback, 
          and ongoing verification processes. We update scores regularly to ensure they reflect current 
          trustworthiness levels.
        </p>
        
        <div className="border border-gray-200 p-6 rounded-lg">
          <h3 className="text-xl font-semibold mb-4">Common Reasons for Score Changes</h3>
          
          <ul className="list-disc pl-6 space-y-2">
            <li>Completion of additional verification steps</li>
            <li>New user reviews and feedback</li>
            <li>Changes in compliance status</li>
            <li>Resolution of previously reported issues</li>
            <li>Improved performance over time</li>
          </ul>
        </div>
      </section>
    </div>
  );
};

export default TrustScore;