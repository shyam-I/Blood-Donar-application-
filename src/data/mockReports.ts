export interface Report {
  id: string;
  title: string;
  value: number | string;
  description: string;
}

export const mockReports: Report[] = [
  {
    id: 'rep1',
    title: 'Total Donors',
    value: 1250,
    description: 'Active donors registered in the district',
  },
  {
    id: 'rep2',
    title: 'Blood Units Collected',
    value: 840,
    description: 'Total units collected this year',
  },
  {
    id: 'rep3',
    title: 'Emergency Requests Fulfilled',
    value: 320,
    description: 'Emergency requests successfully closed',
  },
];
