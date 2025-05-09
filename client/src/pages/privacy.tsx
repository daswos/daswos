import React from 'react';
import { Separator } from '@/components/ui/separator';

const PrivacyPolicy: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>
      <p className="text-gray-600 mb-8">Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
      
      <Separator className="my-6" />
      
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">1. Introduction</h2>
        <p className="mb-4">
          At DasWos ("we", "our", or "us"), we respect your privacy and are committed to protecting your personal data. 
          This privacy policy explains how we collect, use, process, and share your information when you use our platform.
        </p>
        <p>
          This policy applies to all users of DasWos, including shoppers, sellers, and visitors to our website.
        </p>
      </section>
      
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">2. Data Controller</h2>
        <p className="mb-4">
          DasWos is the data controller responsible for your personal data. If you have any questions about this privacy policy 
          or our data practices, please contact our Data Protection Officer at:
        </p>
        <div className="bg-gray-50 p-4 rounded-md mb-4">
          <p>Email: privacy@daswos.com</p>
          <p>Address: DasWos Headquarters, 123 Trust Street, Berlin, Germany</p>
        </div>
      </section>
      
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">3. Information We Collect</h2>
        <p className="mb-4">We collect various types of information, including:</p>
        
        <h3 className="text-xl font-medium mb-2">3.1 Personal Information</h3>
        <ul className="list-disc pl-6 mb-4">
          <li>Contact information (name, email address, phone number)</li>
          <li>Account information (username, password)</li>
          <li>Payment information (credit card details, billing address)</li>
          <li>Delivery information (shipping address)</li>
          <li>Identification information for seller verification</li>
        </ul>
        
        <h3 className="text-xl font-medium mb-2">3.2 Usage Information</h3>
        <ul className="list-disc pl-6 mb-4">
          <li>Search queries and browsing history</li>
          <li>Purchase history and shopping preferences</li>
          <li>Device information and IP address</li>
          <li>Cookies and similar tracking technologies</li>
        </ul>
        
        <h3 className="text-xl font-medium mb-2">3.3 Collaborative Search Data</h3>
        <ul className="list-disc pl-6">
          <li>Search topics and queries</li>
          <li>Saved resources and search results</li>
          <li>Collaboration preferences and settings</li>
        </ul>
      </section>
      
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">4. Legal Basis for Processing</h2>
        <p className="mb-4">We process your personal data based on the following legal grounds:</p>
        
        <ul className="list-disc pl-6">
          <li><strong>Contractual necessity:</strong> To fulfill our contractual obligations to you</li>
          <li><strong>Consent:</strong> When you have given us permission to process your data</li>
          <li><strong>Legitimate interests:</strong> When processing is necessary for our legitimate interests</li>
          <li><strong>Legal obligations:</strong> To comply with applicable laws and regulations</li>
        </ul>
      </section>
      
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">5. How We Use Your Information</h2>
        <p className="mb-4">We use your information for various purposes, including:</p>
        
        <ul className="list-disc pl-6">
          <li>Processing transactions and facilitating purchases</li>
          <li>Providing personalized search results and product recommendations</li>
          <li>Verifying seller identities and maintaining trust on our platform</li>
          <li>Enabling collaborative search functionality</li>
          <li>Analyzing usage patterns to improve our services</li>
          <li>Communicating with you about your account or our services</li>
          <li>Detecting and preventing fraud and security breaches</li>
        </ul>
      </section>
      
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">6. Data Sharing and Disclosure</h2>
        <p className="mb-4">We may share your information with:</p>
        
        <ul className="list-disc pl-6 mb-4">
          <li><strong>Service providers:</strong> Companies that perform services on our behalf</li>
          <li><strong>Payment processors:</strong> To facilitate transactions</li>
          <li><strong>Other users:</strong> Limited information for collaborative features</li>
          <li><strong>Legal authorities:</strong> When required by law or to protect our rights</li>
        </ul>
        
        <p>
          We do not sell your personal information to third parties. However, we may share anonymized, aggregated data for analytics 
          and research purposes.
        </p>
      </section>
      
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">7. International Data Transfers</h2>
        <p className="mb-4">
          Your information may be transferred to and processed in countries other than your country of residence. We ensure appropriate 
          safeguards are in place to protect your information during such transfers, in compliance with applicable data protection laws.
        </p>
        <p>
          When transferring data outside the European Economic Area (EEA), we use mechanisms such as Standard Contractual Clauses approved 
          by the European Commission.
        </p>
      </section>
      
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">8. Data Security</h2>
        <p className="mb-4">
          We implement appropriate technical and organizational measures to protect your personal data against unauthorized access, 
          alteration, disclosure, or destruction. These measures include:
        </p>
        
        <ul className="list-disc pl-6">
          <li>Encryption of sensitive data</li>
          <li>Regular security assessments</li>
          <li>Access controls and authentication procedures</li>
          <li>Staff training on data security</li>
        </ul>
      </section>
      
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">9. Data Retention</h2>
        <p className="mb-4">
          We retain your personal data only for as long as necessary to fulfill the purposes for which it was collected, 
          including legal, accounting, or reporting requirements.
        </p>
        <p>
          Different types of data may be kept for different periods depending on their nature and purpose.
        </p>
      </section>
      
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">10. Your Rights</h2>
        <p className="mb-4">Under data protection laws, you have the following rights:</p>
        
        <ul className="list-disc pl-6">
          <li><strong>Access:</strong> Request access to your personal data</li>
          <li><strong>Rectification:</strong> Request correction of inaccurate data</li>
          <li><strong>Erasure:</strong> Request deletion of your data in certain circumstances</li>
          <li><strong>Restriction:</strong> Request limitation of processing of your data</li>
          <li><strong>Portability:</strong> Request transfer of your data to another organization</li>
          <li><strong>Objection:</strong> Object to processing based on legitimate interests</li>
          <li><strong>Withdraw consent:</strong> Withdraw previously given consent</li>
        </ul>
      </section>
      
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">11. Cookies and Tracking Technologies</h2>
        <p className="mb-4">
          We use cookies and similar tracking technologies to enhance your experience on our platform. 
          For detailed information about the types of cookies we use and how to control them, please see our 
          <a href="/cookies" className="text-blue-600 hover:text-blue-800"> Cookie Policy</a>.
        </p>
      </section>
      
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">12. Children's Privacy</h2>
        <p>
          Our services are not intended for individuals under the age of 16. We do not knowingly collect personal information 
          from children. If you become aware that a child has provided us with personal information, please contact us, and 
          we will take steps to delete such information.
        </p>
      </section>
      
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">13. Changes to This Privacy Policy</h2>
        <p>
          We may update this privacy policy from time to time to reflect changes in our practices or for legal, operational, 
          or regulatory reasons. We will notify you of any material changes through our website or by other means.
        </p>
      </section>
      
      <section>
        <h2 className="text-2xl font-semibold mb-4">14. How to Contact Us or File a Complaint</h2>
        <p className="mb-4">
          If you have questions, concerns, or requests regarding this privacy policy or our data practices, please contact 
          our Data Protection Officer at privacy@daswos.com.
        </p>
        <p>
          You also have the right to lodge a complaint with your local data protection authority if you believe that we have 
          violated your privacy rights.
        </p>
      </section>
    </div>
  );
};

export default PrivacyPolicy;