
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { MessageSquare, QrCode, Star } from 'lucide-react';

const RateUs = () => {
  // Generate a QR code that points to a mailto link
  const teamLeadEmail = "teamlead@devtrails.com"; // Replace with actual email
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=mailto:${teamLeadEmail}?subject=Kubeboom%20Feedback`;
  
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-kubernetes-purple mb-2">Rate Our Project</h1>
          <p className="text-gray-600">
            We value your feedback! Scan the QR code below to send your thoughts directly to our team lead.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <QrCode className="h-5 w-5 text-kubernetes-purple" />
                Scan to Rate
              </CardTitle>
              <CardDescription>
                Use your phone camera to scan this QR code
              </CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center p-6">
              <div className="border-4 border-kubernetes-purple p-2 rounded-lg">
                <img 
                  src={qrCodeUrl} 
                  alt="QR Code to rate Kubeboom" 
                  className="w-48 h-48"
                />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-kubernetes-purple" />
                Why Your Feedback Matters
              </CardTitle>
              <CardDescription>
                Help us improve Kubeboom
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-2">
                <Star className="h-5 w-5 text-yellow-500 mt-1" />
                <div>
                  <Label className="font-medium">Enhance Features</Label>
                  <p className="text-sm text-gray-600">Your suggestions help us prioritize the most valuable features.</p>
                </div>
              </div>
              
              <div className="flex items-start gap-2">
                <Star className="h-5 w-5 text-yellow-500 mt-1" />
                <div>
                  <Label className="font-medium">Improve Usability</Label>
                  <p className="text-sm text-gray-600">Identify pain points and help us create a smoother experience.</p>
                </div>
              </div>
              
              <div className="flex items-start gap-2">
                <Star className="h-5 w-5 text-yellow-500 mt-1" />
                <div>
                  <Label className="font-medium">Build Better Together</Label>
                  <p className="text-sm text-gray-600">Partner with our team to shape the future of Kubernetes monitoring.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default RateUs;
