
import React from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const TermsOfService = () => {
  const navigate = useNavigate();

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Terms of Service for TheSocialTool</h1>
        <Button variant="outline" onClick={() => navigate(-1)}>
          Back
        </Button>
      </div>
      
      <div className="prose prose-sm max-w-none space-y-6">
        <div className="text-sm text-muted-foreground">
          <p>Effective Date: January 14, 2025</p>
          <p>Last Updated: January 14, 2025</p>
        </div>

        <p>Welcome to TheSocialTool! By using our app, you agree to the following Terms of Service. If you do not agree, you must not use TheSocialTool.</p>

        <section>
          <h2 className="text-xl font-semibold mt-6 mb-4">1. Acceptance of Terms</h2>
          <p>By accessing or using TheSocialTool, you agree to be bound by these Terms of Service and our Privacy Policy. These terms apply to all users, including those who create accounts, link social media accounts, or access features such as our AI assistant.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mt-6 mb-4">2. Description of Services</h2>
          <p>TheSocialTool provides tools to analyze social media metrics, generate insights, and offer recommendations through an AI assistant. Services may be updated, modified, or discontinued at our discretion without prior notice.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mt-6 mb-4">3. Eligibility</h2>
          <ol className="list-decimal list-inside pl-4">
            <li>You must be at least 13 years old to use TheSocialTool.</li>
            <li>If you are using the app on behalf of a business or organization, you confirm that you have the authority to bind them to these Terms.</li>
          </ol>
        </section>

        <section>
          <h2 className="text-xl font-semibold mt-6 mb-4">4. User Accounts</h2>
          <ol className="list-decimal list-inside pl-4">
            <li>Registration: To access certain features, you may need to create an account. You must provide accurate and complete information.</li>
            <li>Account Security: You are responsible for maintaining the confidentiality of your login credentials. Notify us immediately of any unauthorized access.</li>
            <li>Termination: We reserve the right to suspend or terminate your account if you violate these Terms.</li>
          </ol>
        </section>

        <section>
          <h2 className="text-xl font-semibold mt-6 mb-4">5. Use of the App</h2>
          <h3 className="text-lg font-medium mt-4 mb-2">5.1 Prohibited Uses</h3>
          <p>You agree not to:</p>
          <ul className="list-disc list-inside pl-4">
            <li>Use the app for unlawful purposes.</li>
            <li>Scrape or reverse-engineer the app.</li>
            <li>Post or transmit harmful, harassing, or offensive content.</li>
            <li>Attempt to bypass security features.</li>
          </ul>
          
          <h3 className="text-lg font-medium mt-4 mb-2">5.2 Social Media Integrations</h3>
          <p>By linking your social media accounts, you grant TheSocialTool permission to access and analyze your account metrics in accordance with our Privacy Policy. You may disconnect your accounts at any time.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mt-6 mb-4">6. Fees and Payments</h2>
          <ol className="list-decimal list-inside pl-4">
            <li>Subscription Plans: Some features may require payment. Subscription fees are non-refundable unless explicitly stated otherwise.</li>
            <li>Payment Information: You must provide valid payment details. All payments are processed securely.</li>
            <li>Changes to Fees: We reserve the right to modify subscription fees with prior notice.</li>
          </ol>
        </section>

        {/* ... Continue with remaining sections ... */}
        
        <section>
          <h2 className="text-xl font-semibold mt-6 mb-4">14. Contact Information</h2>
          <p>For questions or concerns about these Terms, please contact us at:</p>
          <ul className="list-disc list-inside pl-4">
            <li>Email: jack@lookafteryou.es</li>
            <li>Address: [Insert Physical Address]</li>
          </ul>
        </section>

        <p className="mt-8 font-medium">By using TheSocialTool, you acknowledge that you have read, understood, and agreed to these Terms of Service.</p>
      </div>
    </div>
  );
};

export default TermsOfService;
