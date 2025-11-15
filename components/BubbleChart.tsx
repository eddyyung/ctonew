'use client';

import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  ZAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';

interface BubbleData {
  id: string;
  label: string;
  x: number;
  y: number;
  radius: number;
  metadata: {
    channelTitle: string;
    publishedAt: string;
    comments: number;
    views: number;
    likes: number;
  };
}

interface BubbleChartProps {
  data: BubbleData[];
}

const COLORS = [
  '#3b82f6',
  '#ef4444',
  '#10b981',
  '#f59e0b',
  '#8b5cf6',
  '#ec4899',
  '#14b8a6',
  '#f97316',
  '#6366f1',
  '#84cc16',
  '#06b6d4',
  '#a855f7',
];

const formatNumber = (num: number): string => {
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`;
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`;
  }
  return num.toString();
};

const CustomTooltip = ({
  active,
  payload,
}: {
  active?: boolean;
  payload?: { payload: BubbleData }[];
}) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-4 max-w-xs">
        <p className="font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">
          {data.label}
        </p>
        <div className="space-y-1 text-sm text-gray-700 dark:text-gray-300">
          <p>
            <span className="font-medium">Channel:</span> {data.metadata.channelTitle}
          </p>
          <p>
            <span className="font-medium">Views:</span> {formatNumber(data.metadata.views)}
          </p>
          <p>
            <span className="font-medium">Likes:</span> {formatNumber(data.metadata.likes)}
          </p>
          <p>
            <span className="font-medium">Comments:</span> {formatNumber(data.metadata.comments)}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
            Published: {new Date(data.metadata.publishedAt).toLocaleDateString()}
          </p>
        </div>
      </div>
    );
  }
  return null;
};

export default function BubbleChart({ data }: BubbleChartProps) {
  const chartData = data.map((item) => ({
    ...item,
    z: item.radius * 100,
  }));

  return (
    <div className="w-full" style={{ height: '500px' }}>
      <ResponsiveContainer width="100%" height="100%">
        <ScatterChart margin={{ top: 20, right: 20, bottom: 60, left: 60 }}>
          <XAxis
            type="number"
            dataKey="x"
            name="Views"
            label={{
              value: 'Views',
              position: 'bottom',
              offset: 40,
              style: { fill: 'currentColor' },
            }}
            tickFormatter={formatNumber}
            stroke="currentColor"
          />
          <YAxis
            type="number"
            dataKey="y"
            name="Likes"
            label={{
              value: 'Likes',
              angle: -90,
              position: 'left',
              offset: 40,
              style: { fill: 'currentColor' },
            }}
            tickFormatter={formatNumber}
            stroke="currentColor"
          />
          <ZAxis type="number" dataKey="z" range={[100, 2000]} name="Comments" />
          <Tooltip content={<CustomTooltip />} cursor={{ strokeDasharray: '3 3' }} />
          <Scatter data={chartData} fill="#8884d8">
            {chartData.map((entry, index) => (
              <Cell key={`cell-${entry.id}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Scatter>
        </ScatterChart>
      </ResponsiveContainer>
      <div className="mt-4 text-sm text-gray-600 dark:text-gray-400 text-center">
        <p>Bubble size represents comment count. Hover over bubbles for details.</p>
      </div>
    </div>
  );
}
