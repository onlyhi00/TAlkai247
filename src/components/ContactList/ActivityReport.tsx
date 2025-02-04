import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Contact, TimelineEvent } from '@/types/contact';
import { BarChart, Calendar, Download } from 'lucide-react';

interface ActivityReportProps {
  contacts: Contact[];
}

interface ActivityStats {
  totalContacts: number;
  activeContacts: number;
  totalInteractions: number;
  interactionsByType: Record<string, number>;
  contactsByType: Record<string, number>;
  recentActivity: TimelineEvent[];
}

export function ActivityReport({ contacts }: ActivityReportProps) {
  const [showDialog, setShowDialog] = React.useState(false);
  const [timeRange, setTimeRange] = React.useState('7d');
  const [stats, setStats] = React.useState<ActivityStats | null>(null);

  React.useEffect(() => {
    if (showDialog) {
      const now = new Date();
      const rangeInDays = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
      const startDate = new Date(now.getTime() - rangeInDays * 24 * 60 * 60 * 1000);

      const recentActivity = contacts
        .flatMap(contact => (contact.timeline || [])
          .filter(event => new Date(event.date) >= startDate)
        )
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

      const stats: ActivityStats = {
        totalContacts: contacts.length,
        activeContacts: contacts.filter(contact => 
          contact.timeline?.some(event => new Date(event.date) >= startDate)
        ).length,
        totalInteractions: recentActivity.length,
        interactionsByType: recentActivity.reduce((acc, event) => ({
          ...acc,
          [event.type]: (acc[event.type] || 0) + 1
        }), {} as Record<string, number>),
        contactsByType: contacts.reduce((acc, contact) => ({
          ...acc,
          [contact.type]: (acc[contact.type] || 0) + 1
        }), {} as Record<string, number>),
        recentActivity
      };

      setStats(stats);
    }
  }, [contacts, timeRange, showDialog]);

  const exportReport = () => {
    if (!stats) return;

    const content = `Activity Report (${timeRange})
${'-'.repeat(50)}

Summary:
- Total Contacts: ${stats.totalContacts}
- Active Contacts: ${stats.activeContacts}
- Total Interactions: ${stats.totalInteractions}

Contact Types:
${Object.entries(stats.contactsByType)
  .map(([type, count]) => `- ${type}: ${count}`)
  .join('\n')}

Interaction Types:
${Object.entries(stats.interactionsByType)
  .map(([type, count]) => `- ${type}: ${count}`)
  .join('\n')}

Recent Activity:
${stats.recentActivity
  .map(event => `${new Date(event.date).toLocaleDateString()} - ${event.type}: ${event.description}`)
  .join('\n')}`;

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `activity-report-${timeRange}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <Button
        variant="outline"
        onClick={() => setShowDialog(true)}
        className="bg-gray-700 hover:bg-gray-600"
      >
        <BarChart className="mr-2 h-4 w-4" />
        Activity Report
      </Button>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="bg-gray-800 text-white max-w-2xl">
          <DialogHeader>
            <DialogTitle>Activity Report</DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <Select
                value={timeRange}
                onValueChange={setTimeRange}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select time range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7d">Last 7 days</SelectItem>
                  <SelectItem value="30d">Last 30 days</SelectItem>
                  <SelectItem value="90d">Last 90 days</SelectItem>
                </SelectContent>
              </Select>

              <Button
                variant="outline"
                onClick={exportReport}
                className="bg-gray-700 hover:bg-gray-600"
              >
                <Download className="mr-2 h-4 w-4" />
                Export Report
              </Button>
            </div>

            {stats && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-700 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold mb-2">Contacts</h3>
                    <p>Total: {stats.totalContacts}</p>
                    <p>Active: {stats.activeContacts}</p>
                  </div>
                  <div className="bg-gray-700 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold mb-2">Interactions</h3>
                    <p>Total: {stats.totalInteractions}</p>
                  </div>
                </div>

                <div className="bg-gray-700 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold mb-2">Recent Activity</h3>
                  <div className="space-y-2">
                    {stats.recentActivity.slice(0, 5).map((event, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <span>{new Date(event.date).toLocaleDateString()}</span>
                        <span>-</span>
                        <span>{event.type}:</span>
                        <span className="text-gray-400">{event.description}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}