import { useState } from "react";
import { uploadDocument } from "../api/documentApi";

function UploadDocument({ onUploaded }) {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleUpload = async (e) => {
    e.preventDefault();

    if (!file) {
      alert("Please select a file first.");
      return;
    }

    try {
      setLoading(true);
      setResult(null);

      const data = await uploadDocument(file);
      setResult(data);

      setFile(null);
      e.target.reset();

      if (onUploaded) onUploaded();
    } catch (error) {
      console.error(error);
      alert("Upload failed.");
    } finally {
      setLoading(false);
    }
  };

  const status = result?.document?.status;

  return (
    <div className="overflow-hidden rounded-3xl border border-white/10 bg-white p-6 shadow-xl">
      <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="mb-2 inline-flex rounded-full bg-cyan-50 px-3 py-1 text-xs font-semibold text-cyan-700">
            New document
          </p>

          <h2 className="text-2xl font-bold text-slate-900">
            Upload document
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Upload PDF, TXT, CSV or image files and let the system extract and
            validate document data.
          </p>
        </div>
      </div>

      <form onSubmit={handleUpload} className="grid gap-4 lg:grid-cols-[1fr_auto]">
        <label className="flex cursor-pointer flex-col items-center justify-center rounded-3xl border-2 border-dashed border-slate-300 bg-slate-50 px-6 py-8 text-center transition hover:border-cyan-400 hover:bg-cyan-50">
          <input
            type="file"
            accept=".pdf,.txt,.csv,.png,.jpg,.jpeg"
            onChange={(e) => setFile(e.target.files[0])}
            className="hidden"
          />

          <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-2xl shadow-sm">
            📄
          </div>

          <p className="text-sm font-semibold text-slate-800">
            {file ? file.name : "Click to select a document"}
          </p>

          <p className="mt-1 text-xs text-slate-500">
            Supported: PDF, TXT, CSV, PNG, JPG, JPEG
          </p>
        </label>

        <button
          type="submit"
          disabled={loading}
          className="rounded-2xl bg-slate-900 px-6 py-4 text-sm font-semibold text-white shadow-lg transition hover:bg-cyan-700 disabled:cursor-not-allowed disabled:bg-slate-400 lg:min-w-48"
        >
          {loading ? "Processing..." : "Upload and process"}
        </button>
      </form>

      {result && (
        <div className="mt-5 rounded-3xl border border-slate-200 bg-slate-50 p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-slate-500">Processing result</p>
              <p className="mt-1 text-lg font-bold text-slate-900">
                Status: {status || "Unknown"}
              </p>
            </div>

            <span
              className={`w-fit rounded-full border px-3 py-1 text-xs font-semibold ${
                status === "Validated" || status === "valid"
                  ? "border-emerald-200 bg-emerald-100 text-emerald-700"
                  : status === "Needs Review" || status === "needs_review"
                  ? "border-amber-200 bg-amber-100 text-amber-700"
                  : "border-red-200 bg-red-100 text-red-700"
              }`}
            >
              {status || "Unknown"}
            </span>
          </div>

          {result.issues?.length > 0 ? (
            <ul className="mt-4 space-y-2 rounded-2xl border border-red-100 bg-white p-4 text-sm text-red-600">
              {result.issues.map((issue, index) => (
                <li key={index}>• {issue}</li>
              ))}
            </ul>
          ) : (
            <p className="mt-4 rounded-2xl border border-emerald-100 bg-white p-4 text-sm font-medium text-emerald-600">
              No validation issues detected.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

export default UploadDocument;