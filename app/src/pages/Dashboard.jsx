import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { getDocuments, getTotalsByCurrency } from "../api/documentApi";
import UploadDocument from "../pages/UploadDocument";

function Dashboard() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totals, setTotals] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  const loadDocuments = async () => {
    try {
      setLoading(true);

      const docsData = await getDocuments();
      setDocuments(docsData);

      const totalsData = await getTotalsByCurrency();
      setTotals(totalsData);
    } catch (error) {
      console.error(error);
      alert("Failed to load data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDocuments();
  }, []);

  const filteredDocuments = useMemo(() => {
    const search = searchTerm.toLowerCase().trim();

    if (!search) return documents;

    return documents.filter((doc) => {
      return (
        doc.file_name?.toLowerCase().includes(search) ||
        doc.document_type?.toLowerCase().includes(search) ||
        doc.supplier?.toLowerCase().includes(search) ||
        doc.document_number?.toLowerCase().includes(search) ||
        doc.currency?.toLowerCase().includes(search) ||
        doc.status?.toLowerCase().includes(search)
      );
    });
  }, [documents, searchTerm]);

  const totalDocuments = documents.length;

  const validatedCount = documents.filter(
    (doc) =>
      doc.status === "Validated" ||
      doc.status === "valid" ||
      doc.status === "validated"
  ).length;

  const needsReviewCount = documents.filter(
    (doc) =>
      doc.status === "Needs Review" ||
      doc.status === "needs_review" ||
      doc.status === "needs review"
  ).length;

  const rejectedCount = documents.filter(
    (doc) => doc.status === "Rejected" || doc.status === "rejected"
  ).length;

  const getStatusStyle = (status) => {
    const normalizedStatus = status?.toLowerCase();

    if (normalizedStatus === "validated" || normalizedStatus === "valid") {
      return "bg-emerald-100 text-emerald-700 border-emerald-200";
    }

    if (
      normalizedStatus === "needs_review" ||
      normalizedStatus === "needs review"
    ) {
      return "bg-amber-100 text-amber-700 border-amber-200";
    }

    if (normalizedStatus === "rejected") {
      return "bg-red-100 text-red-700 border-red-200";
    }

    return "bg-slate-100 text-slate-700 border-slate-200";
  };

  const formatMoney = (value, currency) => {
    if (value === null || value === undefined || value === "") return "-";

    return `${Number(value).toFixed(2)} ${currency || ""}`.trim();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 overflow-hidden rounded-3xl border border-white/10 bg-white/10 p-6 shadow-2xl backdrop-blur-xl sm:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="mb-3 inline-flex rounded-full border border-cyan-300/30 bg-cyan-300/10 px-4 py-1 text-sm font-medium text-cyan-200">
                Smart Document Processing Platform
              </div>

              <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
                DocuPilot
              </h1>

              <p className="mt-3 max-w-2xl text-base text-slate-300">
                Upload, process, validate and review invoices and purchase
                orders in one clean dashboard.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/10 px-5 py-4 text-white shadow-lg">
              <p className="text-sm text-slate-300">Total documents</p>
              <p className="mt-1 text-3xl font-bold">{totalDocuments}</p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-white/10 bg-white p-5 shadow-xl">
            <p className="text-sm font-medium text-slate-500">
              All documents
            </p>
            <p className="mt-2 text-3xl font-bold text-slate-900">
              {totalDocuments}
            </p>
          </div>

          <div className="rounded-2xl border border-emerald-100 bg-white p-5 shadow-xl">
            <p className="text-sm font-medium text-slate-500">Validated</p>
            <p className="mt-2 text-3xl font-bold text-emerald-600">
              {validatedCount}
            </p>
          </div>

          <div className="rounded-2xl border border-amber-100 bg-white p-5 shadow-xl">
            <p className="text-sm font-medium text-slate-500">Needs review</p>
            <p className="mt-2 text-3xl font-bold text-amber-600">
              {needsReviewCount}
            </p>
          </div>

          <div className="rounded-2xl border border-red-100 bg-white p-5 shadow-xl">
            <p className="text-sm font-medium text-slate-500">Rejected</p>
            <p className="mt-2 text-3xl font-bold text-red-600">
              {rejectedCount}
            </p>
          </div>
        </div>

        {/* Upload */}
        <div className="mb-8">
          <UploadDocument onUploaded={loadDocuments} />
        </div>

        {/* Totals by currency */}
        <div className="mb-8 rounded-3xl border border-white/10 bg-white p-6 shadow-xl">
          <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                Totals by currency
              </h2>
              <p className="text-sm text-slate-500">
                Summary of extracted document totals.
              </p>
            </div>
          </div>

          {totals.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-slate-500">
              No totals available yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {totals
                .filter((t) => t.currency)
                .map((t) => (
                  <div
                    key={t.currency}
                    className="rounded-2xl border border-slate-200 bg-slate-50 p-5"
                  >
                    <p className="text-sm font-medium text-slate-500">
                      Currency
                    </p>
                    <p className="mt-1 text-lg font-bold text-slate-900">
                      {t.currency}
                    </p>
                    <p className="mt-3 text-2xl font-bold text-cyan-700">
                      {Number(t.total_sum).toFixed(2)}
                    </p>
                  </div>
                ))}
            </div>
          )}
        </div>

        {/* Documents */}
        <div className="rounded-3xl border border-white/10 bg-white p-6 shadow-xl">
          <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Documents</h2>
              <p className="text-sm text-slate-500">
                Search and review processed business documents.
              </p>
            </div>

            <div className="relative w-full lg:w-96">
              <input
                type="text"
                placeholder="Search by file, supplier, number, status..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 pl-11 text-sm text-slate-800 outline-none transition focus:border-cyan-500 focus:bg-white focus:ring-4 focus:ring-cyan-100"
              />

              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                🔍
              </span>
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              {[1, 2, 3].map((item) => (
                <div
                  key={item}
                  className="h-64 animate-pulse rounded-3xl bg-slate-100"
                />
              ))}
            </div>
          ) : documents.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-10 text-center">
              <p className="text-lg font-semibold text-slate-700">
                No documents uploaded yet.
              </p>
              <p className="mt-1 text-sm text-slate-500">
                Upload your first invoice or purchase order to start processing.
              </p>
            </div>
          ) : filteredDocuments.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-10 text-center">
              <p className="text-lg font-semibold text-slate-700">
                No matching documents found.
              </p>
              <p className="mt-1 text-sm text-slate-500">
                Try searching by supplier, document number, currency or status.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
              {filteredDocuments.map((doc) => (
                <div
                  key={doc.id}
                  className="group flex h-full flex-col justify-between rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:border-cyan-200 hover:shadow-xl"
                >
                  <div>
                    <div className="mb-4 flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-lg font-bold text-slate-900">
                          {doc.file_name}
                        </p>
                        <p className="mt-1 text-sm text-slate-500">
                          {doc.document_type || "Unknown type"}
                        </p>
                      </div>

                      <span
                        className={`shrink-0 rounded-full border px-3 py-1 text-xs font-semibold ${getStatusStyle(
                          doc.status
                        )}`}
                      >
                        {doc.status || "Unknown"}
                      </span>
                    </div>

                    <div className="space-y-3">
                      <div className="rounded-2xl bg-slate-50 p-4">
                        <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                          Supplier
                        </p>
                        <p className="mt-1 font-semibold text-slate-800">
                          {doc.supplier || "-"}
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="rounded-2xl bg-slate-50 p-4">
                          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                            Number
                          </p>
                          <p className="mt-1 truncate font-semibold text-slate-800">
                            {doc.document_number || "-"}
                          </p>
                        </div>

                        <div className="rounded-2xl bg-slate-50 p-4">
                          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                            Total
                          </p>
                          <p className="mt-1 font-semibold text-slate-800">
                            {formatMoney(doc.total, doc.currency)}
                          </p>
                        </div>
                      </div>

                      <div className="rounded-2xl bg-slate-50 p-4">
                        <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                          Issues
                        </p>

                        {doc.issues?.length > 0 ? (
                          <p className="mt-1 line-clamp-2 text-sm text-red-600">
                            {doc.issues.join(", ")}
                          </p>
                        ) : (
                          <p className="mt-1 text-sm font-medium text-emerald-600">
                            No validation issues detected.
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 flex items-center justify-between gap-3 border-t border-slate-100 pt-4">
                    <p className="text-xs text-slate-400">
                      ID: {String(doc.id).slice(0, 8)}
                    </p>

                    <Link
                      to={`/documents/${doc.id}`}
                      className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-cyan-700"
                    >
                      Review
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;