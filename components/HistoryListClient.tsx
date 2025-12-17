"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { Search, ChevronRight, Star, ListFilter, Calendar } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface HistoryItem {
  id: string;
  role: string;
  type: string;
  createdAt: string;
  score: number | null;
}

export default function HistoryListClient({ initialData }: { initialData: HistoryItem[] }) {
  const [mounted, setMounted] = useState(false);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("recent");

  useEffect(() => {
    setMounted(true);
  }, []);

  const filteredData = useMemo(() => {
    let result = [...initialData];

    if (search) {
      const term = search.toLowerCase();
      result = result.filter((iv) =>
        iv.role?.toLowerCase().includes(term) ||
        iv.type?.toLowerCase().includes(term)
      );
    }

    if (filter === "high-score") {
      result.sort((a, b) => (b.score ?? -1) - (a.score ?? -1));
    } else if (filter === "low-score") {
      result.sort((a, b) => {
        if (a.score === null) return 1;
        if (b.score === null) return -1;
        return a.score - b.score;
      });
    } else {
      result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    return result;
  }, [search, filter, initialData]);

  if (initialData.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center space-y-6 bg-dark-200 rounded-[32px] border border-dashed border-white/10">
        <Calendar className="w-12 h-12 text-gray-600" />
        <h3 className="text-xl font-bold text-white">No history found</h3>
        <Link href="/dashboard">
          <Button className="btn-primary">Start Practicing</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-primary-200 transition-colors" />
          <input
            type="text"
            placeholder="Search by school or program..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-dark-200 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-sm text-white focus:border-primary-200 outline-none transition-all"
          />
        </div>

        {mounted ? (
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-full sm:w-[200px] bg-dark-200 border-white/10 rounded-xl h-auto py-3 text-gray-300 focus:ring-primary-200/20">
              <div className="flex items-center gap-2">
                <ListFilter className="w-4 h-4 text-gray-400" />
                <SelectValue placeholder="Sort by" />
              </div>
            </SelectTrigger>
            <SelectContent className="bg-dark-200 border-white/10 text-white shadow-2xl">
              <SelectItem value="recent">Most Recent</SelectItem>
              <SelectItem value="high-score">Highest Score</SelectItem>
              <SelectItem value="low-score">Lowest Score</SelectItem>
            </SelectContent>
          </Select>
        ) : (
          <div className="w-full sm:w-[200px] h-[46px] bg-dark-200 border border-white/10 rounded-xl animate-pulse" />
        )}
      </div>

      <div className="bg-dark-200 rounded-[28px] border border-white/5 overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/[0.03] text-gray-500 text-[10px] uppercase tracking-[2px]">
                <th className="px-8 py-5 font-bold">Session Date</th>
                <th className="px-8 py-5 font-bold">Details</th>
                <th className="px-8 py-5 font-bold text-center">AI Score</th>
                <th className="px-8 py-5 font-bold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredData.map((iv) => (
                <tr key={iv.id} className="group hover:bg-white/[0.01] transition-all duration-300">
                  <td className="px-8 py-6">
                    <div className="text-sm text-white font-medium">
                      {new Date(iv.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </div>
                    <div className="text-[10px] text-gray-500 font-mono mt-0.5">
                       {new Date(iv.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="text-sm text-white font-bold">{iv.role}</div>
                    <div className="text-[10px] text-gray-400 uppercase tracking-widest mt-1">{iv.type}</div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex justify-center">
                      {/* FIXED LOGIC: Checks for non-null/undefined to allow 0 score */}
                      {(iv.score !== null && iv.score !== undefined) ? (
                        <div className="flex items-center gap-2 bg-primary-200/10 px-4 py-1.5 rounded-full border border-primary-200/20">
                          <Star className="w-3.5 h-3.5 text-primary-200 fill-primary-200" />
                          <span className="text-sm font-black text-primary-200">{iv.score}</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 px-3 py-1 bg-white/5 rounded-full border border-white/5">
                            <div className="w-1.5 h-1.5 rounded-full bg-yellow-500 animate-pulse" />
                            <span className="text-[9px] text-gray-500 font-bold uppercase tracking-wider">In Progress</span>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <Link href={iv.score !== null ? `/interview/${iv.id}/feedback` : `/interview/${iv.id}`}>
                      <Button variant="ghost" className="h-10 px-6 rounded-xl border border-white/5 hover:border-primary-200/30 text-gray-400 hover:text-white transition-all text-xs group/btn">
                        {iv.score !== null ? "Analysis" : "Resume"}
                        <ChevronRight className="w-4 h-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
                      </Button>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}