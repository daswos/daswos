import React from 'react';
import { Separator } from '@/components/ui/separator';
import { Link } from 'wouter';
import { Search, ShoppingBag, Users, ShieldCheck, TrendingUp, Layers } from 'lucide-react';

const HowItWorks: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">How DasWos Works</h1>
      <p className="text-lg text-gray-700 mb-8">
        DasWos is a trust-verified platform that helps you find reliable information and shop with confidence.
        Here's how our unique platform works.
      </p>
      
      <Separator className="my-6" />
      
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-6">Dual-Purpose Platform</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-blue-50 p-6 rounded-lg">
            <div className="flex items-center mb-4">
              <Search className="w-8 h-8 text-blue-600 mr-3" />
              <h3 className="text-xl font-semibold">Search Engine</h3>
            </div>
            <p className="mb-4">
              Our information search engine helps you find reliable, verified information on any topic.
              Content is categorized and verified to help you navigate through trustworthy sources.
            </p>
            <ul className="list-disc pl-6 text-gray-700">
              <li>Find information on any topic with confidence</li>
              <li>Sources are verified and ranked by our Trust Score system</li>
              <li>Filter results by various criteria</li>
            </ul>
          </div>
          
          <div className="bg-green-50 p-6 rounded-lg">
            <div className="flex items-center mb-4">
              <ShoppingBag className="w-8 h-8 text-green-600 mr-3" />
              <h3 className="text-xl font-semibold">Shopping Engine</h3>
            </div>
            <p className="mb-4">
              Our shopping engine connects you with trustworthy merchants and products.
              Shop with confidence knowing that sellers have been verified.
            </p>
            <ul className="list-disc pl-6 text-gray-700">
              <li>Browse products from verified sellers</li>
              <li>See Trust Scores for products and merchants</li>
              <li>Multiple purchasing options including BulkBuy</li>
            </ul>
          </div>
        </div>
      </section>
      
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-6">Trust Verification System</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="border border-gray-200 p-6 rounded-lg">
            <div className="flex items-center mb-4">
              <ShieldCheck className="w-8 h-8 text-indigo-600 mr-3" />
              <h3 className="text-xl font-semibold">SafeSphere</h3>
            </div>
            <p className="mb-4">
              Our SafeSphere environment contains information and products that have undergone 
              our rigorous verification process. When you see the SafeSphere label, you can 
              trust that it has met our highest standards.
            </p>
            <p>
              <Link href="/sphere-comparison" className="text-blue-600 hover:text-blue-800">
                Learn more about SafeSphere
              </Link>
            </p>
          </div>
          
          <div className="border border-gray-200 p-6 rounded-lg">
            <div className="flex items-center mb-4">
              <Layers className="w-8 h-8 text-amber-600 mr-3" />
              <h3 className="text-xl font-semibold">OpenSphere</h3>
            </div>
            <p className="mb-4">
              OpenSphere contains information and products that haven't completed our full 
              verification process. These items are clearly labeled, and we provide transparency 
              about their verification status so you can make informed decisions.
            </p>
            <p>
              <Link href="/sphere-comparison" className="text-blue-600 hover:text-blue-800">
                Learn more about OpenSphere
              </Link>
            </p>
          </div>
        </div>
        
        <div className="mt-8">
          <div className="flex items-center mb-4">
            <TrendingUp className="w-8 h-8 text-purple-600 mr-3" />
            <h3 className="text-xl font-semibold">Trust Score</h3>
          </div>
          <p className="mb-4">
            Our proprietary Trust Score algorithm evaluates multiple factors to assign a trustworthiness 
            rating to information, products, and sellers. Factors include verification status, user feedback, 
            history, and compliance with our standards.
          </p>
          <p>
            <Link href="/trust-score" className="text-blue-600 hover:text-blue-800">
              Learn more about our Trust Score
            </Link>
          </p>
        </div>
      </section>
      
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-6">Special Features</h2>
        
        <div className="space-y-8">
          <div className="border border-gray-200 p-6 rounded-lg">
            <div className="flex items-center mb-4">
              <Users className="w-8 h-8 text-blue-600 mr-3" />
              <h3 className="text-xl font-semibold">Collaborative Search</h3>
            </div>
            <p className="mb-4">
              Collaborative Search allows you to find and connect with others researching similar topics. 
              Together, you can create shared research spaces, contribute resources, and collectively build 
              knowledge on specific subjects.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="bg-gray-50 p-4 rounded-md">
                <h4 className="font-medium mb-2">Discover</h4>
                <p className="text-sm text-gray-600">
                  Find public collaborative searches that match your interests
                </p>
              </div>
              <div className="bg-gray-50 p-4 rounded-md">
                <h4 className="font-medium mb-2">Collaborations</h4>
                <p className="text-sm text-gray-600">
                  Manage your active collaborations with other researchers
                </p>
              </div>
              <div className="bg-gray-50 p-4 rounded-md">
                <h4 className="font-medium mb-2">My Searches</h4>
                <p className="text-sm text-gray-600">
                  View and manage searches you've created or saved
                </p>
              </div>
            </div>
            <p>
              <Link href="/collaborative-search" className="text-blue-600 hover:text-blue-800">
                Try Collaborative Search
              </Link>
            </p>
          </div>
          
          <div className="border border-gray-200 p-6 rounded-lg">
            <div className="flex items-center mb-4">
              <ShoppingBag className="w-8 h-8 text-blue-600 mr-3" />
              <h3 className="text-xl font-semibold">BulkBuy & Split Bulk Buy</h3>
            </div>
            <p className="mb-4">
              BulkBuy allows you to purchase products in larger quantities at discounted prices. 
              With Split Bulk Buy, you can share the cost with other users, making bulk purchases 
              more accessible and affordable.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="bg-gray-50 p-4 rounded-md">
                <h4 className="font-medium mb-2">Individual BulkBuy</h4>
                <p className="text-sm text-gray-600">
                  Purchase bulk quantities directly for maximum savings
                </p>
              </div>
              <div className="bg-gray-50 p-4 rounded-md">
                <h4 className="font-medium mb-2">Split Bulk Buy</h4>
                <p className="text-sm text-gray-600">
                  Join others to split the cost and quantity of bulk orders
                </p>
              </div>
            </div>
            <p>
              <Link href="/bulk-buy" className="text-blue-600 hover:text-blue-800">
                Explore BulkBuy Options
              </Link>
            </p>
          </div>
        </div>
      </section>
      
      <section>
        <h2 className="text-2xl font-semibold mb-6">Getting Started</h2>
        
        <div className="space-y-6">
          <div className="flex items-start">
            <div className="flex-shrink-0 bg-blue-100 text-blue-800 font-bold rounded-full w-8 h-8 flex items-center justify-center mt-1 mr-4">
              1
            </div>
            <div>
              <h3 className="text-lg font-medium mb-2">Create an Account</h3>
              <p className="text-gray-700">
                Sign up for a free account to access all features of DasWos. Creating an account 
                allows you to save searches, participate in collaborative searches, and make purchases.
              </p>
            </div>
          </div>
          
          <div className="flex items-start">
            <div className="flex-shrink-0 bg-blue-100 text-blue-800 font-bold rounded-full w-8 h-8 flex items-center justify-center mt-1 mr-4">
              2
            </div>
            <div>
              <h3 className="text-lg font-medium mb-2">Start Searching</h3>
              <p className="text-gray-700">
                Use our search bar to find information or products. You can choose between the Search Engine 
                and Shopping Engine, and filter results by SafeSphere or OpenSphere.
              </p>
            </div>
          </div>
          
          <div className="flex items-start">
            <div className="flex-shrink-0 bg-blue-100 text-blue-800 font-bold rounded-full w-8 h-8 flex items-center justify-center mt-1 mr-4">
              3
            </div>
            <div>
              <h3 className="text-lg font-medium mb-2">Explore Special Features</h3>
              <p className="text-gray-700">
                Try out Collaborative Search to connect with others or explore BulkBuy options 
                for special pricing on larger purchases.
              </p>
            </div>
          </div>
          
          <div className="flex items-start">
            <div className="flex-shrink-0 bg-blue-100 text-blue-800 font-bold rounded-full w-8 h-8 flex items-center justify-center mt-1 mr-4">
              4
            </div>
            <div>
              <h3 className="text-lg font-medium mb-2">Become a Seller (Optional)</h3>
              <p className="text-gray-700">
                If you're interested in selling products on DasWos, you can apply to become a verified seller 
                through our verification process.
              </p>
              <p className="mt-2">
                <Link href="/verification-process" className="text-blue-600 hover:text-blue-800">
                  Learn about becoming a seller
                </Link>
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HowItWorks;