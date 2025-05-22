import React from 'react';
import { Separator } from '@/components/ui/separator';

const CookiePolicy: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Cookie Policy</h1>
      <p className="text-gray-600 mb-8">Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
      
      <Separator className="my-6" />
      
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">1. Introduction</h2>
        <p className="mb-4">
          This Cookie Policy explains how DasWos ("we", "us", or "our") uses cookies and similar technologies 
          when you visit our website or use our services. This policy provides you with information about 
          what cookies are, what types of cookies we use, and how we use them.
        </p>
        <p>
          By using our platform, you consent to our use of cookies in accordance with this Cookie Policy 
          and our Privacy Policy.
        </p>
      </section>
      
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">2. What Are Cookies?</h2>
        <p className="mb-4">
          Cookies are small text files that are placed on your device (computer, tablet, or mobile) when you 
          visit websites. They are widely used to make websites work more efficiently, provide a better user 
          experience, and provide information to the website owners.
        </p>
        <p>
          Cookies allow websites to recognize your device and remember certain information about your visit, 
          such as your preferences and actions on the site. They are not harmful and do not contain personal 
          information like your email address or payment details.
        </p>
      </section>
      
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">3. Types of Cookies We Use</h2>
        
        <h3 className="text-xl font-medium mb-2">3.1 Essential Cookies</h3>
        <p className="mb-4">
          These cookies are necessary for the website to function properly. They enable core functionality such 
          as security, network management, and account access. You cannot opt out of these cookies.
        </p>
        <ul className="list-disc pl-6 mb-4">
          <li>Authentication cookies to identify logged-in users</li>
          <li>Security cookies to prevent fraudulent use</li>
          <li>Session cookies to maintain your session while using our services</li>
        </ul>
        
        <h3 className="text-xl font-medium mb-2">3.2 Preference Cookies</h3>
        <p className="mb-4">
          These cookies allow us to remember your preferences and settings when you use our website, such as 
          language preferences and display settings.
        </p>
        <ul className="list-disc pl-6 mb-4">
          <li>Language preference cookies</li>
          <li>SafeSphere/OpenSphere preference cookies</li>
          <li>User interface customization cookies</li>
        </ul>
        
        <h3 className="text-xl font-medium mb-2">3.3 Analytics Cookies</h3>
        <p className="mb-4">
          These cookies collect information about how you use our website, which pages you visit, and any errors 
          you might encounter. This helps us improve our website and services.
        </p>
        <ul className="list-disc pl-6 mb-4">
          <li>Performance monitoring cookies</li>
          <li>Website usage analysis cookies</li>
          <li>Error tracking cookies</li>
        </ul>
        
        <h3 className="text-xl font-medium mb-2">3.4 Functionality Cookies</h3>
        <p className="mb-4">
          These cookies enable enhanced functionality on our website, such as search history, collaborative 
          search features, and personalized recommendations.
        </p>
        <ul className="list-disc pl-6 mb-4">
          <li>Search history cookies</li>
          <li>Collaborative feature cookies</li>
          <li>User preference cookies for search results</li>
        </ul>
        
        <h3 className="text-xl font-medium mb-2">3.5 Marketing and Advertising Cookies</h3>
        <p className="mb-4">
          These cookies are used to show you relevant advertisements on and off our site. They also help us measure 
          the effectiveness of our advertising campaigns.
        </p>
        <ul className="list-disc pl-6">
          <li>Targeted advertising cookies</li>
          <li>Marketing analytics cookies</li>
          <li>Third-party advertising cookies</li>
        </ul>
      </section>
      
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">4. Third-Party Cookies</h2>
        <p className="mb-4">
          Some cookies are placed by third parties on our website. These third parties may include:
        </p>
        <ul className="list-disc pl-6">
          <li>Analytics providers (e.g., Google Analytics)</li>
          <li>Payment processors</li>
          <li>Social media platforms when you use social sharing features</li>
          <li>Advertising networks</li>
        </ul>
        <p className="mt-4">
          We do not control these third-party cookies. You can check the privacy policies of these third parties 
          for information about how they use cookies.
        </p>
      </section>
      
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">5. Cookie Duration</h2>
        <p className="mb-4">
          Cookies can remain on your device for different periods of time:
        </p>
        <ul className="list-disc pl-6">
          <li><strong>Session Cookies:</strong> These cookies are temporary and are deleted when you close your browser.</li>
          <li><strong>Persistent Cookies:</strong> These cookies remain on your device until they expire or you delete them manually.</li>
        </ul>
      </section>
      
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">6. How to Manage Cookies</h2>
        <p className="mb-4">
          Most web browsers allow you to control cookies through their settings. You can:
        </p>
        <ul className="list-disc pl-6 mb-4">
          <li>View and delete cookies through your browser settings</li>
          <li>Block all cookies or only third-party cookies</li>
          <li>Allow all cookies or only certain cookies</li>
        </ul>
        <p className="mb-4">
          Please note that blocking or deleting certain cookies may affect the functionality of our website and 
          services. Essential cookies cannot be disabled as they are necessary for the site to function.
        </p>
        <p>
          You can find information on how to manage cookies in your browser here:
        </p>
        <ul className="list-disc pl-6">
          <li><a href="https://support.google.com/chrome/answer/95647" className="text-blue-600 hover:text-blue-800">Google Chrome</a></li>
          <li><a href="https://support.mozilla.org/en-US/kb/cookies-information-websites-store-on-your-computer" className="text-blue-600 hover:text-blue-800">Mozilla Firefox</a></li>
          <li><a href="https://support.apple.com/guide/safari/manage-cookies-sfri11471/mac" className="text-blue-600 hover:text-blue-800">Safari</a></li>
          <li><a href="https://support.microsoft.com/en-us/microsoft-edge/delete-cookies-in-microsoft-edge-63947406-40ac-c3b8-57b9-2a946a29ae09" className="text-blue-600 hover:text-blue-800">Microsoft Edge</a></li>
        </ul>
      </section>
      
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">7. Cookie Consent</h2>
        <p className="mb-4">
          When you first visit our website, you will be presented with a cookie consent banner that allows you to 
          accept or decline non-essential cookies. You can change your preferences at any time by clicking the 
          "Cookie Preferences" link in the footer of our website.
        </p>
        <p>
          By continuing to use our website after accepting cookies, you consent to our use of cookies as described 
          in this policy.
        </p>
      </section>
      
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">8. Similar Technologies</h2>
        <p className="mb-4">
          In addition to cookies, we may use other similar technologies to store and retrieve information on your device:
        </p>
        <ul className="list-disc pl-6">
          <li><strong>Web Beacons:</strong> Small graphic images that allow us to monitor the use of our website.</li>
          <li><strong>Local Storage:</strong> Similar to cookies but with larger storage capacity.</li>
          <li><strong>Pixel Tags:</strong> Tiny images that allow us to track user behavior and conversions.</li>
        </ul>
        <p className="mt-4">
          These technologies work in a similar way to cookies and are subject to the same controls and preferences.
        </p>
      </section>
      
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">9. Updates to This Cookie Policy</h2>
        <p>
          We may update this Cookie Policy from time to time to reflect changes in our practices or for legal, 
          operational, or regulatory reasons. When we make changes, we will update the "Last updated" date at the 
          top of this policy and take appropriate measures to inform you, consistent with the significance of the 
          changes we make.
        </p>
      </section>
      
      <section>
        <h2 className="text-2xl font-semibold mb-4">10. Contact Us</h2>
        <p>
          If you have any questions about our use of cookies or this Cookie Policy, please contact us at: privacy@daswos.com.
        </p>
      </section>
    </div>
  );
};

export default CookiePolicy;