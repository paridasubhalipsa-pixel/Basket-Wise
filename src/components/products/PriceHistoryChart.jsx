import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import { TrendingDown, ShieldCheck, HelpCircle } from 'lucide-react';

export const PriceHistoryChart = ({
  priceHistory,
  currentPrice,
}) => {
  if (!priceHistory || priceHistory.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-6 text-center">
        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-3 text-slate-400">
          <HelpCircle className="w-5 h-5" />
        </div>
        <h4 className="text-sm font-semibold text-slate-900 mb-1">
          No Historical Observations Yet
        </h4>
        <p className="text-xs text-slate-500 max-w-sm mx-auto">
          Price history tracking is compiled through continuous verified retailer checks.
          As new price points are observed, an interactive timeline will appear here.
        </p>
      </div>
    );
  }

  const chartData = priceHistory.map((item) => {
    const d = new Date(item.observedAt);
    const dateFormatted = d.toLocaleDateString('en-IN', {
      month: 'short',
      day: 'numeric',
    });

    return {
      date: dateFormatted,
      price: item.price,
      seller: item.sellerName,
      fullDate: d.toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }),
      source: item.dataSource,
    };
  });

  const prices = chartData.map((d) => d.price);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const priceDiff = prices[0] - prices[prices.length - 1];
  const isDrop = priceDiff > 0;

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-semibold text-slate-900">
              Verified Price History
            </h3>
            <span className="flex items-center gap-1 text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
              <ShieldCheck className="w-3 h-3" />
              <span>Verified Observations</span>
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Tracking lowest recorded offer trends across verified sellers over time
          </p>
        </div>

        {/* Trend summary */}
        <div className="flex items-center gap-4 text-xs font-mono tabular-nums">
          <div>
            <span className="text-slate-400 block text-[10px] font-sans">All-Time Low</span>
            <span className="font-bold text-emerald-600">
              ₹{minPrice.toLocaleString('en-IN')}
            </span>
          </div>
          <div className="h-6 w-px bg-slate-200" />
          <div>
            <span className="text-slate-400 block text-[10px] font-sans">Recorded High</span>
            <span className="font-bold text-slate-700">
              ₹{maxPrice.toLocaleString('en-IN')}
            </span>
          </div>
          {priceDiff !== 0 && (
            <>
              <div className="h-6 w-px bg-slate-200" />
              <div>
                <span className="text-slate-400 block text-[10px] font-sans">Trend</span>
                <span
                  className={`font-bold flex items-center gap-1 ${
                    isDrop ? 'text-emerald-600' : 'text-slate-700'
                  }`}
                >
                  {isDrop && <TrendingDown className="w-3.5 h-3.5" />}
                  <span>{isDrop ? '-' : '+'}₹{Math.abs(priceDiff).toLocaleString('en-IN')}</span>
                </span>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10B981" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={{ stroke: '#CBD5E1' }}
              tick={{ fill: '#64748B', fontSize: 11 }}
            />
            <YAxis
              tickLine={false}
              axisLine={{ stroke: '#CBD5E1' }}
              tick={{ fill: '#64748B', fontSize: 11 }}
              tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`}
              domain={['dataMin - 1000', 'dataMax + 1000']}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div className="bg-slate-900 text-white p-3 rounded-lg text-xs shadow-xl border border-slate-700 space-y-1">
                      <p className="font-semibold text-slate-300">{data.fullDate}</p>
                      <p className="text-base font-bold text-emerald-400 font-mono tabular-nums">
                        ₹{data.price.toLocaleString('en-IN')}
                      </p>
                      <p className="text-[11px] text-slate-400">Seller: {data.seller}</p>
                      <p className="text-[10px] text-slate-500 italic">{data.source}</p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Area
              type="monotone"
              dataKey="price"
              stroke="#10B981"
              strokeWidth={2.5}
              fillOpacity={1}
              fill="url(#priceGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
        <span>Current Best Offer: ₹{currentPrice.toLocaleString('en-IN')}</span>
        <span>Source: BasketWise Verified Observation Index</span>
      </div>
    </div>
  );
};
