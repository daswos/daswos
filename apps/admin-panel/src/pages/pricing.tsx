import React from 'react';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Link, useLocation } from 'wouter';
import { 
  CheckCircle2, 
  XCircle, 
  Info, 
  CreditCard, 
  Tag, 
  ShoppingBag, 
  PercentCircle, 
  BadgeEuro, 
  Clock, 
  HelpCircle 
} from 'lucide-react';

const Pricing: React.FC = () => {
  const [, navigate] = useLocation();

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Pricing & Fees</h1>
      <p className="text-lg text-gray-700 mb-8">
        Transparent pricing is important to us. Below you'll find a comprehensive overview of all fees associated 
        with selling on DasWos, organized by verification level and transaction type.
      </p>
      
      <Separator className="my-6" />
      
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-6">Verification Fees</h2>
        
        <div className="overflow-x-auto mb-6">
          <table className="min-w-full bg-white border border-gray-200 rounded-lg">
            <thead>
              <tr className="bg-gray-50">
                <th className="py-3 px-4 text-left border-b border-gray-200">Verification Level</th>
                <th className="py-3 px-4 text-center border-b border-gray-200">One-time Fee</th>
                <th className="py-3 px-4 text-center border-b border-gray-200">Annual Renewal</th>
                <th className="py-3 px-4 text-center border-b border-gray-200">Features</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="py-3 px-4 border-b border-gray-200 font-medium">Basic Verification</td>
                <td className="py-3 px-4 border-b border-gray-200 text-center">Free</td>
                <td className="py-3 px-4 border-b border-gray-200 text-center">Free</td>
                <td className="py-3 px-4 border-b border-gray-200">
                  <ul className="list-disc pl-5 text-sm">
                    <li>OpenSphere access</li>
                    <li>Basic seller dashboard</li>
                    <li>Up to 50 active listings</li>
                  </ul>
                </td>
              </tr>
              <tr>
                <td className="py-3 px-4 border-b border-gray-200 font-medium">Identity Verification</td>
                <td className="py-3 px-4 border-b border-gray-200 text-center">€49.99</td>
                <td className="py-3 px-4 border-b border-gray-200 text-center">€29.99</td>
                <td className="py-3 px-4 border-b border-gray-200">
                  <ul className="list-disc pl-5 text-sm">
                    <li>SafeSphere access</li>
                    <li>Verification badge</li>
                    <li>Up to 200 active listings</li>
                    <li>Enhanced analytics</li>
                  </ul>
                </td>
              </tr>
              <tr>
                <td className="py-3 px-4 border-b border-gray-200 font-medium">Business Verification</td>
                <td className="py-3 px-4 border-b border-gray-200 text-center">€99.99</td>
                <td className="py-3 px-4 border-b border-gray-200 text-center">€49.99</td>
                <td className="py-3 px-4 border-b border-gray-200">
                  <ul className="list-disc pl-5 text-sm">
                    <li>Business verification badge</li>
                    <li>Unlimited active listings</li>
                    <li>Bulk listing tools</li>
                    <li>Advanced analytics</li>
                    <li>BulkBuy program eligibility</li>
                  </ul>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <div className="bg-blue-50 p-4 rounded-md">
          <div className="flex">
            <div className="flex-shrink-0">
              <Info className="h-5 w-5 text-blue-500" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-blue-700">
                Verification fees are one-time charges that enable you to access different platform features 
                based on your verification level. Annual renewal fees help maintain your verification status 
                and are significantly lower than the initial verification fee.
              </p>
            </div>
          </div>
        </div>
      </section>
      
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-6">Commission Rates</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <PricingCard
            title="Basic Seller"
            description="OpenSphere sellers with basic verification"
            price="12%"
            features={[
              { text: "OpenSphere listings only", included: true },
              { text: "Standard visibility", included: true },
              { text: "Basic seller tools", included: true },
              { text: "SafeSphere access", included: false },
              { text: "Volume discounts", included: false },
            ]}
            buttonText="Start Selling"
            onButtonClick={() => navigate("/seller-verification")}
            theme="basic"
          />
          
          <PricingCard
            title="Verified Individual"
            description="SafeSphere sellers with identity verification"
            price="9%"
            features={[
              { text: "SafeSphere & OpenSphere listings", included: true },
              { text: "Enhanced visibility", included: true },
              { text: "Enhanced seller tools", included: true },
              { text: "Volume discounts available", included: true },
              { text: "Business features", included: false },
            ]}
            buttonText="Get Verified"
            onButtonClick={() => navigate("/seller-verification")}
            theme="verified"
          />
          
          <PricingCard
            title="Verified Business"
            description="SafeSphere sellers with business verification"
            price="7%"
            features={[
              { text: "SafeSphere & OpenSphere listings", included: true },
              { text: "Top visibility", included: true },
              { text: "Premium seller tools", included: true },
              { text: "Enhanced volume discounts", included: true },
              { text: "BulkBuy program eligibility", included: true },
            ]}
            buttonText="Business Verification"
            onButtonClick={() => navigate("/seller-verification")}
            theme="business"
          />
        </div>
        
        <div className="mb-8">
          <h3 className="text-xl font-semibold mb-4">Commission Rate Details by Category</h3>
          
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-200 rounded-lg">
              <thead>
                <tr className="bg-gray-50">
                  <th className="py-3 px-4 text-left border-b border-gray-200">Product Category</th>
                  <th className="py-3 px-4 text-center border-b border-gray-200">Basic</th>
                  <th className="py-3 px-4 text-center border-b border-gray-200">Identity Verified</th>
                  <th className="py-3 px-4 text-center border-b border-gray-200">Business Verified</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="py-3 px-4 border-b border-gray-200">Electronics</td>
                  <td className="py-3 px-4 border-b border-gray-200 text-center">12%</td>
                  <td className="py-3 px-4 border-b border-gray-200 text-center">9%</td>
                  <td className="py-3 px-4 border-b border-gray-200 text-center">7%</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 border-b border-gray-200">Fashion & Apparel</td>
                  <td className="py-3 px-4 border-b border-gray-200 text-center">13%</td>
                  <td className="py-3 px-4 border-b border-gray-200 text-center">10%</td>
                  <td className="py-3 px-4 border-b border-gray-200 text-center">8%</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 border-b border-gray-200">Home & Garden</td>
                  <td className="py-3 px-4 border-b border-gray-200 text-center">12%</td>
                  <td className="py-3 px-4 border-b border-gray-200 text-center">9%</td>
                  <td className="py-3 px-4 border-b border-gray-200 text-center">7%</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 border-b border-gray-200">Books & Media</td>
                  <td className="py-3 px-4 border-b border-gray-200 text-center">10%</td>
                  <td className="py-3 px-4 border-b border-gray-200 text-center">8%</td>
                  <td className="py-3 px-4 border-b border-gray-200 text-center">6%</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 border-b border-gray-200">Beauty & Personal Care</td>
                  <td className="py-3 px-4 border-b border-gray-200 text-center">14%</td>
                  <td className="py-3 px-4 border-b border-gray-200 text-center">11%</td>
                  <td className="py-3 px-4 border-b border-gray-200 text-center">9%</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 border-b border-gray-200">Handmade & Crafts</td>
                  <td className="py-3 px-4 border-b border-gray-200 text-center">10%</td>
                  <td className="py-3 px-4 border-b border-gray-200 text-center">8%</td>
                  <td className="py-3 px-4 border-b border-gray-200 text-center">6%</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 border-b border-gray-200">Digital Products</td>
                  <td className="py-3 px-4 border-b border-gray-200 text-center">15%</td>
                  <td className="py-3 px-4 border-b border-gray-200 text-center">12%</td>
                  <td className="py-3 px-4 border-b border-gray-200 text-center">10%</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        
        <div className="space-y-4">
          <h3 className="text-xl font-semibold mb-2">Volume Discounts</h3>
          
          <p className="text-gray-700 mb-4">
            For Identity Verified and Business Verified sellers, we offer commission discounts based on monthly sales volume:
          </p>
          
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-200 rounded-lg">
              <thead>
                <tr className="bg-gray-50">
                  <th className="py-3 px-4 text-left border-b border-gray-200">Monthly Sales Volume</th>
                  <th className="py-3 px-4 text-center border-b border-gray-200">Identity Verified Discount</th>
                  <th className="py-3 px-4 text-center border-b border-gray-200">Business Verified Discount</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="py-3 px-4 border-b border-gray-200">€0 - €5,000</td>
                  <td className="py-3 px-4 border-b border-gray-200 text-center">0%</td>
                  <td className="py-3 px-4 border-b border-gray-200 text-center">0%</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 border-b border-gray-200">€5,001 - €10,000</td>
                  <td className="py-3 px-4 border-b border-gray-200 text-center">0.5%</td>
                  <td className="py-3 px-4 border-b border-gray-200 text-center">1%</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 border-b border-gray-200">€10,001 - €25,000</td>
                  <td className="py-3 px-4 border-b border-gray-200 text-center">1%</td>
                  <td className="py-3 px-4 border-b border-gray-200 text-center">1.5%</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 border-b border-gray-200">€25,001 - €50,000</td>
                  <td className="py-3 px-4 border-b border-gray-200 text-center">1.5%</td>
                  <td className="py-3 px-4 border-b border-gray-200 text-center">2%</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 border-b border-gray-200">€50,001+</td>
                  <td className="py-3 px-4 border-b border-gray-200 text-center">2%</td>
                  <td className="py-3 px-4 border-b border-gray-200 text-center">3%</td>
                </tr>
              </tbody>
            </table>
          </div>
          
          <p className="text-sm text-gray-600 italic">
            * Discounts are applied as a reduction to the standard commission rate based on your verification level 
            and product category. For example, a Business Verified seller selling electronics with €30,000 in monthly 
            sales would have their commission reduced from 7% to 5% (7% - 2% volume discount).
          </p>
        </div>
      </section>
      
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-6">Additional Fees</h2>
        
        <div className="space-y-8">
          <div>
            <h3 className="text-xl font-medium mb-4 flex items-center">
              <Tag className="h-5 w-5 text-purple-600 mr-2" />
              Listing Fees
            </h3>
            
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white border border-gray-200 rounded-lg">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="py-3 px-4 text-left border-b border-gray-200">Listing Type</th>
                    <th className="py-3 px-4 text-center border-b border-gray-200">Basic</th>
                    <th className="py-3 px-4 text-center border-b border-gray-200">Identity Verified</th>
                    <th className="py-3 px-4 text-center border-b border-gray-200">Business Verified</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="py-3 px-4 border-b border-gray-200">Standard Listing</td>
                    <td className="py-3 px-4 border-b border-gray-200 text-center">Free</td>
                    <td className="py-3 px-4 border-b border-gray-200 text-center">Free</td>
                    <td className="py-3 px-4 border-b border-gray-200 text-center">Free</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 border-b border-gray-200">Featured Listing</td>
                    <td className="py-3 px-4 border-b border-gray-200 text-center">€2.99</td>
                    <td className="py-3 px-4 border-b border-gray-200 text-center">€1.99</td>
                    <td className="py-3 px-4 border-b border-gray-200 text-center">€0.99</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 border-b border-gray-200">Premium Listing</td>
                    <td className="py-3 px-4 border-b border-gray-200 text-center">€4.99</td>
                    <td className="py-3 px-4 border-b border-gray-200 text-center">€3.49</td>
                    <td className="py-3 px-4 border-b border-gray-200 text-center">€1.99</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 border-b border-gray-200">BulkBuy Listing</td>
                    <td className="py-3 px-4 border-b border-gray-200 text-center">Not Available</td>
                    <td className="py-3 px-4 border-b border-gray-200 text-center">€2.99</td>
                    <td className="py-3 px-4 border-b border-gray-200 text-center">Free</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          
          <div>
            <h3 className="text-xl font-medium mb-4 flex items-center">
              <ShoppingBag className="h-5 w-5 text-purple-600 mr-2" />
              Subscription Plans (Optional)
            </h3>
            
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white border border-gray-200 rounded-lg">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="py-3 px-4 text-left border-b border-gray-200">Plan</th>
                    <th className="py-3 px-4 text-center border-b border-gray-200">Monthly Fee</th>
                    <th className="py-3 px-4 text-center border-b border-gray-200">Features</th>
                    <th className="py-3 px-4 text-center border-b border-gray-200">Eligibility</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="py-3 px-4 border-b border-gray-200">Seller Pro</td>
                    <td className="py-3 px-4 border-b border-gray-200 text-center">€19.99/month</td>
                    <td className="py-3 px-4 border-b border-gray-200">
                      <ul className="list-disc pl-5 text-sm">
                        <li>10 free featured listings per month</li>
                        <li>Priority customer support</li>
                        <li>Advanced analytics dashboard</li>
                      </ul>
                    </td>
                    <td className="py-3 px-4 border-b border-gray-200 text-center">All Sellers</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 border-b border-gray-200">Business Plus</td>
                    <td className="py-3 px-4 border-b border-gray-200 text-center">€49.99/month</td>
                    <td className="py-3 px-4 border-b border-gray-200">
                      <ul className="list-disc pl-5 text-sm">
                        <li>All Seller Pro features</li>
                        <li>30 free featured listings per month</li>
                        <li>Dedicated account manager</li>
                        <li>0.5% additional commission discount</li>
                      </ul>
                    </td>
                    <td className="py-3 px-4 border-b border-gray-200 text-center">
                      Business Verified Only
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          
          <div>
            <h3 className="text-xl font-medium mb-4 flex items-center">
              <CreditCard className="h-5 w-5 text-purple-600 mr-2" />
              Payment Processing Fees
            </h3>
            
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white border border-gray-200 rounded-lg">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="py-3 px-4 text-left border-b border-gray-200">Payment Method</th>
                    <th className="py-3 px-4 text-center border-b border-gray-200">Fee</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="py-3 px-4 border-b border-gray-200">Credit/Debit Card</td>
                    <td className="py-3 px-4 border-b border-gray-200 text-center">2.9% + €0.30</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 border-b border-gray-200">DasWos Balance</td>
                    <td className="py-3 px-4 border-b border-gray-200 text-center">1.5%</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 border-b border-gray-200">PayPal</td>
                    <td className="py-3 px-4 border-b border-gray-200 text-center">3.4% + €0.35</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 border-b border-gray-200">Bank Transfer (SEPA)</td>
                    <td className="py-3 px-4 border-b border-gray-200 text-center">1.0% (max €10)</td>
                  </tr>
                </tbody>
              </table>
            </div>
            
            <p className="mt-4 text-sm text-gray-600">
              * Payment processing fees are deducted from the payment before the transfer to your account.
            </p>
          </div>
        </div>
      </section>
      
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-6">Payment Schedule</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <div className="flex items-center mb-4">
              <Clock className="h-6 w-6 text-blue-600 mr-3" />
              <h3 className="font-semibold text-lg">Payment Timeline</h3>
            </div>
            <p className="text-gray-700 mb-4">
              Your earnings are released based on your verification level:
            </p>
            <ul className="space-y-3">
              <li className="flex items-start">
                <span className="flex-shrink-0 h-5 w-5 inline-flex items-center justify-center rounded-full bg-gray-100 text-gray-500 mr-2">
                  <span className="text-xs">•</span>
                </span>
                <p className="text-gray-600">
                  <strong>Basic Verification:</strong> 14 days after delivery confirmation
                </p>
              </li>
              <li className="flex items-start">
                <span className="flex-shrink-0 h-5 w-5 inline-flex items-center justify-center rounded-full bg-gray-100 text-gray-500 mr-2">
                  <span className="text-xs">•</span>
                </span>
                <p className="text-gray-600">
                  <strong>Identity Verification:</strong> 7 days after delivery confirmation
                </p>
              </li>
              <li className="flex items-start">
                <span className="flex-shrink-0 h-5 w-5 inline-flex items-center justify-center rounded-full bg-gray-100 text-gray-500 mr-2">
                  <span className="text-xs">•</span>
                </span>
                <p className="text-gray-600">
                  <strong>Business Verification:</strong> 3 days after delivery confirmation
                </p>
              </li>
            </ul>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <div className="flex items-center mb-4">
              <BadgeEuro className="h-6 w-6 text-blue-600 mr-3" />
              <h3 className="font-semibold text-lg">Payout Methods</h3>
            </div>
            <p className="text-gray-700 mb-4">
              We offer several payout methods with varying processing times and fees:
            </p>
            <ul className="space-y-3">
              <li className="flex items-start">
                <span className="flex-shrink-0 h-5 w-5 inline-flex items-center justify-center rounded-full bg-gray-100 text-gray-500 mr-2">
                  <span className="text-xs">•</span>
                </span>
                <p className="text-gray-600">
                  <strong>Bank Transfer (SEPA):</strong> Free, 1-2 business days
                </p>
              </li>
              <li className="flex items-start">
                <span className="flex-shrink-0 h-5 w-5 inline-flex items-center justify-center rounded-full bg-gray-100 text-gray-500 mr-2">
                  <span className="text-xs">•</span>
                </span>
                <p className="text-gray-600">
                  <strong>PayPal:</strong> 2% fee, instant transfer
                </p>
              </li>
              <li className="flex items-start">
                <span className="flex-shrink-0 h-5 w-5 inline-flex items-center justify-center rounded-full bg-gray-100 text-gray-500 mr-2">
                  <span className="text-xs">•</span>
                </span>
                <p className="text-gray-600">
                  <strong>DasWos Balance:</strong> Free, available immediately for platform purchases
                </p>
              </li>
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
                <h3 className="font-medium mb-2">Are there any hidden fees I should be aware of?</h3>
                <p className="text-gray-700">
                  No, we believe in complete transparency. All fees are outlined on this page. There are no setup 
                  fees, monthly maintenance fees, or other hidden charges beyond what's detailed here.
                </p>
              </div>
            </div>
          </div>
          
          <div className="border border-gray-200 p-5 rounded-lg">
            <div className="flex items-start">
              <HelpCircle className="w-6 h-6 text-blue-600 mr-3 mt-0.5" />
              <div>
                <h3 className="font-medium mb-2">How do refunds affect my commission fees?</h3>
                <p className="text-gray-700">
                  If a customer is refunded, any commission fees charged for that transaction will be returned to 
                  you. However, payment processing fees are generally non-refundable as these are charged by our 
                  payment processors.
                </p>
              </div>
            </div>
          </div>
          
          <div className="border border-gray-200 p-5 rounded-lg">
            <div className="flex items-start">
              <HelpCircle className="w-6 h-6 text-blue-600 mr-3 mt-0.5" />
              <div>
                <h3 className="font-medium mb-2">Can I change my verification level after I start selling?</h3>
                <p className="text-gray-700">
                  Yes, you can upgrade your verification level at any time. The verification fee will be charged 
                  when you apply for the upgrade. If you upgrade within 30 days of your initial verification, 
                  we'll credit the cost of your original verification toward the upgrade.
                </p>
              </div>
            </div>
          </div>
          
          <div className="border border-gray-200 p-5 rounded-lg">
            <div className="flex items-start">
              <HelpCircle className="w-6 h-6 text-blue-600 mr-3 mt-0.5" />
              <div>
                <h3 className="font-medium mb-2">How are taxes handled?</h3>
                <p className="text-gray-700">
                  All fees listed are exclusive of any applicable VAT or sales taxes. If you're in a jurisdiction where 
                  we're required to charge VAT on our services, this will be added to your fees. You are responsible 
                  for collecting and remitting any taxes on your sales as required by your local tax laws.
                </p>
              </div>
            </div>
          </div>
          
          <div className="border border-gray-200 p-5 rounded-lg">
            <div className="flex items-start">
              <HelpCircle className="w-6 h-6 text-blue-600 mr-3 mt-0.5" />
              <div>
                <h3 className="font-medium mb-2">Are there volume discounts for featured listings?</h3>
                <p className="text-gray-700">
                  Yes, if you purchase featured listings in bulk, you can receive the following discounts:
                  10 listings: 10% discount
                  20 listings: 15% discount
                  50+ listings: 25% discount
                  These discounts are applied automatically at checkout when purchasing multiple listings.
                </p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-8 text-center">
          <p className="text-gray-700 mb-6">
            Ready to start selling on DasWos? Begin the verification process today.
          </p>
          <Button 
            size="lg" 
            onClick={() => navigate("/seller-verification")}
            className="bg-black text-white hover:bg-gray-800"
          >
            Start Selling
          </Button>
        </div>
      </section>
    </div>
  );
};

// PricingCard component for displaying commission tiers
interface PricingCardProps {
  title: string;
  description: string;
  price: string;
  features: { text: string; included: boolean }[];
  buttonText: string;
  onButtonClick: () => void;
  theme: 'basic' | 'verified' | 'business';
}

const PricingCard: React.FC<PricingCardProps> = ({
  title,
  description,
  price,
  features,
  buttonText,
  onButtonClick,
  theme
}) => {
  let themeColors = {
    basic: {
      bg: 'bg-gray-50',
      highlight: 'bg-blue-100 text-blue-800',
      border: 'border-gray-200',
      icon: 'text-blue-500',
    },
    verified: {
      bg: 'bg-green-50',
      highlight: 'bg-green-100 text-green-800',
      border: 'border-green-200',
      icon: 'text-green-500',
    },
    business: {
      bg: 'bg-purple-50',
      highlight: 'bg-purple-100 text-purple-800',
      border: 'border-purple-200',
      icon: 'text-purple-500',
    }
  };
  
  const colors = themeColors[theme];
  
  return (
    <div className={`${colors.bg} p-6 rounded-lg shadow-sm border ${colors.border}`}>
      <div className="text-center mb-6">
        <h3 className="text-xl font-bold mb-1">{title}</h3>
        <p className="text-sm text-gray-600 mb-4">{description}</p>
        <div className="flex items-center justify-center">
          <PercentCircle className={`h-6 w-6 ${colors.icon} mr-2`} />
          <span className="text-3xl font-bold">{price}</span>
        </div>
        <p className="text-xs text-gray-500 mt-1">commission per sale</p>
      </div>
      
      <ul className="space-y-3 mb-6">
        {features.map((feature, index) => (
          <li key={index} className="flex items-start">
            {feature.included ? (
              <CheckCircle2 className="h-5 w-5 text-green-500 mr-2" />
            ) : (
              <XCircle className="h-5 w-5 text-red-500 mr-2" />
            )}
            <span className={feature.included ? 'text-gray-700' : 'text-gray-500'}>
              {feature.text}
            </span>
          </li>
        ))}
      </ul>
      
      <Button
        className="w-full"
        variant={theme === 'basic' ? 'outline' : 'default'}
        onClick={onButtonClick}
      >
        {buttonText}
      </Button>
    </div>
  );
};

export default Pricing;