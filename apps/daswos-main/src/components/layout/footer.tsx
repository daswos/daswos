import React from 'react';
import { Link } from 'wouter';
import { Facebook, Twitter, Instagram, Youtube } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white pt-12 pb-6">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div>
            <h3 className="text-lg font-semibold mb-4 font-outfit">DasWos</h3>
            <p className="text-gray-400 mb-4">
              A trusted platform with integrated AI to help you find verified information and products safely.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Facebook className="w-6 h-6" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Twitter className="w-6 h-6" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Instagram className="w-6 h-6" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Youtube className="w-6 h-6" />
              </a>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4 font-outfit">Quick Links</h3>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <ul className="space-y-2">
                  <li><Link href="/shopper-hub" className="text-gray-400 hover:text-white transition-colors">Shopper Hub</Link></li>
                  <li><Link href="/seller-hub" className="text-gray-400 hover:text-white transition-colors">Seller Hub</Link></li>
                  <li><Link href="/about-us" className="text-gray-400 hover:text-white transition-colors">About Us</Link></li>
                  <li><Link href="/contact" className="text-gray-400 hover:text-white transition-colors">Contact Us</Link></li>
                </ul>
              </div>
              <div>
                <ul className="space-y-2">
                  <li><Link href="/privacy" className="text-gray-400 hover:text-white transition-colors">Privacy Policy</Link></li>
                  <li><Link href="/terms" className="text-gray-400 hover:text-white transition-colors">Terms of Service</Link></li>
                  <li><Link href="/cookies" className="text-gray-400 hover:text-white transition-colors">Cookie Policy</Link></li>
                  <li><Link href="/accessibility" className="text-gray-400 hover:text-white transition-colors">Accessibility</Link></li>
                  <li><Link href="/admin-login" className="text-gray-400 hover:text-white transition-colors">Admin</Link></li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-500 text-sm">© {new Date().getFullYear()} DasWos. All rights reserved.</p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              {/* Admin link moved to Quick Links section */}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
