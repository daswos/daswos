import React from 'react';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Link, useLocation } from 'wouter';
import { 
  ShieldCheck, 
  ClipboardCheck, 
  UserCheck, 
  Building, 
  ExternalLink, 
  Award, 
  BarChart4,
  Clock,
  BadgeCheck, 
  Tag,
  HandCoins
} from 'lucide-react';

const VerificationProcess: React.FC = () => {
  const [, navigate] = useLocation();

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Seller Verification Process</h1>
      <p className="text-lg text-gray-700 mb-8">
        Our comprehensive verification process ensures that only legitimate, trustworthy sellers can operate 
        in SafeSphere. Learn about the steps required to become a verified seller on DasWos.
      </p>
      
      <Separator className="my-6" />
      
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-6">Why Get Verified?</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <div className="flex items-center mb-4">
              <div className="bg-green-100 p-3 rounded-full mr-4">
                <UserCheck className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="font-semibold text-lg">Build Trust</h3>
            </div>
            <p className="text-gray-600">
              Verification badges signal to buyers that you're a legitimate, trustworthy seller who has passed our rigorous checks.
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <div className="flex items-center mb-4">
              <div className="bg-blue-100 p-3 rounded-full mr-4">
                <BarChart4 className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-lg">Increase Sales</h3>
            </div>
            <p className="text-gray-600">
              Verified sellers see up to 75% higher conversion rates and significantly more traffic to their listings.
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <div className="flex items-center mb-4">
              <div className="bg-purple-100 p-3 rounded-full mr-4">
                <Award className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="font-semibold text-lg">Premium Features</h3>
            </div>
            <p className="text-gray-600">
              Gain access to SafeSphere placement, advanced analytics, and premium selling tools only available to verified sellers.
            </p>
          </div>
        </div>
      </section>
      
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-6">Verification Levels</h2>
        
        <div className="space-y-8">
          <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
            <div className="flex flex-col md:flex-row md:items-center mb-6">
              <div className="flex items-center mb-4 md:mb-0 md:mr-6">
                <Badge type="basic" />
                <h3 className="text-xl font-semibold ml-3">Basic Verification</h3>
              </div>
              <span className="bg-blue-100 text-blue-800 text-xs font-medium px-3 py-1 rounded-full">
                Required for OpenSphere
              </span>
            </div>
            
            <div className="space-y-4">
              <p className="text-gray-700">
                The entry-level verification that confirms basic account details and contact information.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0 mt-1">
                    <ClipboardCheck className="h-5 w-5 text-green-500" />
                  </div>
                  <div className="ml-3">
                    <h4 className="text-sm font-medium">Requirements</h4>
                    <ul className="mt-1 text-sm text-gray-600 list-disc pl-5 space-y-1">
                      <li>Valid email address verification</li>
                      <li>Phone number verification</li>
                      <li>Acceptance of seller terms</li>
                      <li>Creation of seller profile</li>
                    </ul>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="flex-shrink-0 mt-1">
                    <Tag className="h-5 w-5 text-green-500" />
                  </div>
                  <div className="ml-3">
                    <h4 className="text-sm font-medium">Benefits</h4>
                    <ul className="mt-1 text-sm text-gray-600 list-disc pl-5 space-y-1">
                      <li>Ability to list products in OpenSphere</li>
                      <li>Access to basic seller tools</li>
                      <li>Standard commission rates</li>
                      <li>Basic analytics dashboard</li>
                    </ul>
                  </div>
                </div>
              </div>
              
              <div className="bg-blue-50 p-4 rounded-md">
                <p className="text-sm text-blue-700">
                  <strong>Processing Time:</strong> Almost immediate (automatic verification)
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
            <div className="flex flex-col md:flex-row md:items-center mb-6">
              <div className="flex items-center mb-4 md:mb-0 md:mr-6">
                <Badge type="identity" />
                <h3 className="text-xl font-semibold ml-3">Identity Verification</h3>
              </div>
              <span className="bg-green-100 text-green-800 text-xs font-medium px-3 py-1 rounded-full">
                Required for SafeSphere (Personal)
              </span>
            </div>
            
            <div className="space-y-4">
              <p className="text-gray-700">
                Confirms your personal identity through official documentation and additional checks.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0 mt-1">
                    <ClipboardCheck className="h-5 w-5 text-green-500" />
                  </div>
                  <div className="ml-3">
                    <h4 className="text-sm font-medium">Requirements</h4>
                    <ul className="mt-1 text-sm text-gray-600 list-disc pl-5 space-y-1">
                      <li>Basic verification completion</li>
                      <li>Government-issued ID verification</li>
                      <li>Address verification</li>
                      <li>Video verification call</li>
                      <li>Minimum of 5 product listings</li>
                    </ul>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="flex-shrink-0 mt-1">
                    <Tag className="h-5 w-5 text-green-500" />
                  </div>
                  <div className="ml-3">
                    <h4 className="text-sm font-medium">Benefits</h4>
                    <ul className="mt-1 text-sm text-gray-600 list-disc pl-5 space-y-1">
                      <li>Ability to list products in SafeSphere</li>
                      <li>Identity verification badge</li>
                      <li>Higher product visibility</li>
                      <li>Lower commission rates</li>
                      <li>Priority customer support</li>
                    </ul>
                  </div>
                </div>
              </div>
              
              <div className="bg-blue-50 p-4 rounded-md">
                <p className="text-sm text-blue-700">
                  <strong>Processing Time:</strong> 1-3 business days
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
            <div className="flex flex-col md:flex-row md:items-center mb-6">
              <div className="flex items-center mb-4 md:mb-0 md:mr-6">
                <Badge type="business" />
                <h3 className="text-xl font-semibold ml-3">Business Verification</h3>
              </div>
              <span className="bg-green-100 text-green-800 text-xs font-medium px-3 py-1 rounded-full">
                Required for SafeSphere (Business)
              </span>
            </div>
            
            <div className="space-y-4">
              <p className="text-gray-700">
                Comprehensive verification for established businesses, confirming legal entity status, business operations, and compliance.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0 mt-1">
                    <ClipboardCheck className="h-5 w-5 text-green-500" />
                  </div>
                  <div className="ml-3">
                    <h4 className="text-sm font-medium">Requirements</h4>
                    <ul className="mt-1 text-sm text-gray-600 list-disc pl-5 space-y-1">
                      <li>Identity verification completion</li>
                      <li>Business registration documents</li>
                      <li>Tax identification verification</li>
                      <li>Business address verification</li>
                      <li>Business bank account verification</li>
                      <li>Proof of operations (invoices, etc.)</li>
                    </ul>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="flex-shrink-0 mt-1">
                    <Tag className="h-5 w-5 text-green-500" />
                  </div>
                  <div className="ml-3">
                    <h4 className="text-sm font-medium">Benefits</h4>
                    <ul className="mt-1 text-sm text-gray-600 list-disc pl-5 space-y-1">
                      <li>Business verification badge</li>
                      <li>Highest product visibility</li>
                      <li>Lowest commission rates</li>
                      <li>Access to BulkBuy program</li>
                      <li>Advanced analytics and reporting</li>
                      <li>Dedicated account manager</li>
                    </ul>
                  </div>
                </div>
              </div>
              
              <div className="bg-blue-50 p-4 rounded-md">
                <p className="text-sm text-blue-700">
                  <strong>Processing Time:</strong> 5-7 business days
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-6">Verification Steps</h2>
        
        <div className="relative">
          <div className="absolute left-5 inset-y-0 w-0.5 bg-gray-200"></div>
          
          <div className="space-y-12">
            <div className="relative">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-blue-500 text-white font-bold rounded-full w-10 h-10 flex items-center justify-center z-10">
                  1
                </div>
                <div className="ml-6">
                  <h3 className="text-lg font-medium mb-2">Account Creation</h3>
                  <p className="text-gray-600 mb-3">
                    Sign up for a DasWos account and complete your basic profile information. You'll need a valid 
                    email address and phone number.
                  </p>
                  <div className="bg-gray-100 p-3 rounded-md text-sm">
                    <p className="text-gray-700">
                      <strong>Tip:</strong> Use a business email domain if possible, as this can improve your verification score.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="relative">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-blue-500 text-white font-bold rounded-full w-10 h-10 flex items-center justify-center z-10">
                  2
                </div>
                <div className="ml-6">
                  <h3 className="text-lg font-medium mb-2">Basic Verification</h3>
                  <p className="text-gray-600 mb-3">
                    Verify your email address and phone number through our automated system. Accept the seller 
                    terms and conditions and create your initial seller profile.
                  </p>
                  <div className="bg-gray-100 p-3 rounded-md text-sm">
                    <p className="text-gray-700">
                      <strong>Tip:</strong> Be thorough in your seller profile. Complete all optional fields for a higher verification score.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="relative">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-blue-500 text-white font-bold rounded-full w-10 h-10 flex items-center justify-center z-10">
                  3
                </div>
                <div className="ml-6">
                  <h3 className="text-lg font-medium mb-2">Document Submission</h3>
                  <p className="text-gray-600 mb-3">
                    Submit the required identity or business documents through our secure portal. For individuals, 
                    this includes government-issued ID and proof of address. For businesses, additional company 
                    documentation is required.
                  </p>
                  <div className="bg-gray-100 p-3 rounded-md text-sm">
                    <p className="text-gray-700">
                      <strong>Tip:</strong> Ensure all documents are current, clearly visible, and match the information in your profile.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="relative">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-blue-500 text-white font-bold rounded-full w-10 h-10 flex items-center justify-center z-10">
                  4
                </div>
                <div className="ml-6">
                  <h3 className="text-lg font-medium mb-2">Verification Review</h3>
                  <p className="text-gray-600 mb-3">
                    Our verification team reviews your application and documents. For business verification, 
                    we may conduct additional background checks on your company.
                  </p>
                  <div className="bg-gray-100 p-3 rounded-md text-sm">
                    <p className="text-gray-700">
                      <strong>Tip:</strong> Be responsive to any additional information requests to avoid delays in processing.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="relative">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-blue-500 text-white font-bold rounded-full w-10 h-10 flex items-center justify-center z-10">
                  5
                </div>
                <div className="ml-6">
                  <h3 className="text-lg font-medium mb-2">Verification Call</h3>
                  <p className="text-gray-600 mb-3">
                    For higher verification levels, participate in a brief video call with our verification team 
                    to confirm your identity and discuss your selling plans.
                  </p>
                  <div className="bg-gray-100 p-3 rounded-md text-sm">
                    <p className="text-gray-700">
                      <strong>Tip:</strong> Prepare to discuss your products, business model, and selling experience for a smoother call.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="relative">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-blue-500 text-white font-bold rounded-full w-10 h-10 flex items-center justify-center z-10">
                  6
                </div>
                <div className="ml-6">
                  <h3 className="text-lg font-medium mb-2">Verification Approval</h3>
                  <p className="text-gray-600 mb-3">
                    Once approved, your verification badge will appear on your profile and listings. You'll gain 
                    access to the appropriate sphere and seller features.
                  </p>
                  <div className="bg-gray-100 p-3 rounded-md text-sm">
                    <p className="text-gray-700">
                      <strong>Tip:</strong> After approval, complete your seller onboarding training to maximize your success.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-6">Maintaining Your Verification</h2>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 mb-6">
          <p className="mb-4 text-gray-700">
            Verification is not permanent and requires maintaining good standing on our platform:
          </p>
          
          <ul className="list-disc pl-6 space-y-2 text-gray-700">
            <li>Regular document updates when your identification or business documents expire</li>
            <li>Maintaining minimum customer satisfaction ratings (varies by verification level)</li>
            <li>Compliance with all DasWos seller policies</li>
            <li>Timely responses to customer inquiries and issues</li>
            <li>Annual verification renewal process</li>
          </ul>
        </div>
        
        <div className="bg-amber-50 p-5 border-l-4 border-amber-500 rounded-md">
          <div className="flex">
            <div className="flex-shrink-0">
              <Clock className="h-5 w-5 text-amber-500" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-amber-800">Verification Renewal</h3>
              <div className="mt-2 text-sm text-amber-700">
                <p>
                  Your verification will require annual renewal. We'll notify you 30 days before expiration 
                  with instructions for a simplified renewal process.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-6">Pricing</h2>
        
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200 rounded-md">
            <thead>
              <tr className="bg-gray-50">
                <th className="py-3 px-4 text-left border-b border-gray-200">Verification Level</th>
                <th className="py-3 px-4 text-center border-b border-gray-200">One-time Fee</th>
                <th className="py-3 px-4 text-center border-b border-gray-200">Annual Renewal</th>
                <th className="py-3 px-4 text-center border-b border-gray-200">Commission Rate</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="py-3 px-4 border-b border-gray-200">
                  <div className="flex items-center">
                    <Badge type="basic" small />
                    <span className="ml-2">Basic Verification</span>
                  </div>
                </td>
                <td className="py-3 px-4 border-b border-gray-200 text-center">Free</td>
                <td className="py-3 px-4 border-b border-gray-200 text-center">Free</td>
                <td className="py-3 px-4 border-b border-gray-200 text-center">12%</td>
              </tr>
              <tr>
                <td className="py-3 px-4 border-b border-gray-200">
                  <div className="flex items-center">
                    <Badge type="identity" small />
                    <span className="ml-2">Identity Verification</span>
                  </div>
                </td>
                <td className="py-3 px-4 border-b border-gray-200 text-center">€49.99</td>
                <td className="py-3 px-4 border-b border-gray-200 text-center">€29.99</td>
                <td className="py-3 px-4 border-b border-gray-200 text-center">9%</td>
              </tr>
              <tr>
                <td className="py-3 px-4 border-b border-gray-200">
                  <div className="flex items-center">
                    <Badge type="business" small />
                    <span className="ml-2">Business Verification</span>
                  </div>
                </td>
                <td className="py-3 px-4 border-b border-gray-200 text-center">€99.99</td>
                <td className="py-3 px-4 border-b border-gray-200 text-center">€49.99</td>
                <td className="py-3 px-4 border-b border-gray-200 text-center">7%</td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <p className="mt-4 text-sm text-gray-600 italic">
          * Commission rates may vary based on product category and sales volume. 
          See <Link href="/pricing" className="text-blue-600 hover:underline">Pricing & Fees</Link> for complete details.
        </p>
      </section>
      
      <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 mb-6 text-center">
        <h2 className="text-xl font-semibold mb-3">Ready to become a verified seller?</h2>
        <p className="mb-6 text-gray-700">
          Start your verification process today and join thousands of trusted sellers on DasWos.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Button 
            size="lg" 
            onClick={() => navigate("/seller-verification")}
            className="bg-black text-white hover:bg-gray-800"
          >
            <ShieldCheck className="mr-2 h-5 w-5" />
            Start Verification
          </Button>
          <Button 
            variant="outline" 
            size="lg"
            onClick={() => navigate("/pricing")}
          >
            <HandCoins className="mr-2 h-5 w-5" />
            View Pricing Details
          </Button>
        </div>
      </div>
      
      <p className="text-sm text-gray-600 text-center">
        Have questions about the verification process? 
        <Link href="/contact" className="text-blue-600 hover:underline ml-1">
          Contact our seller support team
        </Link>
      </p>
    </div>
  );
};

// Badge component for verification levels
const Badge = ({ type, small = false }: { type: 'basic' | 'identity' | 'business', small?: boolean }) => {
  let bgColor, textColor, icon;
  
  switch (type) {
    case 'basic':
      bgColor = 'bg-blue-100';
      textColor = 'text-blue-700';
      icon = <UserCheck className={small ? 'h-4 w-4' : 'h-5 w-5'} />;
      break;
    case 'identity':
      bgColor = 'bg-green-100';
      textColor = 'text-green-700';
      icon = <BadgeCheck className={small ? 'h-4 w-4' : 'h-5 w-5'} />;
      break;
    case 'business':
      bgColor = 'bg-purple-100';
      textColor = 'text-purple-700';
      icon = <Building className={small ? 'h-4 w-4' : 'h-5 w-5'} />;
      break;
  }
  
  return (
    <div className={`${bgColor} ${textColor} ${small ? 'p-1' : 'p-2'} rounded-full`}>
      {icon}
    </div>
  );
};

export default VerificationProcess;