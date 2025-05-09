import React from 'react';
import { Separator } from '@/components/ui/separator';

const TermsOfService: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Terms of Service</h1>
      <p className="text-gray-600 mb-8">Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
      
      <Separator className="my-6" />
      
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">1. Introduction</h2>
        <p className="mb-4">
          Welcome to DasWos. These Terms of Service ("Terms") govern your access to and use of the DasWos platform, 
          including our website, services, and applications (collectively, the "Services").
        </p>
        <p>
          By accessing or using our Services, you agree to be bound by these Terms. If you do not agree to these Terms, 
          you may not access or use the Services.
        </p>
      </section>
      
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">2. About DasWos</h2>
        <p className="mb-4">
          DasWos is a dual-tier search and collaborative purchasing platform that provides trusted information search and 
          shopping services. Our platform includes features such as SafeSphere, OpenSphere, BulkBuy, and Collaborative Search.
        </p>
        <p>
          We take trust and safety seriously and employ various verification mechanisms to create a secure environment for our users.
        </p>
      </section>
      
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">3. Account Registration</h2>
        <p className="mb-4">
          To access certain features of our Services, you may need to register for an account. When you register, you agree to provide 
          accurate, current, and complete information about yourself.
        </p>
        <p className="mb-4">
          You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. 
          You agree to notify us immediately of any unauthorized use of your account.
        </p>
        <p>
          We reserve the right to suspend or terminate your account if any information provided during registration or thereafter proves to be 
          inaccurate, outdated, or incomplete.
        </p>
      </section>
      
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">4. User Responsibilities</h2>
        <h3 className="text-xl font-medium mb-2">4.1 General Responsibilities</h3>
        <p className="mb-4">
          You agree to use our Services only for lawful purposes and in accordance with these Terms. You agree not to use our Services:
        </p>
        <ul className="list-disc pl-6 mb-4">
          <li>In any way that violates any applicable federal, state, local, or international law or regulation</li>
          <li>To engage in any conduct that restricts or inhibits anyone's use or enjoyment of the Services</li>
          <li>To impersonate or attempt to impersonate DasWos, a DasWos employee, another user, or any other person or entity</li>
          <li>To engage in any other conduct that could damage, disable, overburden, or impair the Services</li>
        </ul>
        
        <h3 className="text-xl font-medium mb-2">4.2 Buyer Responsibilities</h3>
        <p className="mb-4">
          When making purchases through our Services, you agree to:
        </p>
        <ul className="list-disc pl-6 mb-4">
          <li>Provide accurate payment and shipping information</li>
          <li>Promptly communicate with sellers regarding transactions</li>
          <li>Comply with the terms of transactions, including payment obligations</li>
          <li>Use our trust verification features responsibly</li>
        </ul>
        
        <h3 className="text-xl font-medium mb-2">4.3 Seller Responsibilities</h3>
        <p className="mb-4">
          If you use our Services as a seller, you agree to:
        </p>
        <ul className="list-disc pl-6">
          <li>Provide accurate information about yourself and your products</li>
          <li>Comply with our verification procedures</li>
          <li>Fulfill orders promptly and as described</li>
          <li>Maintain appropriate inventory and shipping capabilities</li>
          <li>Respond to buyer inquiries in a timely manner</li>
          <li>Comply with all applicable laws and regulations, including consumer protection and tax laws</li>
        </ul>
      </section>
      
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">5. Spheres and Trust Verification</h2>
        <h3 className="text-xl font-medium mb-2">5.1 SafeSphere</h3>
        <p className="mb-4">
          SafeSphere is our trust-verified environment where all content and products have undergone rigorous verification. 
          While we make every effort to ensure the reliability of SafeSphere, we do not guarantee that all information or products 
          are entirely free from errors or issues.
        </p>
        
        <h3 className="text-xl font-medium mb-2">5.2 OpenSphere</h3>
        <p className="mb-4">
          OpenSphere contains content and products that have not undergone our full verification process. Users access OpenSphere 
          at their own risk, and we provide transparency about the verification status of content and products in this environment.
        </p>
        
        <h3 className="text-xl font-medium mb-2">5.3 Trust Score</h3>
        <p>
          Our Trust Score is a proprietary system that evaluates the trustworthiness of content, products, and sellers. 
          While we strive for accuracy in our Trust Score calculations, they should be considered as one factor in your 
          decision-making process and not a guarantee of quality or reliability.
        </p>
      </section>
      
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">6. BulkBuy and Split Bulk Buy</h2>
        <p className="mb-4">
          BulkBuy and Split Bulk Buy features allow users to make bulk purchases individually or collaboratively. When using these features:
        </p>
        <ul className="list-disc pl-6">
          <li>You agree to fulfill your payment obligations for your portion of any Split Bulk Buy transaction</li>
          <li>You understand that the completion of Split Bulk Buy transactions may depend on sufficient participant interest</li>
          <li>You acknowledge that shipping arrangements may vary based on the specific bulk purchase</li>
        </ul>
      </section>
      
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">7. Collaborative Search</h2>
        <p className="mb-4">
          Our Collaborative Search feature allows users to create shared search spaces and collaborate on research. When using Collaborative Search:
        </p>
        <ul className="list-disc pl-6">
          <li>You retain intellectual property rights to your original contributions</li>
          <li>You grant other collaborators the right to view and use your contributions within the collaborative space</li>
          <li>You agree not to post inappropriate, offensive, or illegal content</li>
        </ul>
      </section>
      
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">8. Payments and Fees</h2>
        <p className="mb-4">
          Payment terms for purchases made through our Services are determined at the time of transaction. We may charge fees for certain services, 
          which will be clearly disclosed prior to use of those services.
        </p>
        <p className="mb-4">
          For sellers, we may charge listing fees, transaction fees, or subscription fees as outlined in our Pricing & Fees documentation. 
          These fees are subject to change with notice.
        </p>
        <p>
          All payments processed through our platform are handled by secure third-party payment processors. We do not store complete credit card 
          information on our servers.
        </p>
      </section>
      
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">9. Intellectual Property</h2>
        <p className="mb-4">
          The Services and their entire contents, features, and functionality (including but not limited to all information, software, text, 
          displays, images, video, and audio, and the design, selection, and arrangement thereof) are owned by DasWos, its licensors, or other 
          providers of such material and are protected by copyright, trademark, patent, trade secret, and other intellectual property or 
          proprietary rights laws.
        </p>
        <p>
          These Terms do not grant you any rights to use the DasWos name, logo, or other trademarks, unless otherwise stated.
        </p>
      </section>
      
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">10. User Content</h2>
        <p className="mb-4">
          Our Services may allow you to post, submit, publish, display, or transmit content ("User Content"). You retain any intellectual 
          property rights that you hold in your User Content.
        </p>
        <p className="mb-4">
          By posting User Content, you grant DasWos a non-exclusive, royalty-free, transferable, sublicensable, worldwide license to use, 
          store, display, reproduce, modify, create derivative works, perform, and distribute your User Content solely for the purposes of 
          operating, developing, providing, and using the Services.
        </p>
        <p>
          You represent and warrant that you own or control all rights in and to the User Content and have the right to grant the license 
          granted above to us.
        </p>
      </section>
      
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">11. Disclaimer of Warranties</h2>
        <p className="mb-4">
          YOUR USE OF THE SERVICES IS AT YOUR SOLE RISK. THE SERVICES ARE PROVIDED ON AN "AS IS" AND "AS AVAILABLE" BASIS, WITHOUT 
          WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED.
        </p>
        <p>
          WHILE WE STRIVE TO PROVIDE TRUSTWORTHY INFORMATION AND VERIFICATION, WE DO NOT WARRANT THAT THE SERVICES WILL BE UNINTERRUPTED, 
          TIMELY, SECURE, OR ERROR-FREE, OR THAT ANY PRODUCTS, INFORMATION, OR OTHER MATERIAL AVAILABLE ON OR THROUGH THE SERVICES ARE 
          ACCURATE, COMPLETE, RELIABLE, OR FREE FROM DEFECTS.
        </p>
      </section>
      
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">12. Limitation of Liability</h2>
        <p className="mb-4">
          TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, DASWOS AND ITS OFFICERS, DIRECTORS, EMPLOYEES, AGENTS, PARTNERS, AND 
          LICENSORS SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING WITHOUT 
          LIMITATION, LOSS OF PROFITS, DATA, USE, GOODWILL, OR OTHER INTANGIBLE LOSSES, RESULTING FROM:
        </p>
        <ol className="list-decimal pl-6">
          <li>YOUR ACCESS TO OR USE OF OR INABILITY TO ACCESS OR USE THE SERVICES;</li>
          <li>ANY CONDUCT OR CONTENT OF ANY THIRD PARTY ON THE SERVICES;</li>
          <li>ANY CONTENT OBTAINED FROM THE SERVICES; AND</li>
          <li>UNAUTHORIZED ACCESS, USE OR ALTERATION OF YOUR TRANSMISSIONS OR CONTENT.</li>
        </ol>
      </section>
      
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">13. Indemnification</h2>
        <p>
          You agree to defend, indemnify, and hold harmless DasWos and its officers, directors, employees, and agents from and against 
          any claims, liabilities, damages, judgments, awards, losses, costs, expenses, or fees (including reasonable attorneys' fees) 
          arising out of or relating to your violation of these Terms or your use of the Services.
        </p>
      </section>
      
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">14. Termination</h2>
        <p className="mb-4">
          We may terminate or suspend your access to the Services immediately, without prior notice or liability, for any reason, including 
          without limitation if you breach these Terms.
        </p>
        <p>
          Upon termination, your right to use the Services will immediately cease. All provisions of these Terms which by their nature should 
          survive termination shall survive termination, including, without limitation, ownership provisions, warranty disclaimers, indemnity, 
          and limitations of liability.
        </p>
      </section>
      
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">15. Governing Law</h2>
        <p>
          These Terms shall be governed by and construed in accordance with the laws of Germany, without regard to its conflict of law principles. 
          Any legal action or proceeding arising out of or related to these Terms or the Services shall be instituted exclusively in the courts 
          of Germany.
        </p>
      </section>
      
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">16. Changes to Terms</h2>
        <p>
          We may revise these Terms from time to time. The most current version will always be posted on our website. If a revision, in our sole 
          discretion, is material, we will notify you via email to the email address associated with your account or through the Services. By 
          continuing to access or use the Services after revisions become effective, you agree to be bound by the revised Terms.
        </p>
      </section>
      
      <section>
        <h2 className="text-2xl font-semibold mb-4">17. Contact Information</h2>
        <p>
          Questions or comments about the Services or these Terms may be directed to us at the following email address: support@daswos.com.
        </p>
      </section>
    </div>
  );
};

export default TermsOfService;