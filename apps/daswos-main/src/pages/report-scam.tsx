import React from 'react';
import { Separator } from '@/components/ui/separator';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/hooks/use-toast';
import { AlertCircle, ShieldAlert } from 'lucide-react';

const reportFormSchema = z.object({
  reportType: z.string({
    required_error: "Please select a report type",
  }),
  url: z.string().url({ message: "Please enter a valid URL" }).optional().or(z.literal('')),
  entityName: z.string().min(2, { message: "Please enter the name of the entity being reported" }),
  description: z.string().min(10, { message: "Please provide details of at least 10 characters" }),
  contactEmail: z.string().email({ message: "Please enter a valid email address" }),
  evidenceType: z.string({
    required_error: "Please select if you have evidence",
  }),
  contactConsent: z.boolean().refine(value => value === true, {
    message: "You must agree to be contacted regarding this report",
  }),
});

type ReportFormValues = z.infer<typeof reportFormSchema>;

const ReportScam: React.FC = () => {
  const { toast } = useToast();
  
  const form = useForm<ReportFormValues>({
    resolver: zodResolver(reportFormSchema),
    defaultValues: {
      reportType: "",
      url: "",
      entityName: "",
      description: "",
      contactEmail: "",
      evidenceType: "",
      contactConsent: false,
    },
  });

  const onSubmit = (values: ReportFormValues) => {
    console.log(values);
    
    toast({
      title: "Report submitted",
      description: "Thank you for your report. Our team will review it promptly.",
    });
    
    form.reset();
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Report a Scam</h1>
      <p className="text-lg text-gray-700 mb-8">
        Help us maintain a safe environment by reporting suspicious activities, scams, or misleading information.
        Your reports are crucial in our effort to protect all users.
      </p>
      
      <Separator className="my-6" />
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
        <div className="col-span-2">
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-8">
            <div className="flex">
              <div className="flex-shrink-0">
                <AlertCircle className="h-5 w-5 text-red-500" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Important Notice</h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>
                    If you believe you've been a victim of fraud, please also report it to your local authorities.
                    This form is for our internal review process only.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <FormField
                control={form.control}
                name="reportType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type of Report</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select what you're reporting" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="fraudulent-seller">Fraudulent Seller</SelectItem>
                        <SelectItem value="fake-product">Fake or Misrepresented Product</SelectItem>
                        <SelectItem value="misinformation">Misleading Information</SelectItem>
                        <SelectItem value="payment-issue">Payment Issue</SelectItem>
                        <SelectItem value="account-compromise">Account Compromise</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Select the category that best describes the issue
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>URL (if applicable)</FormLabel>
                    <FormControl>
                      <Input placeholder="https://www.example.com/product-page" {...field} />
                    </FormControl>
                    <FormDescription>
                      The web address where you encountered the issue
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="entityName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name of Entity Being Reported</FormLabel>
                    <FormControl>
                      <Input placeholder="Seller/company/product name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description of the Issue</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Please provide as much detail as possible about the issue..." 
                        className="min-h-[150px]"
                        {...field} 
                      />
                    </FormControl>
                    <FormDescription>
                      Include dates, communications, amounts involved, and any other relevant details
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="evidenceType"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel>Do you have evidence to support your report?</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="flex flex-col space-y-1"
                      >
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="yes" />
                          </FormControl>
                          <FormLabel className="font-normal">
                            Yes, I have screenshots, documents, or other evidence
                          </FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="no" />
                          </FormControl>
                          <FormLabel className="font-normal">
                            No, I don't have evidence
                          </FormLabel>
                        </FormItem>
                      </RadioGroup>
                    </FormControl>
                    <FormDescription>
                      If you selected yes, our team will contact you to securely submit your evidence
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="contactEmail"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contact Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="your-email@example.com" {...field} />
                    </FormControl>
                    <FormDescription>
                      We'll use this to follow up on your report
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="contactConsent"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <input
                        type="checkbox"
                        checked={field.value}
                        onChange={field.onChange}
                        className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>
                        I understand and agree that DasWos may contact me regarding this report
                      </FormLabel>
                      <FormDescription>
                        We may need additional information to properly investigate this matter
                      </FormDescription>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <Button type="submit" className="w-full">Submit Report</Button>
            </form>
          </Form>
        </div>
        
        <div>
          <div className="bg-gray-50 p-6 rounded-lg shadow-sm sticky top-6">
            <h2 className="font-semibold text-lg mb-4 flex items-center">
              <ShieldAlert className="h-5 w-5 mr-2 text-red-600" />
              Report Processing
            </h2>
            
            <div className="space-y-4 text-sm">
              <div>
                <h3 className="font-medium">1. Submission</h3>
                <p className="text-gray-600">Your report is submitted through this secure form</p>
              </div>
              
              <div>
                <h3 className="font-medium">2. Initial Review</h3>
                <p className="text-gray-600">Our trust and safety team reviews your report within 24-48 hours</p>
              </div>
              
              <div>
                <h3 className="font-medium">3. Investigation</h3>
                <p className="text-gray-600">We may contact you for additional information while we investigate</p>
              </div>
              
              <div>
                <h3 className="font-medium">4. Action</h3>
                <p className="text-gray-600">If warranted, appropriate action will be taken against the reported entity</p>
              </div>
              
              <div>
                <h3 className="font-medium">5. Follow-up</h3>
                <p className="text-gray-600">You'll receive an update on the outcome of your report</p>
              </div>
            </div>
            
            <Separator className="my-6" />
            
            <div className="text-sm">
              <h3 className="font-medium mb-2">Need Immediate Assistance?</h3>
              <p className="text-gray-600 mb-4">
                For urgent matters or if you've been a victim of fraud:
              </p>
              <ul className="list-disc pl-5 text-gray-600 space-y-1">
                <li>Contact your local authorities</li>
                <li>Report to your payment provider</li>
                <li>Email our urgent team: <span className="text-blue-600">urgent@daswos.com</span></li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportScam;