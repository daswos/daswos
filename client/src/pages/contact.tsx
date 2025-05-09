import React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

const contactFormSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters long' }),
  email: z.string().email({ message: 'Please enter a valid email address' }),
  subject: z.string().min(1, { message: 'Please select a subject' }),
  message: z.string().min(10, { message: 'Message must be at least 10 characters long' }),
});

type ContactFormValues = z.infer<typeof contactFormSchema>;

const Contact: React.FC = () => {
  const { toast } = useToast();
  
  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      name: '',
      email: '',
      subject: '',
      message: '',
    },
  });

  const onSubmit = (values: ContactFormValues) => {
    // This would normally send the form data to a server
    console.log(values);
    
    // Show success toast
    toast({
      title: 'Message sent',
      description: 'Thank you for contacting us. We will get back to you soon.',
      variant: 'default',
    });
    
    // Reset form
    form.reset();
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Contact Us</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <div>
          <p className="text-lg mb-6">
            We're here to help and answer any questions you might have. We look forward to hearing from you.
          </p>
          
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Contact Information</h2>
            <div className="space-y-3">
              <p><strong>Email:</strong> support@daswos.com</p>
              <p><strong>Phone:</strong> +49 123 456 789</p>
              <p><strong>Address:</strong> DasWos Headquarters<br />123 Trust Street<br />10115 Berlin<br />Germany</p>
            </div>
          </div>
          
          <div>
            <h2 className="text-xl font-semibold mb-4">Business Hours</h2>
            <div className="space-y-1">
              <p><strong>Monday-Friday:</strong> 9:00 AM - 6:00 PM CET</p>
              <p><strong>Saturday:</strong> 10:00 AM - 2:00 PM CET</p>
              <p><strong>Sunday:</strong> Closed</p>
            </div>
          </div>
        </div>
        
        <div className="bg-gray-50 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Send Us a Message</h2>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Your name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="Your email address" type="email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="subject"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Subject</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a subject" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="general">General Inquiry</SelectItem>
                        <SelectItem value="support">Technical Support</SelectItem>
                        <SelectItem value="billing">Billing Questions</SelectItem>
                        <SelectItem value="seller">Seller Information</SelectItem>
                        <SelectItem value="report">Report an Issue</SelectItem>
                        <SelectItem value="feedback">Feedback</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="message"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Message</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="How can we help you?"
                        className="min-h-[120px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <Button type="submit" className="w-full">Send Message</Button>
            </form>
          </Form>
        </div>
      </div>
      
      <div className="mt-12">
        <h2 className="text-xl font-semibold mb-4">Frequently Asked Questions</h2>
        <div className="space-y-4">
          <div>
            <h3 className="font-medium">How do I verify my seller account?</h3>
            <p className="text-gray-600">You can find detailed information on our <a href="/verification-process" className="text-blue-600 hover:text-blue-800">Verification Process</a> page.</p>
          </div>
          
          <div>
            <h3 className="font-medium">What is the difference between SafeSphere and OpenSphere?</h3>
            <p className="text-gray-600">Check out our <a href="/sphere-comparison" className="text-blue-600 hover:text-blue-800">SafeSphere vs OpenSphere</a> page for a detailed comparison.</p>
          </div>
          
          <div>
            <h3 className="font-medium">How does the Trust Score work?</h3>
            <p className="text-gray-600">Our Trust Score system is explained in detail on the <a href="/trust-score" className="text-blue-600 hover:text-blue-800">Trust Score Explained</a> page.</p>
          </div>
          
          <div>
            <h3 className="font-medium">How can I participate in a Split Bulk Buy?</h3>
            <p className="text-gray-600">Visit our <a href="/bulk-buy" className="text-blue-600 hover:text-blue-800">BulkBuy</a> page to learn more and see available options.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;