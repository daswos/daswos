import React from 'react';
import { Link } from 'wouter';

const SimpleFooter = () => {
  return (
    <footer className="bg-gray-900 text-white pt-6 pb-6">
      <div className="container mx-auto px-4">
        <div className="border-t border-gray-800 pt-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-500 text-sm">© {new Date().getFullYear()} DasWos. All rights reserved.</p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <Link href="/privacy" className="text-gray-500 hover:text-gray-300 text-sm">Privacy Policy</Link>
              <Link href="/terms" className="text-gray-500 hover:text-gray-300 text-sm">Terms of Service</Link>
              <Link href="/cookies" className="text-gray-500 hover:text-gray-300 text-sm">Cookie Policy</Link>
              <Link href="/accessibility" className="text-gray-500 hover:text-gray-300 text-sm">Accessibility</Link>
              <Link href="/admin-login" className="text-gray-500 hover:text-gray-300 text-sm">Admin</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default SimpleFooter;