import React from 'react';
import { Separator } from '@/components/ui/separator';

const Accessibility: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Accessibility Statement</h1>
      <p className="text-gray-600 mb-8">Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
      
      <Separator className="my-6" />
      
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Our Commitment</h2>
        <p className="mb-4">
          DasWos is committed to ensuring digital accessibility for people with disabilities. We are continually 
          improving the user experience for everyone and applying the relevant accessibility standards.
        </p>
      </section>
      
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Conformance Status</h2>
        <p className="mb-4">
          The Web Content Accessibility Guidelines (WCAG) define requirements for designers and developers to improve 
          accessibility for people with disabilities. It defines three levels of conformance: Level A, Level AA, and 
          Level AAA.
        </p>
        <p>
          DasWos strives to conform to WCAG 2.1 level AA. We are working to achieve and maintain this level across our platform.
        </p>
      </section>
      
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Accessibility Features</h2>
        <p className="mb-4">
          We have implemented the following accessibility features on our platform:
        </p>
        <ul className="list-disc pl-6">
          <li>Keyboard navigation for all functionality</li>
          <li>Screen reader compatibility</li>
          <li>Text alternatives for non-text content</li>
          <li>Clear heading structure for better navigation</li>
          <li>Sufficient color contrast</li>
          <li>Resizable text without loss of content or functionality</li>
          <li>Multiple ways to navigate the website</li>
          <li>Clear instructions that do not rely solely on sensory characteristics</li>
          <li>Error identification and suggestions</li>
        </ul>
      </section>
      
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Assistive Technology Compatibility</h2>
        <p className="mb-4">
          DasWos is designed to be compatible with the following assistive technologies:
        </p>
        <ul className="list-disc pl-6">
          <li>Screen readers (including JAWS, NVDA, VoiceOver, and TalkBack)</li>
          <li>Speech recognition software</li>
          <li>Screen magnification software</li>
          <li>Alternative input devices</li>
        </ul>
      </section>
      
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Known Limitations</h2>
        <p className="mb-4">
          Despite our efforts to ensure the accessibility of our platform, there may be some limitations:
        </p>
        <ul className="list-disc pl-6">
          <li>Some older pages may not be fully compliant with current standards</li>
          <li>Third-party content and features may not always meet our accessibility standards</li>
          <li>Some advanced interactive features may have limited accessibility</li>
        </ul>
        <p className="mt-4">
          We are actively working to address these limitations and improve accessibility across our platform.
        </p>
      </section>
      
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Feedback and Contact Information</h2>
        <p className="mb-4">
          We welcome your feedback on the accessibility of DasWos. Please let us know if you encounter accessibility 
          barriers on our platform:
        </p>
        <div className="bg-gray-50 p-4 rounded-md mb-4">
          <p>Email: accessibility@daswos.com</p>
          <p>Phone: +49 123 456 789</p>
        </div>
        <p>
          We aim to respond to feedback within 3 business days and to propose a solution within 2 weeks.
        </p>
      </section>
      
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Assessment and Compliance Process</h2>
        <p className="mb-4">
          Our approach to accessibility includes:
        </p>
        <ul className="list-disc pl-6">
          <li>Regular accessibility audits by internal teams</li>
          <li>Periodic external accessibility assessments</li>
          <li>User testing with assistive technologies</li>
          <li>Staff training on accessibility best practices</li>
          <li>Inclusion of accessibility as a requirement in our development process</li>
        </ul>
      </section>
      
      <section>
        <h2 className="text-2xl font-semibold mb-4">Formal Approval</h2>
        <p>
          This accessibility statement was prepared on April 4, 2025, and was last reviewed on 
          {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}.
        </p>
      </section>
    </div>
  );
};

export default Accessibility;