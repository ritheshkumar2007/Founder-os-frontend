import React, { useState } from "react";
import { X, Download, ShieldCheck, PieChart, Users, ArrowUpRight, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

interface CapTableModalProps {
  isOpen: boolean;
  onClose: () => void;
  ventureName: string;
}

interface Shareholder {
  id: string;
  name: string;
  type: "Founders" | "Investor" | "ESOP" | "Advisor";
  stockClass: string;
  ownershipPct: number;
  shares: string;
  invested: string;
  color: string;
}

const SAMPLE_SHAREHOLDERS: Shareholder[] = [
  {
    id: "sh-1",
    name: "Founding Team & Key Personnel",
    type: "Common",
    stockClass: "Class A Voting Common",
    ownershipPct: 45.0,
    shares: "4,500,000",
    invested: "$50,000",
    color: "#d4d4d8",
  },
  {
    id: "sh-2",
    name: "Sequoia Capital (Series A Lead)",
    type: "Investor",
    stockClass: "Series A Preferred",
    ownershipPct: 25.0,
    shares: "2,500,000",
    invested: "$15,000,000",
    color: "#71717a",
  },
  {
    id: "sh-3",
    name: "Founders Fund (Series B Lead)",
    type: "Investor",
    stockClass: "Series B Preferred",
    ownershipPct: 12.0,
    shares: "1,200,000",
    invested: "$25,000,000",
    color: "#c084fc",
  },
  {
    id: "sh-4",
    name: "Y Combinator (W24)",
    type: "Investor",
    stockClass: "Post-Money SAFE",
    ownershipPct: 7.0,
    shares: "700,000",
    invested: "$500,000",
    color: "#e0e3e7",
  },
  {
    id: "sh-5",
    name: "Unallocated Employee Option Pool (ESOP)",
    type: "ESOP",
    stockClass: "Common Reserve",
    ownershipPct: 10.0,
    shares: "1,000,000",
    invested: "$0",
    color: "#6d28d9",
  },
  {
    id: "sh-6",
    name: "Strategic Advisors",
    type: "Advisor",
    stockClass: "Advisory Common",
    ownershipPct: 1.0,
    shares: "100,000",
    invested: "$0",
    color: "#958ea0",
  },
];

export const CapTableModal: React.FC<CapTableModalProps> = ({
  isOpen,
  onClose,
  ventureName,
}) => {
  if (!isOpen) return null;

  const handleExportCsv = () => {
    const headers = "Shareholder,Type,Stock Class,Ownership %,Shares,Invested\n";
    const rows = SAMPLE_SHAREHOLDERS.map(
      (s) => `"${s.name}","${s.type}","${s.stockClass}","${s.ownershipPct}%","${s.shares}","${s.invested}"`
    ).join("\n");

    const blob = new Blob([headers + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `${ventureName.replace(/\s+/g, "_")}_Cap_Table.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Cap Table CSV exported successfully.");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#020408]/85 backdrop-blur-xl animate-fade-in select-none">
      <div className="w-full max-w-4xl rounded-2xl border border-white/10 bg-[#0b0f12] text-[#e0e3e7] shadow-[0_25px_60px_rgba(0,0,0,0.8),0_0_35px_rgba(139,92,246,0.2)] overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-[#101417]">
          <div className="flex items-center gap-3">
            <div className="size-9 rounded-xl bg-zinc-800/60 border border-white/10 flex items-center justify-center text-zinc-300 shadow-[0_4px_20px_rgba(0,0,0,0.5)]">
              <PieChart className="size-5" />
            </div>
            <div>
              <h3 className="font-display text-lg font-bold text-white tracking-tight flex items-center gap-2">
                Fully Diluted Cap Table
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-800/60 text-zinc-300 border border-white/10">
                  VERIFIED AUDIT
                </span>
              </h3>
              <p className="text-xs font-mono text-[#cbc3d7]/70">
                Entity: {ventureName || "Active Venture"} • Total Authorized: 10,000,000 Shares
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#958ea0] hover:text-white hover:bg-white/5 transition cursor-pointer"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Ownership Distribution Bar */}
        <div className="px-6 py-4 border-b border-white/5 bg-[#101417]/50 space-y-2">
          <div className="flex justify-between items-center text-xs font-mono">
            <span className="text-[#958ea0]">Equity Allocation Breakdown:</span>
            <span className="text-white font-bold">100.0% Allocated</span>
          </div>
          <div className="w-full h-3 rounded-full overflow-hidden flex border border-white/10">
            {SAMPLE_SHAREHOLDERS.map((s) => (
              <div
                key={s.id}
                style={{ width: `${s.ownershipPct}%`, backgroundColor: s.color }}
                title={`${s.name}: ${s.ownershipPct}%`}
                className="h-full transition-all hover:opacity-80"
              />
            ))}
          </div>
          <div className="flex flex-wrap gap-3 pt-1 text-[11px] font-mono">
            {SAMPLE_SHAREHOLDERS.map((s) => (
              <div key={s.id} className="flex items-center gap-1.5">
                <span className="size-2 rounded-full" style={{ backgroundColor: s.color }} />
                <span className="text-[#cbc3d7]">{s.type}:</span>
                <span className="text-white font-bold">{s.ownershipPct}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Table Body */}
        <div className="p-6 overflow-y-auto flex-1">
          <div className="rounded-xl border border-white/10 overflow-hidden bg-[#0e131c]">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-[#181c1f] text-[#958ea0] border-b border-white/10">
                <tr>
                  <th className="p-3">Shareholder Entity</th>
                  <th className="p-3">Stock Class</th>
                  <th className="p-3 text-right">Shares</th>
                  <th className="p-3 text-right">Ownership</th>
                  <th className="p-3 text-right">Capital Paid</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-[#e0e3e7]">
                {SAMPLE_SHAREHOLDERS.map((s) => (
                  <tr key={s.id} className="hover:bg-white/[0.02] transition">
                    <td className="p-3 font-semibold text-white flex items-center gap-2">
                      <span className="size-2 rounded-full shrink-0" style={{ backgroundColor: s.color }} />
                      <span>{s.name}</span>
                    </td>
                    <td className="p-3 text-[#cbc3d7]">{s.stockClass}</td>
                    <td className="p-3 text-right text-white font-bold">{s.shares}</td>
                    <td className="p-3 text-right text-zinc-300 font-bold">{s.ownershipPct.toFixed(1)}%</td>
                    <td className="p-3 text-right text-[#cbc3d7]">{s.invested}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-white/10 bg-[#101417] flex justify-between items-center text-xs font-mono">
          <button
            onClick={handleExportCsv}
            className="px-4 py-2 rounded-lg bg-[#181c1f] text-white hover:bg-white/10 transition border border-white/10 flex items-center gap-2 cursor-pointer"
          >
            <Download className="size-3.5 text-zinc-300" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={onClose}
            className="btn-system text-white font-bold px-5 py-2 rounded-lg transition shadow-[0_4px_20px_rgba(0,0,0,0.5)] cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
