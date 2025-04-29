import React from 'react';
import { Link } from 'wouter';
import { Info, Users, Globe, Newspaper, MessageSquare, FileText } from 'lucide-react';
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

const AboutUs: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">About DasWos</h1>
        <p className="text-gray-600 mb-6">
          Learn about our mission, team, and values
        </p>
      </div>

      {/* Hero section */}
      <div className="bg-gray-900 text-white p-8 mb-12">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Our Mission</h2>
          <p className="text-lg mb-8">
            DasWos is dedicated to transforming the online shopping experience through
            a trusted platform with integrated AI that helps users find verified information
            and products safely.
          </p>
          <p className="text-lg">
            We're building a collaborative ecosystem where shoppers and sellers can interact
            with confidence, backed by our advanced Trust Score system and rigorous verification
            processes.
          </p>
        </div>
      </div>

      {/* About Resources Grid */}
      <h2 className="text-2xl font-bold mb-6">About DasWos</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">

        {/* Our Story */}
        <Card className="border shadow hover:shadow-md transition-shadow">
          <CardContent className="pt-6">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <Info className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Our Story</h3>
            <p className="text-gray-600 mb-4">
              From humble beginnings to revolutionizing online shopping - discover how DasWos started and the journey we've taken.
            </p>
          </CardContent>
          <CardFooter className="pt-0">
            <Button asChild variant="outline" className="w-full">
              <Link href="/our-story">Read Our Story</Link>
            </Button>
          </CardFooter>
        </Card>

        {/* Our Team */}
        <Card className="border shadow hover:shadow-md transition-shadow">
          <CardContent className="pt-6">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <Users className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Our Team</h3>
            <p className="text-gray-600 mb-4">
              Meet the diverse group of professionals behind DasWos, working together to create a trusted shopping environment.
            </p>
          </CardContent>
          <CardFooter className="pt-0">
            <Button asChild variant="outline" className="w-full">
              <Link href="/our-team">Meet Our Team</Link>
            </Button>
          </CardFooter>
        </Card>

        {/* Careers */}
        <Card className="border shadow hover:shadow-md transition-shadow">
          <CardContent className="pt-6">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <Globe className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Careers</h3>
            <p className="text-gray-600 mb-4">
              Explore opportunities to join our team and make an impact on the future of online shopping and AI integration.
            </p>
          </CardContent>
          <CardFooter className="pt-0">
            <Button asChild variant="outline" className="w-full">
              <Link href="/careers">View Openings</Link>
            </Button>
          </CardFooter>
        </Card>

        {/* Press */}
        <Card className="border shadow hover:shadow-md transition-shadow">
          <CardContent className="pt-6">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <Newspaper className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Press</h3>
            <p className="text-gray-600 mb-4">
              News, media resources, and the latest coverage about DasWos and our innovations in the e-commerce landscape.
            </p>
          </CardContent>
          <CardFooter className="pt-0">
            <Button asChild variant="outline" className="w-full">
              <Link href="/press">View Press Kit</Link>
            </Button>
          </CardFooter>
        </Card>

        {/* Blog */}
        <Card className="border shadow hover:shadow-md transition-shadow">
          <CardContent className="pt-6">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <FileText className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Blog</h3>
            <p className="text-gray-600 mb-4">
              Insights, updates, and stories from our team about e-commerce, AI shopping, and building trust online.
            </p>
          </CardContent>
          <CardFooter className="pt-0">
            <Button asChild variant="outline" className="w-full">
              <Link href="/blog">Read Our Blog</Link>
            </Button>
          </CardFooter>
        </Card>

        {/* Contact Us */}
        <Card className="border shadow hover:shadow-md transition-shadow">
          <CardContent className="pt-6">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <MessageSquare className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Contact Us</h3>
            <p className="text-gray-600 mb-4">
              Get in touch with our team for support, partnership inquiries, or feedback about our platform.
            </p>
          </CardContent>
          <CardFooter className="pt-0">
            <Button asChild variant="outline" className="w-full">
              <Link href="/contact">Contact Us</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>

      {/* Value Proposition */}
      <div className="bg-gray-100 p-8 rounded-lg mb-12">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold mb-6 text-center">Our Core Values</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-black text-white rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-xl font-bold">1</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">Trust & Transparency</h3>
              <p className="text-gray-600">
                We believe in open, honest interactions in every aspect of our business.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-black text-white rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-xl font-bold">2</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">Innovation</h3>
              <p className="text-gray-600">
                We constantly pursue new ways to improve the online shopping experience.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-black text-white rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-xl font-bold">3</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">User Empowerment</h3>
              <p className="text-gray-600">
                We build tools that give users confidence and control in their shopping decisions.
              </p>
            </div>
          </div>
        </div>
      </div>

      <Separator className="my-8" />

      {/* Company Stats */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-8 text-center">DasWos By The Numbers</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="text-center">
            <p className="text-4xl font-bold mb-2">1.2M+</p>
            <p className="text-gray-600">Verified Sellers</p>
          </div>
          <div className="text-center">
            <p className="text-4xl font-bold mb-2">8.5M+</p>
            <p className="text-gray-600">Active Shoppers</p>
          </div>
          <div className="text-center">
            <p className="text-4xl font-bold mb-2">25M+</p>
            <p className="text-gray-600">Monthly Transactions</p>
          </div>
          <div className="text-center">
            <p className="text-4xl font-bold mb-2">98%</p>
            <p className="text-gray-600">Customer Satisfaction</p>
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="bg-black text-white p-8 text-center rounded-lg">
        <h2 className="text-2xl font-bold mb-4">Join the DasWos Community</h2>
        <p className="text-lg mb-6 max-w-2xl mx-auto">
          Whether you're a shopper looking for trusted products or a seller ready to grow your business,
          DasWos provides the platform you need to succeed.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Button asChild size="lg" className="bg-white text-black hover:bg-gray-100">
            <Link href="/auth">Create Account</Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="text-white border-white hover:bg-gray-800">
            <Link href="/seller-hub">Become a Seller</Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AboutUs;