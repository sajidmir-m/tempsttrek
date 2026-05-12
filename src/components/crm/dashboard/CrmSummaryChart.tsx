'use client';

import type { ChartOptions } from 'chart.js';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function CrmSummaryChart({
  arrivals,
  followupsDue,
  overdue,
}: {
  arrivals: number;
  followupsDue: number;
  overdue: number;
}) {
  const data = {
    labels: ['Arrivals in range', 'Follow-ups due', 'Overdue follow-ups'],
    datasets: [
      {
        label: 'Count',
        data: [arrivals, followupsDue, overdue],
        backgroundColor: ['rgba(13, 148, 136, 0.65)', 'rgba(14, 165, 233, 0.55)', 'rgba(244, 63, 94, 0.55)'],
        borderRadius: 8,
        borderSkipped: false as const,
      },
    ],
  };

  const options: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      title: {
        display: true,
        text: 'Pipeline snapshot',
        font: { size: 13, weight: 'bold' },
        color: '#334155',
      },
      tooltip: {
        backgroundColor: 'rgba(15, 23, 42, 0.92)',
        padding: 10,
        cornerRadius: 8,
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: '#64748b', maxRotation: 45, minRotation: 0, font: { size: 11 } },
      },
      y: {
        beginAtZero: true,
        ticks: { stepSize: 1, color: '#64748b' },
        grid: { color: 'rgba(148, 163, 184, 0.2)' },
      },
    },
  };

  return (
    <div className="h-56 w-full sm:h-64">
      <Bar data={data} options={options} />
    </div>
  );
}
