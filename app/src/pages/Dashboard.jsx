import { useEffect, useState } from "react";
import { getDocuments } from "../api/documentApi";
import UploadDocument from "../pages/UploadDocument";
import { Link } from "react-router-dom";
import { getTotalsByCurrency } from "../api/documentApi";

function Dashboard() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totals, setTotals] = useState([]);

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

  return (
    <div className="min-h-screen bg-gray-100 px-4 py-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Smart Document Processing
          </h1>
          <p className="text-gray-600 mt-1">
            Upload, process and review business documents.
          </p>
        </div>

        <UploadDocument onUploaded={loadDocuments} />

        <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Documents
          </h2>

          <div className="card">
            <h2>Totals by Currency</h2>

            {totals.length === 0 ? (
              <p>No totals available.</p>
            ) : (
              <ul>
                {totals
                  .filter((t) => t.currency)
                  .map((t) => (
                    <li key={t.currency}>
                      <strong>{t.currency}:</strong> {Number(t.total_sum).toFixed(2)}
                    </li>
                  ))}
              </ul>
            )}
          </div>

          {loading ? (
            <p className="text-gray-600">Loading documents...</p>
          ) : documents.length === 0 ? (
            <p className="text-gray-600">No documents uploaded yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="bg-gray-100 text-left text-gray-700">
                    <th className="px-4 py-3 font-semibold">File</th>
                    <th className="px-4 py-3 font-semibold">Type</th>
                    <th className="px-4 py-3 font-semibold">Supplier</th>
                    <th className="px-4 py-3 font-semibold">Number</th>
                    <th className="px-4 py-3 font-semibold">Total</th>
                    <th className="px-4 py-3 font-semibold">Currency</th>
                    <th className="px-4 py-3 font-semibold">Status</th>
                    <th className="px-4 py-3 font-semibold">Issues</th>
                    <th className="px-4 py-3 font-semibold">Action</th>
                  </tr>
                </thead>

                <tbody>
                  {documents.map((doc) => (
                    <tr
                      key={doc.id}
                      className="border-b border-gray-100 hover:bg-gray-50"
                    >
                      <td className="px-4 py-3 text-gray-800">
                        {doc.file_name}
                      </td>
                      <td className="px-4 py-3 text-gray-700">
                        {doc.document_type || "-"}
                      </td>
                      <td className="px-4 py-3 text-gray-700">
                        {doc.supplier || "-"}
                      </td>
                      <td className="px-4 py-3 text-gray-700">
                        {doc.document_number || "-"}
                      </td>
                      <td className="px-4 py-3 text-gray-700">
                        {doc.total ?? "-"}
                      </td>
                      <td className="px-4 py-3 text-gray-700">
                        {doc.currency || "-"}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                            doc.status === "valid"
                              ? "bg-green-100 text-green-700"
                              : doc.status === "needs_review"
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {doc.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-700 max-w-xs">
                        {doc.issues?.length > 0
                          ? doc.issues.join(", ")
                          : "None"}
                      </td>
                      <td>
                        <Link to={`/documents/${doc.id}`}>Review</Link>
                      </td>
                    </tr>
                  ))}

                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;