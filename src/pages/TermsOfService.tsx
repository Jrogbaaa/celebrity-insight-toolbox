
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

        <section>
          <h2 className="text-xl font-semibold mt-6 mb-4">Terms of Service</h2>
          <p>Our complete Terms of Service can be found at: <a href="https://docs.google.com/document/d/e/2PACX-1vQdwI9Szmpv_y5bxk1bkiJiM3StuAD6LImEyiv_Q8huebJ7undXs6DvMKwCoPKaGEkdELXXI8MfyJk_/pub" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Terms of Service Document</a></p>
          <p className="mt-2">Our Privacy Policy can be found at: <a href="https://docs.google.com/document/d/e/2PACX-1vTXLIdkNd4jjC5Wi-MAz3uz4dHrtFw_xwnLUh1zYCdu80IZxsIT9PD4kMlCmQccnhpkaC55BYaAPY1P/pub" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Privacy Policy Document</a></p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mt-6 mb-4">TikTok Developer Verification Information</h2>
          <p>For TikTok platform verification purposes:</p>
          <ul className="list-disc list-inside pl-4 space-y-2">
            <li>TikTok Verification URL: https://ygweyscocelwjcqinkth.supabase.co/functions/v1/tiktok-verify</li>
            <li>TikTok Verification Code: tiktok-developers-site-verification=FACHd0WWbFoVY1eESS9vroWmE9DAz0yp</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mt-6 mb-4">Contact Information</h2>
          <p>For questions or concerns about these Terms, please contact us at:</p>
          <ul className="list-disc list-inside pl-4">
            <li>Email: jack@lookafteryou.es</li>
          </ul>
        </section>
      </div>
    </div>
  );
};

export default TermsOfService;
