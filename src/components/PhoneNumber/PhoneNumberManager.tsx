import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { PhoneIcon, HelpCircleIcon } from 'lucide-react';
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { RegistrationFlow } from './RegistrationFlow';
import { PhoneList } from './PhoneList';
import { CallControls } from './CallControls';
import { ActiveCallDialog } from './ActiveCallDialog';
import { IncomingCallDialog } from './IncomingCallDialog';
import { ScheduleCallDialog } from './ScheduleCallDialog';
import { GetNewNumberDialog } from './GetNewNumberDialog';
import { AddPurchasedNumberDialog } from './AddPurchasedNumberDialog';

export function PhoneNumberManager() {
  const { toast } = useToast();
  const [state, setState] = useState({
    isNewUser: true,
    registrationStep: 0,
    registrationType: null,
    registrationData: {},
    phoneNumbers: [],
    selectedNumber: '',
    showScheduleModal: false,
    showGetNewNumberModal: false,
    showAddPurchasedNumberModal: false,
    scheduleDate: undefined,
    scheduleTime: '12:00',
    confirmationType: 'sms',
    retryCount: '1',
    inboundAssistant: 'mark',
    outboundAssistant: 'mark',
    outboundPhoneNumber: '',
    fallbackNumber: '',
    isCallLoading: false,
    showCallDialog: false,
    callTranscript: [],
    isMicAllowed: false,
    volume: 50,
    isMuted: false,
    isAssistantActive: true,
    scheduledCalls: [],
    activeCalls: [],
    userMessage: '',
    isListening: false,
    activeCallId: null,
    userWantsToAnswer: false,
    ringCount: 3,
    incomingRingingCalls: [],
  });

  const set = (field: string, value: any) => setState(prev => ({ ...prev, [field]: value }));

  const handleRegistrationComplete = (data: any) => {
    set('registrationData', data);
    set('isNewUser', false);
    toast({
      title: "Registration Complete",
      description: "You can now select your phone number."
    });
    set('showGetNewNumberModal', true);
  };

  const handleNumberPurchase = (number: string) => {
    set('phoneNumbers', [...state.phoneNumbers, number]);
    set('selectedNumber', number);
    set('showGetNewNumberModal', false);
    toast({
      title: "Number Purchased",
      description: `Successfully acquired ${number}`
    });
  };

  if (state.isNewUser) {
    return (
      <TooltipProvider>
        <div className="flex-1 p-8">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-2xl text-white">Welcome to Talkai247</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <p className="text-gray-300">
                  To begin using our AI-powered calling features, you'll need to acquire a phone number.
                  Click the button below to start the process.
                </p>
                <div className="flex items-center space-x-4">
                  <Button
                    onClick={() => set('registrationStep', 1)}
                    className="bg-teal-600 hover:bg-teal-700"
                  >
                    <PhoneIcon className="mr-2 h-4 w-4" />
                    Get New Number
                  </Button>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <HelpCircleIcon className="h-4 w-4 text-gray-400" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Get started by acquiring your first phone number and setting up your account.</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
              </div>
            </CardContent>
          </Card>

          {state.registrationStep > 0 && (
            <RegistrationFlow
              step={state.registrationStep - 1}
              type={state.registrationType}
              data={state.registrationData}
              onStepChange={(step) => set('registrationStep', step + 1)}
              onTypeChange={(type) => set('registrationType', type)}
              onDataChange={(data) => set('registrationData', data)}
              onComplete={handleRegistrationComplete}
            />
          )}
        </div>
      </TooltipProvider>
    );
  }

  return (
    <TooltipProvider>
      <div className="flex-1 p-8">
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-teal-400">Phone Number Management</h1>
              <p className="text-gray-400">Manage your AI-powered phone numbers and calls</p>
            </div>
            <div className="flex space-x-2">
              <Button 
                onClick={() => set('showAddPurchasedNumberModal', true)}
                variant="outline"
              >
                Add purchased number
              </Button>
              <Button 
                onClick={() => set('showGetNewNumberModal', true)}
                className="bg-teal-600 hover:bg-teal-700"
              >
                Get new number
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-1">
              <PhoneList
                phoneNumbers={state.phoneNumbers}
                selectedNumber={state.selectedNumber}
                onSelect={(number) => set('selectedNumber', number)}
                onDelete={(number) => {
                  set('phoneNumbers', state.phoneNumbers.filter(n => n !== number));
                  if (state.selectedNumber === number) {
                    set('selectedNumber', state.phoneNumbers.find(n => n !== number) || '');
                  }
                }}
              />
            </div>

            <div className="md:col-span-2">
              <CallControls
                selectedNumber={state.selectedNumber}
                onScheduleCall={() => set('showScheduleModal', true)}
                onGetNewNumber={() => set('showGetNewNumberModal', true)}
                onAddPurchasedNumber={() => set('showAddPurchasedNumberModal', true)}
              />
            </div>
          </div>
        </div>

        {/* Dialogs */}
        <ScheduleCallDialog
          open={state.showScheduleModal}
          onOpenChange={(open) => set('showScheduleModal', open)}
          scheduleDate={state.scheduleDate}
          scheduleTime={state.scheduleTime}
          confirmationType={state.confirmationType}
          retryCount={state.retryCount}
          onSchedule={(data) => {
            set('scheduledCalls', [...state.scheduledCalls, data]);
            set('showScheduleModal', false);
            toast({
              title: "Call Scheduled",
              description: "Your call has been scheduled successfully."
            });
          }}
        />

        <GetNewNumberDialog
          open={state.showGetNewNumberModal}
          onOpenChange={(open) => set('showGetNewNumberModal', open)}
          onPurchase={handleNumberPurchase}
        />

        <AddPurchasedNumberDialog
          open={state.showAddPurchasedNumberModal}
          onOpenChange={(open) => set('showAddPurchasedNumberModal', open)}
          onAdd={(data) => {
            set('phoneNumbers', [...state.phoneNumbers, data.number]);
            set('showAddPurchasedNumberModal', false);
            toast({
              title: "Number Added",
              description: "Your purchased number has been added successfully."
            });
          }}
        />

        <ActiveCallDialog
          open={state.showCallDialog}
          onOpenChange={(open) => set('showCallDialog', open)}
          transcript={state.callTranscript}
          userMessage={state.userMessage}
          isListening={state.isListening}
          isMuted={state.isMuted}
          volume={state.volume}
          onUserMessageChange={(message) => set('userMessage', message)}
          onSendMessage={() => {
            if (state.userMessage.trim()) {
              set('callTranscript', [...state.callTranscript, `User: ${state.userMessage}`]);
              set('userMessage', '');
              setTimeout(() => {
                set('callTranscript', [...state.callTranscript, 'AI: Message received']);
              }, 1000);
            }
          }}
          onToggleMute={() => set('isMuted', !state.isMuted)}
          onVolumeChange={(value) => set('volume', value)}
          onEndCall={() => {
            set('showCallDialog', false);
            toast({
              title: "Call Ended",
              description: "The call has been terminated."
            });
          }}
        />

        {state.incomingRingingCalls.length > 0 && (
          <IncomingCallDialog
            call={state.incomingRingingCalls[0]}
            onAccept={() => {
              set('incomingRingingCalls', []);
              set('showCallDialog', true);
              toast({
                title: "Call Connected",
                description: "You are now connected to the caller."
              });
            }}
            onDecline={() => {
              set('incomingRingingCalls', []);
              toast({
                title: "Call Declined",
                description: "The incoming call was declined."
              });
            }}
          />
        )}
      </div>
    </TooltipProvider>
  );
}