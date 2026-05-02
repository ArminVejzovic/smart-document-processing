import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getDocumentById, updateDocument } from "../api/documentApi";

function ReviewDocument() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [document, setDocument] = useState(null);
  const [lineItems, setLineItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadDocument = async () => {
    try {
      setLoading(true);
      const data = await getDocumentById(id);
      setDocument(data.document);
      setLineItems(data.lineItems || []);
    } catch (error) {
      console.error(error);
      alert("Failed to load document.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDocument();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setDocument((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const saveWithStatus = async (status) => {
    try {
      const payload = {
        ...document,
        status,
        issues: status === "Validated" ? [] : document.issues || [],
      };

      await updateDocument(id, payload);
      navigate("/");
    } catch (error) {
      console.error(error);
      alert("Failed to save document.");
    }
  };

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

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 text-slate-200">
        Loading document...
      </div>
    );
  }

  if (!document) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 text-slate-200">
        Document not found.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <button
          onClick={() => navigate("/")}
          className="mb-6 rounded-2xl border border-white/10 bg-white/10 px-4 py-2 text-sm font-semibold text-white shadow-lg backdrop-blur-xl transition hover:bg-white/20"
        >
          ← Back to dashboard
        </button>

        <div className="mb-8 rounded-3xl border border-white/10 bg-white/10 p-6 shadow-2xl backdrop-blur-xl sm:p-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="mb-3 inline-flex rounded-full border border-cyan-300/30 bg-cyan-300/10 px-4 py-1 text-sm font-medium text-cyan-200">
                Document review
              </div>

              <h1 className="text-4xl font-bold tracking-tight text-white">
                Review extracted data
              </h1>

              <p className="mt-3 max-w-2xl text-sm text-slate-300">
                Check extracted fields, correct mistakes and update validation
                status.
              </p>
            </div>

            <span
              className={`w-fit rounded-full border px-4 py-2 text-sm font-semibold ${getStatusStyle(
                document.status
              )}`}
            >
              {document.status || "Unknown"}
            </span>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
          <div className="rounded-3xl bg-white p-6 shadow-xl">
            <h2 className="mb-5 text-2xl font-bold text-slate-900">
              Document fields
            </h2>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <label className="flex flex-col gap-2 text-sm font-semibold text-slate-700">
                Document type
                <select
                  name="document_type"
                  value={document.document_type || ""}
                  onChange={handleChange}
                  className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-800 outline-none transition focus:border-cyan-500 focus:bg-white focus:ring-4 focus:ring-cyan-100"
                >
                  <option value="invoice">Invoice</option>
                  <option value="purchase_order">Purchase Order</option>
                </select>
              </label>

              {[
                ["supplier", "Supplier"],
                ["document_number", "Document number"],
                ["issue_date", "Issue date"],
                ["due_date", "Due date"],
                ["currency", "Currency"],
                ["subtotal", "Subtotal"],
                ["tax", "Tax"],
                ["total", "Total"],
              ].map(([name, label]) => (
                <label
                  key={name}
                  className="flex flex-col gap-2 text-sm font-semibold text-slate-700"
                >
                  {label}
                  <input
                  name={name}
                  type={
                    ["subtotal", "tax", "total"].includes(name)
                      ? "number"
                      : ["issue_date", "due_date"].includes(name)
                      ? "date"
                      : "text"
                  }
                  step="0.01"
                  placeholder={
                    ["issue_date", "due_date"].includes(name)
                      ? "YYYY-MM-DD"
                      : ""
                  }
                  value={document[name] || ""}
                  onChange={handleChange}
                  className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-800 outline-none transition focus:border-cyan-500 focus:bg-white focus:ring-4 focus:ring-cyan-100"
                />
                </label>
              ))}
            </div>

            <div className="mt-8">
              <h2 className="mb-3 text-xl font-bold text-slate-900">
                Line items
              </h2>

              {lineItems.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-slate-500">
                  No line items detected.
                </div>
              ) : (
                <div className="overflow-x-auto rounded-3xl border border-slate-200">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-100 text-slate-700">
                      <tr>
                        <th className="px-4 py-3 text-left font-semibold">
                          Description
                        </th>
                        <th className="px-4 py-3 text-left font-semibold">
                          Qty
                        </th>
                        <th className="px-4 py-3 text-left font-semibold">
                          Unit price
                        </th>
                        <th className="px-4 py-3 text-left font-semibold">
                          Total
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {lineItems.map((item) => (
                        <tr
                          key={item.id}
                          className="border-t border-slate-100 hover:bg-slate-50"
                        >
                          <td className="px-4 py-3 text-slate-800">
                            {item.description}
                          </td>
                          <td className="px-4 py-3 text-slate-700">
                            {item.quantity}
                          </td>
                          <td className="px-4 py-3 text-slate-700">
                            {item.unit_price}
                          </td>
                          <td className="px-4 py-3 font-semibold text-slate-900">
                            {item.total}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          <aside className="space-y-6">
            <div className="rounded-3xl bg-white p-6 shadow-xl">
              <h2 className="text-xl font-bold text-slate-900">
                Validation issues
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Review warnings before confirming the document.
              </p>

              {document.issues?.length > 0 ? (
                <ul className="mt-5 space-y-2 rounded-2xl border border-red-100 bg-red-50 p-4 text-sm text-red-700">
                  {document.issues.map((issue, index) => (
                    <li key={index}>• {issue}</li>
                  ))}
                </ul>
              ) : (
                <p className="mt-5 rounded-2xl border border-emerald-100 bg-emerald-50 p-4 text-sm font-medium text-emerald-700">
                  No validation issues detected.
                </p>
              )}
            </div>

            <div className="rounded-3xl bg-white p-6 shadow-xl">
              <h2 className="text-xl font-bold text-slate-900">Actions</h2>

              <p className="mt-1 text-sm text-slate-500">
                Save your corrections and update document status.
              </p>

              <div className="mt-5 flex flex-col gap-3">
                <button
                  onClick={() => saveWithStatus("Validated")}
                  className="rounded-2xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-emerald-700"
                >
                  Confirm and validate
                </button>

                <button
                  onClick={() => saveWithStatus("Needs Review")}
                  className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-cyan-700"
                >
                  Save changes
                </button>

                <button
                  onClick={() => saveWithStatus("Rejected")}
                  className="rounded-2xl bg-red-600 px-5 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-red-700"
                >
                  Reject document
                </button>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

export default ReviewDocument;