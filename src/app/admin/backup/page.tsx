"use client";

import { useState } from "react";
import { useToast } from "@/components/ToastProvider";

export default function BackupPage() {
  const { showToast } = useToast();
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [file, setFile] = useState<File | null>(null);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const response = await fetch("/api/admin/backup");
      if (!response.ok) {
        throw new Error("Failed to export backup");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `backup-${new Date().toISOString().split("T")[0]}.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      showToast("Backup exported successfully!", "success");
    } catch (error) {
      console.error("Export error:", error);
      showToast("Failed to export backup", "error");
    } finally {
      setIsExporting(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      // Check file type
      if (selectedFile.type !== "application/json" && !selectedFile.name.endsWith('.json')) {
        showToast("Please select a JSON file", "error");
        return;
      }
      
      // Check file size (warn if over 30MB, but still allow)
      const fileSizeMB = selectedFile.size / (1024 * 1024);
      if (fileSizeMB > 50) {
        showToast(`Warning: File is very large (${fileSizeMB.toFixed(1)}MB). This may take several minutes to restore.`, "info");
      } else if (fileSizeMB > 30) {
        showToast(`Large file detected (${fileSizeMB.toFixed(1)}MB). This may take a while.`, "info");
      }
      
      setFile(selectedFile);
    }
  };

  const handleImport = async () => {
    if (!file) {
      showToast("Please select a backup file", "error");
      return;
    }

    if (!confirm("This will overwrite all current data. Are you sure?")) {
      return;
    }

    setIsImporting(true);
    try {
      // Read file as text
      const text = await file.text();
      
      // Validate file is not empty
      if (!text || text.trim().length === 0) {
        throw new Error("Backup file is empty");
      }

      // Try to parse JSON
      let backup;
      try {
        backup = JSON.parse(text);
      } catch (parseError) {
        throw new Error(`Invalid JSON file. Please ensure you're using a valid backup file exported from this system. Error: ${parseError instanceof Error ? parseError.message : "Unknown parsing error"}`);
      }

      // Validate backup structure
      if (!backup.data && !backup.events && !backup.galleryImages) {
        throw new Error("Invalid backup file format. The file should contain a 'data' object with your backup data.");
      }

      // Prepare the data to send
      const backupData = backup.data || backup;

      // Make the API request
      const response = await fetch("/api/admin/backup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          data: backupData,
          confirmOverwrite: true,
        }),
      });

      // Check if response is JSON before parsing
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const textResponse = await response.text();
        throw new Error(`Server returned an error: ${textResponse.substring(0, 200)}`);
      }

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to import backup");
      }

      // Show success message with results
      const resultsSummary = result.results 
        ? `Events: ${result.results.events}, Gallery: ${result.results.galleryImages}, Team: ${result.results.teamMembers}, Updates: ${result.results.updates}`
        : "Backup restored";
      
      showToast(`Backup restored successfully! ${resultsSummary}`, "success");
      setFile(null);
      
      // Reset file input
      const fileInput = document.getElementById("backup-file") as HTMLInputElement;
      if (fileInput) fileInput.value = "";
    } catch (error) {
      console.error("Import error:", error);
      const errorMessage = error instanceof Error 
        ? error.message 
        : "Failed to import backup. Please check the file format and try again.";
      showToast(errorMessage, "error");
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Backup & Restore</h1>
        <p className="text-zinc-400">Export and restore your database data</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Export Section */}
        <div className="rounded-xl border border-white/10 bg-white/[0.02] p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Export Backup</h2>
          <p className="text-sm text-zinc-400 mb-4">
            Download a complete backup of all your data as a JSON file. This includes events, gallery images, team members, updates, statistics, and contact submissions.
          </p>
          <button
            onClick={handleExport}
            disabled={isExporting}
            className="w-full px-4 py-3 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-medium hover:from-cyan-500 hover:to-blue-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isExporting ? "Exporting..." : "Export Backup"}
          </button>
        </div>

        {/* Import Section */}
        <div className="rounded-xl border border-white/10 bg-white/[0.02] p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Restore Backup</h2>
          <p className="text-sm text-zinc-400 mb-4">
            Restore data from a previously exported backup file. This will overwrite all current data.
          </p>
          <div className="space-y-4">
            <input
              id="backup-file"
              type="file"
              accept=".json"
              onChange={handleFileSelect}
              className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-cyan-600 file:text-white hover:file:bg-cyan-500"
            />
            <button
              onClick={handleImport}
              disabled={isImporting || !file}
              className="w-full px-4 py-3 rounded-lg bg-gradient-to-r from-orange-600 to-red-600 text-white font-medium hover:from-orange-500 hover:to-red-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isImporting ? "Restoring..." : "Restore Backup"}
            </button>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-yellow-500/30 bg-yellow-500/10 p-4">
        <h3 className="text-sm font-semibold text-yellow-200 mb-2">⚠️ Important Notes</h3>
        <ul className="text-sm text-yellow-100/80 space-y-1 list-disc list-inside">
          <li>Backups include all data: events, gallery images, team members, updates, statistics, and contact submissions</li>
          <li>Restoring a backup will completely overwrite all current data</li>
          <li>Always export a backup before restoring to avoid data loss</li>
          <li>Backup files are in JSON format and can be quite large if you have many images</li>
        </ul>
      </div>
    </div>
  );
}


