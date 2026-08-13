import React, { useState } from "react";
import { X, FolderLock, Download, Eye, FileText, Table, Gavel, Shield, Plus, Search, CheckCircle2, Lock } from "lucide-react";
import { toast } from "sonner";

interface DataRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  ventureName: string;
}

interface DataRoomDoc {
  id: string;
  name: string;
  category: "Financials" | "Governance" | "Pitch Decks" | "Legal";
  format: "pdf" | "xlsx" | "csv" | "docx";
  size: string;
  updatedAt: string;
  accessLevel: "CONFIDENTIAL" | "STRICT_RESTRICTED" | "INVESTOR_ONLY";
  downloadsCount: number;
}

const SAMPLE_DOCS: DataRoomDoc[] = [
  {
    id: "doc-1",
    name: "Board_Deck_Q3.pdf",
    category: "Pitch Decks",
    format: "pdf",
    size: "4.8 MB",
    updatedAt: "Updated 2 days ago",
    accessLevel: "CONFIDENTIAL",
    downloadsCount: 14,
  },
  {
    id: "doc-2",
    name: "Financial_Model_v4.xlsx",
    category: "Financials",
    format: "xlsx",
    size: "2.1 MB",
    updatedAt: "Updated 1 week ago",
    accessLevel: "CONFIDENTIAL",
    downloadsCount: 28,
  },
  {
    id: "doc-3",
    name: "Term_Sheet_Draft.pdf",
    category: "Legal",
    format: "pdf",
    size: "640 KB",
    updatedAt: "Updated 2 weeks ago",
    accessLevel: "STRICT_RESTRICTED",
    downloadsCount: 8,
  },
  {
    id: "doc-4",
    name: "Cap_Table_Detailed_Ledger.csv",
    category: "Governance",
    format: "csv",
    size: "180 KB",
    updatedAt: "Updated 3 days ago",
    accessLevel: "INVESTOR_ONLY",
    downloadsCount: 19,
  },
  {
    id: "doc-5",
    name: "SOC2_Type_II_Compliance_Audit.pdf",
    category: "Legal",
    format: "pdf",
    size: "1.4 MB",
    updatedAt: "Updated 1 month ago",
    accessLevel: "CONFIDENTIAL",
    downloadsCount: 11,
  },
  {
    id: "doc-6",
    name: "Unit_Economics_Cohort_Retention.xlsx",
    category: "Financials",
    format: "xlsx",
    size: "3.2 MB",
    updatedAt: "Updated 5 days ago",
    accessLevel: "INVESTOR_ONLY",
    downloadsCount: 32,
  },
];

export const DataRoomModal: React.FC<DataRoomModalProps> = ({
  isOpen,
  onClose,
  ventureName,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [previewDoc, setPreviewDoc] = useState<DataRoomDoc | null>(null);

  if (!isOpen) return null;

  const categories = ["All", "Financials", "Governance", "Pitch Decks", "Legal"];

  const filteredDocs = SAMPLE_DOCS.filter((doc) => {
    const matchesCat = selectedCategory === "All" || doc.category === selectedCategory;
    const matchesSearch = doc.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const handleDownload = (doc: DataRoomDoc) => {
    const dummyContent = `FounderOS Virtual Data Room Document: ${doc.name}\nEntity: ${ventureName}\nAccess Level: ${doc.accessLevel}\nDownloaded on: ${new Date().toISOString()}\n\n[CONFIDENTIAL INVESTOR MATERIAL - FOR RECIPIENT USE ONLY]`;
    const blob = new Blob([dummyContent], { type: "text/plain;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", doc.name);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success(`Downloaded: ${doc.name}`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#020408]/85 backdrop-blur-xl animate-fade-in select-none">
      <div className="w-full max-w-4xl rounded-2xl border border-[rgba(139,92,246,0.4)] bg-[#0b0f12] text-[#e0e3e7] shadow-[0_25px_60px_rgba(0,0,0,0.8),0_0_35px_rgba(139,92,246,0.2)] overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[rgba(139,92,246,0.25)] bg-[#101417]">
          <div className="flex items-center gap-3">
            <div className="size-9 rounded-xl bg-[rgba(139,92,246,0.15)] border border-[rgba(139,92,246,0.3)] flex items-center justify-center text-[#A78BFA] shadow-[0_0_12px_rgba(139,92,246,0.3)]">
              <FolderLock className="size-5" />
            </div>
            <div>
              <h3 className="font-display text-lg font-bold text-white tracking-tight flex items-center gap-2">
                Virtual Data Room
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[rgba(139,92,246,0.15)] text-[#A78BFA] border border-[rgba(139,92,246,0.3)]">
                  ENCRYPTED AES-256
                </span>
              </h3>
              <p className="text-xs font-mono text-[#cbc3d7]/70">
                Secure investor diligence vault for {ventureName || "Active Venture"}
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

        {/* Filter & Search Bar */}
        <div className="px-6 py-3 border-b border-white/5 bg-[#101417]/50 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 overflow-x-auto">
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => setSelectedCategory(c)}
                className={`px-3 py-1 rounded-lg text-xs font-mono transition-all cursor-pointer ${
                  selectedCategory === c
                    ? "bg-[#A78BFA] text-black font-bold shadow-[0_0_10px_rgba(139,92,246,0.4)]"
                    : "bg-[#181c1f] text-[#cbc3d7] hover:text-white border border-white/5"
                }`}
              >
                {c}
              </button>
            ))}
          </div>

          <div className="relative">
            <Search className="size-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#958ea0]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search data room..."
              className="bg-[#020408] border border-[rgba(139,92,246,0.3)] rounded-lg pl-8 pr-3 py-1.5 text-xs font-mono text-white placeholder-[#958ea0] focus:outline-none focus:border-[#A78BFA] w-full sm:w-56"
            />
          </div>
        </div>

        {/* Document List Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-3">
          {filteredDocs.map((doc) => (
            <div
              key={doc.id}
              className="glass-card rounded-xl p-4 border border-[rgba(139,92,246,0.25)] hover:border-[rgba(139,92,246,0.6)] transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <div
                  className={`size-10 rounded-lg flex items-center justify-center shrink-0 ${
                    doc.format === "pdf"
                      ? "bg-[rgba(139,92,246,0.15)] text-[#A78BFA]"
                      : doc.format === "xlsx" || doc.format === "csv"
                      ? "bg-[rgba(139,92,246,0.15)] text-[#A78BFA]"
                      : "bg-[#262a2e] text-[#cbc3d7]"
                  }`}
                >
                  {doc.format === "pdf" ? (
                    <FileText className="size-5" />
                  ) : doc.format === "xlsx" || doc.format === "csv" ? (
                    <Table className="size-5" />
                  ) : (
                    <Gavel className="size-5" />
                  )}
                </div>

                <div className="min-w-0">
                  <h4 className="font-mono text-sm font-semibold text-white truncate">
                    {doc.name}
                  </h4>
                  <div className="flex flex-wrap items-center gap-2 mt-0.5 text-[11px] font-mono text-[#958ea0]">
                    <span>{doc.size}</span>
                    <span>•</span>
                    <span>{doc.updatedAt}</span>
                    <span>•</span>
                    <span className="text-[#cbc3d7]">{doc.downloadsCount} downloads</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-center">
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#181c1f] text-[#A78BFA] border border-[rgba(139,92,246,0.2)]">
                  {doc.accessLevel}
                </span>
                <button
                  onClick={() => setPreviewDoc(doc)}
                  className="p-2 rounded-lg bg-[#181c1f] text-[#cbc3d7] hover:text-white hover:bg-white/10 transition border border-white/5 cursor-pointer"
                  title="Quick Preview"
                >
                  <Eye className="size-3.5" />
                </button>
                <button
                  onClick={() => handleDownload(doc)}
                  className="px-3 py-1.5 rounded-lg bg-[#A78BFA] text-black font-bold font-mono text-xs hover:bg-[#bfa8ff] transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Download className="size-3.5" />
                  <span>Download</span>
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Preview Sub-Modal / Drawer */}
        {previewDoc && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-[#020408]/90 backdrop-blur-md animate-fade-in">
            <div className="w-full max-w-lg rounded-2xl border border-[rgba(139,92,246,0.4)] bg-[#0b0f12] p-6 shadow-2xl space-y-4">
              <div className="flex justify-between items-start border-b border-white/5 pb-3">
                <div>
                  <span className="text-[10px] font-mono text-[#A78BFA] uppercase">Document Preview</span>
                  <h3 className="text-base font-bold font-mono text-white">{previewDoc.name}</h3>
                </div>
                <button onClick={() => setPreviewDoc(null)} className="p-1 text-[#958ea0] hover:text-white">
                  <X className="size-4" />
                </button>
              </div>
              <div className="p-6 rounded-xl border border-white/10 bg-[#020408] text-center space-y-2 relative overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-5 text-4xl font-bold font-mono uppercase text-white rotate-[-25deg]">
                  CONFIDENTIAL
                </div>
                <Lock className="size-8 text-[#A78BFA] mx-auto" />
                <h4 className="font-mono text-sm text-white font-bold">{previewDoc.name}</h4>
                <p className="text-xs text-[#958ea0] max-w-xs mx-auto">
                  Watermarked document encrypted for verified institutional investors.
                </p>
              </div>
              <div className="flex justify-end gap-2 text-xs font-mono">
                <button
                  onClick={() => setPreviewDoc(null)}
                  className="px-4 py-2 rounded-lg bg-[#181c1f] text-white hover:bg-white/10"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    handleDownload(previewDoc);
                    setPreviewDoc(null);
                  }}
                  className="px-4 py-2 rounded-lg bg-[#A78BFA] text-black font-bold hover:bg-[#bfa8ff]"
                >
                  Download Full File
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-[rgba(139,92,246,0.25)] bg-[#101417] flex justify-between items-center text-xs font-mono text-[#958ea0]">
          <span>Audit Trail: All file access is logged with cryptographic hash signatures.</span>
          <button
            onClick={onClose}
            className="bg-[#181c1f] hover:bg-white/10 text-white font-mono px-4 py-2 rounded-lg border border-white/10 cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
