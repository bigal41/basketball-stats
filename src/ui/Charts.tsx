import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

const axisStyle = {
  fill: 'var(--chart-axis)',
  fontSize: 12,
};

interface TeamTrendChartProps {
  data: Array<{
    game: string;
    points: number;
    differential: number;
  }>;
}

export const TeamTrendChart = ({ data }: TeamTrendChartProps) => (
  <div className="h-72 w-full">
    <ResponsiveContainer>
      <LineChart data={data}>
        <CartesianGrid stroke="var(--chart-grid)" strokeDasharray="3 3" />
        <XAxis dataKey="game" tick={axisStyle} />
        <YAxis tick={axisStyle} />
        <Tooltip />
        <Legend />
        <Line type="monotone" dataKey="points" stroke="#fb923c" strokeWidth={3} />
        <Line type="monotone" dataKey="differential" stroke="#34d399" strokeWidth={3} />
      </LineChart>
    </ResponsiveContainer>
  </div>
);

interface PlayerBarChartProps {
  data: Array<{
    name: string;
    value: number;
    attempts?: number;
  }>;
  barKey?: string;
  attemptKey?: string;
}

export const PlayerBarChart = ({
  data,
  barKey = 'value',
  attemptKey,
}: PlayerBarChartProps) => (
  <div className="h-72 w-full">
    <ResponsiveContainer>
      <BarChart data={data}>
        <CartesianGrid stroke="var(--chart-grid)" strokeDasharray="3 3" />
        <XAxis dataKey="name" tick={axisStyle} />
        <YAxis tick={axisStyle} />
        <Tooltip />
        <Legend />
        <Bar dataKey={barKey} fill="#fb923c" radius={[6, 6, 0, 0]} />
        {attemptKey ? <Bar dataKey={attemptKey} fill="#60a5fa" radius={[6, 6, 0, 0]} /> : null}
      </BarChart>
    </ResponsiveContainer>
  </div>
);

interface PlayerTrendChartProps {
  data: Array<{
    label: string;
    pts: number;
    reb: number;
    ast: number;
    fgPct: number;
    tpPct: number;
  }>;
}

export const PlayerTrendChart = ({ data }: PlayerTrendChartProps) => (
  <div className="grid gap-6 lg:grid-cols-2">
    <div className="h-72 w-full">
      <ResponsiveContainer>
        <LineChart data={data}>
          <CartesianGrid stroke="var(--chart-grid)" strokeDasharray="3 3" />
          <XAxis dataKey="label" tick={axisStyle} />
          <YAxis tick={axisStyle} />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="pts" stroke="#fb923c" strokeWidth={3} />
          <Line type="monotone" dataKey="reb" stroke="#60a5fa" strokeWidth={3} />
          <Line type="monotone" dataKey="ast" stroke="#34d399" strokeWidth={3} />
        </LineChart>
      </ResponsiveContainer>
    </div>
    <div className="h-72 w-full">
      <ResponsiveContainer>
        <LineChart data={data}>
          <CartesianGrid stroke="var(--chart-grid)" strokeDasharray="3 3" />
          <XAxis dataKey="label" tick={axisStyle} />
          <YAxis tick={axisStyle} domain={[0, 1]} tickFormatter={(value) => `${value * 100}%`} />
          <Tooltip formatter={(value: number) => `${(value * 100).toFixed(1)}%`} />
          <Legend />
          <Line type="monotone" dataKey="fgPct" stroke="#f59e0b" strokeWidth={3} />
          <Line type="monotone" dataKey="tpPct" stroke="#a78bfa" strokeWidth={3} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  </div>
);
