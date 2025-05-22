import React from 'react';
import { Separator } from '@/components/ui/separator';
import { ShieldCheck, AlertTriangle, Check, X, HelpCircle } from 'lucide-react';

const SphereComparison: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">SafeSphere vs OpenSphere</h1>
      <p className="text-lg text-gray-700 mb-8">
        DasWos operates with two distinct environments: SafeSphere and OpenSphere. Understanding the 
        differences between these environments will help you navigate our platform more effectively.
      </p>
      
      <Separator className="my-6" />
      
      <section className="mb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-green-50 p-6 rounded-lg border-t-4 border-green-500">
            <div className="flex items-center mb-4">
              <ShieldCheck className="w-8 h-8 text-green-600 mr-3" />
              <h2 className="text-2xl font-semibold text-green-800">SafeSphere</h2>
            </div>
            <p className="mb-6 text-gray-700">
              Our trust-verified environment where all content and products have undergone rigorous 
              verification procedures to ensure reliability and trustworthiness.
            </p>
            <div className="space-y-3">
              <div className="flex items-center">
                <Check className="w-5 h-5 text-green-600 mr-2" />
                <p className="text-gray-700">Strict verification standards</p>
              </div>
              <div className="flex items-center">
                <Check className="w-5 h-5 text-green-600 mr-2" />
                <p className="text-gray-700">Identity-verified sellers</p>
              </div>
              <div className="flex items-center">
                <Check className="w-5 h-5 text-green-600 mr-2" />
                <p className="text-gray-700">Fact-checked information</p>
              </div>
              <div className="flex items-center">
                <Check className="w-5 h-5 text-green-600 mr-2" />
                <p className="text-gray-700">Enhanced buyer protection</p>
              </div>
              <div className="flex items-center">
                <Check className="w-5 h-5 text-green-600 mr-2" />
                <p className="text-gray-700">Regular monitoring and updates</p>
              </div>
            </div>
          </div>
          
          <div className="bg-amber-50 p-6 rounded-lg border-t-4 border-amber-500">
            <div className="flex items-center mb-4">
              <AlertTriangle className="w-8 h-8 text-amber-600 mr-3" />
              <h2 className="text-2xl font-semibold text-amber-800">OpenSphere</h2>
            </div>
            <p className="mb-6 text-gray-700">
              A more open environment where content and products have not necessarily completed our 
              full verification process, allowing for a wider range of options with transparent 
              trust indicators.
            </p>
            <div className="space-y-3">
              <div className="flex items-center">
                <Check className="w-5 h-5 text-amber-600 mr-2" />
                <p className="text-gray-700">Basic verification checks</p>
              </div>
              <div className="flex items-center">
                <Check className="w-5 h-5 text-amber-600 mr-2" />
                <p className="text-gray-700">Transparent trust indicators</p>
              </div>
              <div className="flex items-center">
                <Check className="w-5 h-5 text-amber-600 mr-2" />
                <p className="text-gray-700">Wider range of options</p>
              </div>
              <div className="flex items-center">
                <X className="w-5 h-5 text-red-500 mr-2" />
                <p className="text-gray-700">Limited buyer protection</p>
              </div>
              <div className="flex items-center">
                <X className="w-5 h-5 text-red-500 mr-2" />
                <p className="text-gray-700">Not fully fact-checked</p>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-6">Detailed Comparison</h2>
        
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200 rounded-lg">
            <thead>
              <tr className="bg-gray-100">
                <th className="py-3 px-4 text-left border-b border-gray-200 w-1/3">Feature</th>
                <th className="py-3 px-4 text-center border-b border-gray-200 w-1/3">
                  <div className="flex items-center justify-center">
                    <ShieldCheck className="w-5 h-5 text-green-600 mr-2" />
                    <span>SafeSphere</span>
                  </div>
                </th>
                <th className="py-3 px-4 text-center border-b border-gray-200 w-1/3">
                  <div className="flex items-center justify-center">
                    <AlertTriangle className="w-5 h-5 text-amber-600 mr-2" />
                    <span>OpenSphere</span>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="py-3 px-4 border-b border-gray-200 font-medium">Seller Verification</td>
                <td className="py-3 px-4 border-b border-gray-200 text-center">
                  Complete identity verification including business registration, address verification,
                  and compliance checks
                </td>
                <td className="py-3 px-4 border-b border-gray-200 text-center">
                  Basic verification with email confirmation and terms acceptance
                </td>
              </tr>
              <tr>
                <td className="py-3 px-4 border-b border-gray-200 font-medium">Product Verification</td>
                <td className="py-3 px-4 border-b border-gray-200 text-center">
                  Thorough review of product descriptions, specifications, and sample testing when applicable
                </td>
                <td className="py-3 px-4 border-b border-gray-200 text-center">
                  Basic review of product listings for policy compliance
                </td>
              </tr>
              <tr>
                <td className="py-3 px-4 border-b border-gray-200 font-medium">Information Quality</td>
                <td className="py-3 px-4 border-b border-gray-200 text-center">
                  Fact-checked by our team with verified sources and references
                </td>
                <td className="py-3 px-4 border-b border-gray-200 text-center">
                  Not fact-checked; source credibility is indicated through Trust Score
                </td>
              </tr>
              <tr>
                <td className="py-3 px-4 border-b border-gray-200 font-medium">Buyer Protection</td>
                <td className="py-3 px-4 border-b border-gray-200 text-center">
                  Enhanced protection with money-back guarantee and dispute resolution assistance
                </td>
                <td className="py-3 px-4 border-b border-gray-200 text-center">
                  Standard protection with basic dispute resolution options
                </td>
              </tr>
              <tr>
                <td className="py-3 px-4 border-b border-gray-200 font-medium">Trust Score Requirement</td>
                <td className="py-3 px-4 border-b border-gray-200 text-center">
                  Minimum Trust Score of 75
                </td>
                <td className="py-3 px-4 border-b border-gray-200 text-center">
                  No minimum requirement, but scores are displayed transparently
                </td>
              </tr>
              <tr>
                <td className="py-3 px-4 border-b border-gray-200 font-medium">Monitoring Frequency</td>
                <td className="py-3 px-4 border-b border-gray-200 text-center">
                  Regular monitoring and periodic re-verification
                </td>
                <td className="py-3 px-4 border-b border-gray-200 text-center">
                  Monitoring based on user reports and random checks
                </td>
              </tr>
              <tr>
                <td className="py-3 px-4 border-b border-gray-200 font-medium">Cost for Sellers</td>
                <td className="py-3 px-4 border-b border-gray-200 text-center">
                  Higher commission rates and verification fees
                </td>
                <td className="py-3 px-4 border-b border-gray-200 text-center">
                  Standard commission rates with no verification fees
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
      
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-6">When to Use Each Sphere</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="border border-gray-200 p-6 rounded-lg">
            <h3 className="text-xl font-semibold mb-4 text-green-700">
              When to Use SafeSphere
            </h3>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li>When trust and reliability are your top priorities</li>
              <li>For purchasing high-value items</li>
              <li>When researching critical information (health, finance, etc.)</li>
              <li>For business or professional use cases</li>
              <li>When security and buyer protection are essential</li>
            </ul>
          </div>
          
          <div className="border border-gray-200 p-6 rounded-lg">
            <h3 className="text-xl font-semibold mb-4 text-amber-700">
              When to Use OpenSphere
            </h3>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li>When you want to explore a wider range of options</li>
              <li>For purchasing lower-value items where risk is minimal</li>
              <li>When seeking diverse perspectives on non-critical topics</li>
              <li>If you're willing to do additional verification yourself</li>
              <li>For discovering new sellers and information sources</li>
            </ul>
          </div>
        </div>
      </section>
      
      <section>
        <h2 className="text-2xl font-semibold mb-6">Frequently Asked Questions</h2>
        
        <div className="space-y-6">
          <div className="border border-gray-200 p-5 rounded-lg">
            <div className="flex items-start">
              <HelpCircle className="w-6 h-6 text-blue-600 mr-3 mt-0.5" />
              <div>
                <h3 className="font-medium mb-2">Can a product or seller move from OpenSphere to SafeSphere?</h3>
                <p className="text-gray-700">
                  Yes. Products and sellers can move from OpenSphere to SafeSphere by completing our full 
                  verification process and meeting the required Trust Score threshold. Some move through 
                  this process automatically as they build a positive track record.
                </p>
              </div>
            </div>
          </div>
          
          <div className="border border-gray-200 p-5 rounded-lg">
            <div className="flex items-start">
              <HelpCircle className="w-6 h-6 text-blue-600 mr-3 mt-0.5" />
              <div>
                <h3 className="font-medium mb-2">Is OpenSphere content unsafe or untrustworthy?</h3>
                <p className="text-gray-700">
                  Not necessarily. OpenSphere content simply hasn't completed our full verification process. 
                  Many OpenSphere items have good Trust Scores and are reliable. We provide transparent 
                  indicators to help you make informed decisions.
                </p>
              </div>
            </div>
          </div>
          
          <div className="border border-gray-200 p-5 rounded-lg">
            <div className="flex items-start">
              <HelpCircle className="w-6 h-6 text-blue-600 mr-3 mt-0.5" />
              <div>
                <h3 className="font-medium mb-2">Can I search both spheres simultaneously?</h3>
                <p className="text-gray-700">
                  Yes. By default, our search results include items from both spheres, clearly labeled 
                  with their respective verification status. You can also filter results to show only 
                  SafeSphere or only OpenSphere items.
                </p>
              </div>
            </div>
          </div>
          
          <div className="border border-gray-200 p-5 rounded-lg">
            <div className="flex items-start">
              <HelpCircle className="w-6 h-6 text-blue-600 mr-3 mt-0.5" />
              <div>
                <h3 className="font-medium mb-2">What happens if a SafeSphere seller or product no longer meets the criteria?</h3>
                <p className="text-gray-700">
                  If a SafeSphere seller or product falls below our standards, it will be moved to OpenSphere 
                  until the issues are addressed. We monitor SafeSphere content continuously to maintain quality.
                </p>
              </div>
            </div>
          </div>
          
          <div className="border border-gray-200 p-5 rounded-lg">
            <div className="flex items-start">
              <HelpCircle className="w-6 h-6 text-blue-600 mr-3 mt-0.5" />
              <div>
                <h3 className="font-medium mb-2">Do BulkBuy products have special sphere requirements?</h3>
                <p className="text-gray-700">
                  BulkBuy products are available in both spheres. SafeSphere BulkBuy products undergo 
                  additional verification for bulk purchasing, while OpenSphere BulkBuy products meet 
                  basic requirements but have not completed full verification.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default SphereComparison;