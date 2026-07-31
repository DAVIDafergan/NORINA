"use client";

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { formatPrice } from "@/lib/format";

export function SalesChart({ data }: { data: { date: string; total: number }[] }) {
  const formatted = data.map((point) => ({
    ...point,
    label: new Date(point.date).toLocaleDateString("he-IL", { day: "2-digit", month: "2-digit" }),
  }));

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={formatted}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" />
          <XAxis dataKey="label" fontSize={12} />
          <YAxis fontSize={12} width={60} />
          <Tooltip formatter={(value) => formatPrice(Number(value ?? 0), "he")} />
          <Line type="monotone" dataKey="total" stroke="#18181b" strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
