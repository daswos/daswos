import React from 'react';
import { Separator } from '@/components/ui/separator';
import { Link } from 'wouter';
import { ShieldCheck, AlertTriangle, CheckCircle2, Clock, ReceiptText, CreditCard, HelpCircle } from 'lucide-react';

const BuyerProtection: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Buyer Protection</h1>
      <p className="text-lg text-gray-700 mb-8">
        At DasWos, we take your shopping security seriously. Our Buyer Protection program is designed to provide 
        peace of mind with every purchase, ensuring you can shop with confidence.
      </p>
      
      <Separator className="my-6" />
      
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-6">Buyer Protection Overview</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-green-50 p-6 rounded-lg border-l-4 border-green-500">
            <div className="flex items-center mb-4">
              <ShieldCheck className="w-8 h-8 text-green-600 mr-3" />
              <h3 className="text-xl font-semibold">SafeSphere Protection</h3>
            </div>
            <p className="mb-4 text-gray-700">
              When shopping in SafeSphere, you receive our highest level of protection, including:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li>100% money-back guarantee for items not as described</li>
              <li>Protection against undelivered items</li>
              <li>Secure payment processing</li>
              <li>Extended dispute resolution support</li>
              <li>Expedited refund process</li>
            </ul>
          </div>
          
          <div className="bg-amber-50 p-6 rounded-lg border-l-4 border-amber-500">
            <div className="flex items-center mb-4">
              <AlertTriangle className="w-8 h-8 text-amber-600 mr-3" />
              <h3 className="text-xl font-semibold">OpenSphere Protection</h3>
            </div>
            <p className="mb-4 text-gray-700">
              For OpenSphere purchases, we provide basic protection:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li>Standard payment protection</li>
              <li>Basic dispute filing system</li>
              <li>Support for clear cases of fraud or misrepresentation</li>
              <li>Transaction monitoring</li>
            </ul>
            <p className="mt-4 text-gray-700 italic">
              Note: OpenSphere protection may have limitations based on the transaction details and seller verification status.
            </p>
          </div>
        </div>
      </section>
      
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-6">What's Covered</h2>
        
        <div className="space-y-6">
          <div className="flex bg-white p-5 rounded-lg shadow-sm">
            <div className="flex-shrink-0 mr-4">
              <div className="bg-green-100 rounded-full p-3">
                <CheckCircle2 className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <div>
              <h3 className="text-lg font-medium mb-2">Item Not As Described</h3>
              <p className="text-gray-600">
                If you receive an item that is significantly different from the seller's description in terms of condition, 
                quality, materials, or features, you can file a claim for a refund.
              </p>
            </div>
          </div>
          
          <div className="flex bg-white p-5 rounded-lg shadow-sm">
            <div className="flex-shrink-0 mr-4">
              <div className="bg-green-100 rounded-full p-3">
                <Clock className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <div>
              <h3 className="text-lg font-medium mb-2">Item Not Received</h3>
              <p className="text-gray-600">
                If you don't receive your purchase within the estimated delivery timeframe, or if the tracking shows 
                the item wasn't delivered, you're eligible for a full refund.
              </p>
            </div>
          </div>
          
          <div className="flex bg-white p-5 rounded-lg shadow-sm">
            <div className="flex-shrink-0 mr-4">
              <div className="bg-green-100 rounded-full p-3">
                <ReceiptText className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <div>
              <h3 className="text-lg font-medium mb-2">Incorrect or Damaged Items</h3>
              <p className="text-gray-600">
                If you receive the wrong item or your purchase arrives damaged, you can request a replacement or 
                full refund including original shipping costs.
              </p>
            </div>
          </div>
          
          <div className="flex bg-white p-5 rounded-lg shadow-sm">
            <div className="flex-shrink-0 mr-4">
              <div className="bg-green-100 rounded-full p-3">
                <CreditCard className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <div>
              <h3 className="text-lg font-medium mb-2">Unauthorized Transactions</h3>
              <p className="text-gray-600">
                If unauthorized purchases are made from your account, report them immediately and we'll help secure 
                your account and process refunds for fraudulent transactions.
              </p>
            </div>
          </div>
        </div>
      </section>
      
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-6">Protection Process</h2>
        
        <div className="relative">
          <div className="absolute left-5 inset-y-0 w-0.5 bg-gray-200"></div>
          
          <div className="space-y-12">
            <div className="relative">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-blue-500 text-white font-bold rounded-full w-10 h-10 flex items-center justify-center z-10">
                  1
                </div>
                <div className="ml-6">
                  <h3 className="text-lg font-medium mb-2">Contact the Seller</h3>
                  <p className="text-gray-600 mb-3">
                    For most issues, start by contacting the seller directly through our messaging system. 
                    Many problems can be resolved quickly this way.
                  </p>
                  <p className="text-gray-600 italic text-sm">
                    Response timeframe: Most sellers respond within 24-48 hours
                  </p>
                </div>
              </div>
            </div>
            
            <div className="relative">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-blue-500 text-white font-bold rounded-full w-10 h-10 flex items-center justify-center z-10">
                  2
                </div>
                <div className="ml-6">
                  <h3 className="text-lg font-medium mb-2">Open a Dispute</h3>
                  <p className="text-gray-600 mb-3">
                    If you can't resolve the issue directly with the seller, open a dispute in your account 
                    dashboard. Provide details and any supporting evidence (photos, messages, etc.).
                  </p>
                  <p className="text-gray-600 italic text-sm">
                    Time limit: Must be filed within 30 days of delivery (or expected delivery) date
                  </p>
                </div>
              </div>
            </div>
            
            <div className="relative">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-blue-500 text-white font-bold rounded-full w-10 h-10 flex items-center justify-center z-10">
                  3
                </div>
                <div className="ml-6">
                  <h3 className="text-lg font-medium mb-2">DasWos Review</h3>
                  <p className="text-gray-600 mb-3">
                    Our team will review your case, looking at all evidence from both you and the seller. 
                    We may request additional information if needed.
                  </p>
                  <p className="text-gray-600 italic text-sm">
                    Review period: Typically 3-5 business days
                  </p>
                </div>
              </div>
            </div>
            
            <div className="relative">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-blue-500 text-white font-bold rounded-full w-10 h-10 flex items-center justify-center z-10">
                  4
                </div>
                <div className="ml-6">
                  <h3 className="text-lg font-medium mb-2">Resolution and Refund</h3>
                  <p className="text-gray-600 mb-3">
                    Based on our review, we'll make a decision. If your claim is approved, we'll process 
                    your refund promptly to your original payment method.
                  </p>
                  <p className="text-gray-600 italic text-sm">
                    Refund timing: SafeSphere (1-3 business days), OpenSphere (5-7 business days)
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-6">Exclusions and Limitations</h2>
        
        <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
          <p className="mb-4">
            While our Buyer Protection program is comprehensive, certain situations are not covered:
          </p>
          
          <ul className="list-disc pl-6 space-y-2 text-gray-700">
            <li>Buyer's remorse or change of mind</li>
            <li>Claims filed after the protection period has expired</li>
            <li>Items damaged after delivery due to buyer mishandling</li>
            <li>Transactions conducted outside the DasWos platform</li>
            <li>Digital content after download or access</li>
            <li>Disputes where the buyer fails to provide requested information</li>
            <li>Issues with items explicitly described as damaged, defective, or "as is"</li>
          </ul>
          
          <div className="mt-6 bg-blue-50 p-4 rounded-md border-l-4 border-blue-500">
            <p className="text-sm text-blue-700">
              <strong>Note:</strong> Protection limits may vary based on payment method, transaction amount, and 
              seller status. See our <Link href="/terms" className="underline">Terms of Service</Link> for 
              complete details.
            </p>
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
                <h3 className="font-medium mb-2">How long do I have to file a claim?</h3>
                <p className="text-gray-700">
                  You must file a claim within 30 days of the actual delivery date (or the expected delivery date 
                  if the item never arrived). For SafeSphere Premium members, this period is extended to 45 days.
                </p>
              </div>
            </div>
          </div>
          
          <div className="border border-gray-200 p-5 rounded-lg">
            <div className="flex items-start">
              <HelpCircle className="w-6 h-6 text-blue-600 mr-3 mt-0.5" />
              <div>
                <h3 className="font-medium mb-2">Do I need to return the item to get a refund?</h3>
                <p className="text-gray-700">
                  In most cases, yes. If the item doesn't match the description or is damaged, you'll typically 
                  need to return it to the seller. We may require proof of return shipping. In certain cases 
                  involving very low-value items or when return shipping would be prohibitively expensive, 
                  we may process a refund without requiring a return.
                </p>
              </div>
            </div>
          </div>
          
          <div className="border border-gray-200 p-5 rounded-lg">
            <div className="flex items-start">
              <HelpCircle className="w-6 h-6 text-blue-600 mr-3 mt-0.5" />
              <div>
                <h3 className="font-medium mb-2">How are shipping costs handled in refunds?</h3>
                <p className="text-gray-700">
                  For SafeSphere purchases, if the item is not as described or damaged, we refund the original 
                  shipping cost and return shipping. For OpenSphere, original shipping is refunded, but return 
                  shipping is only covered in certain circumstances.
                </p>
              </div>
            </div>
          </div>
          
          <div className="border border-gray-200 p-5 rounded-lg">
            <div className="flex items-start">
              <HelpCircle className="w-6 h-6 text-blue-600 mr-3 mt-0.5" />
              <div>
                <h3 className="font-medium mb-2">What happens if a seller disputes my claim?</h3>
                <p className="text-gray-700">
                  If a seller disputes your claim, our team will carefully review all evidence provided by both 
                  parties. We may request additional information or documentation. DasWos makes the final 
                  decision based on our policies and the available evidence.
                </p>
              </div>
            </div>
          </div>
          
          <div className="border border-gray-200 p-5 rounded-lg">
            <div className="flex items-start">
              <HelpCircle className="w-6 h-6 text-blue-600 mr-3 mt-0.5" />
              <div>
                <h3 className="font-medium mb-2">Is Buyer Protection different for BulkBuy purchases?</h3>
                <p className="text-gray-700">
                  BulkBuy and Split BulkBuy purchases receive the same protection levels based on their sphere 
                  (SafeSphere or OpenSphere). However, for Split BulkBuy, there may be additional considerations 
                  regarding the timing of refunds when multiple buyers are involved.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default BuyerProtection;