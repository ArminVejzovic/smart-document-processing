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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center text-gray-600">
        Loading...
      </div>
    );
  }

  if (!document) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center text-gray-600">
        Document not found.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 px-4 py-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <button
          onClick={() => navigate("/")}
          className="px-4 py-2 rounded-xl bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 shadow-sm transition"
        >
          ← Back to dashboard
        </button>

        <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            Review Document
          </h1>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <label className="flex flex-col gap-2 text-sm font-medium text-gray-700">
              Document type
              <select
                name="document_type"
                value={document.document_type || ""}
                onChange={handleChange}
                className="rounded-xl border border-gray-300 px-4 py-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                className="flex flex-col gap-2 text-sm font-medium text-gray-700"
              >
                {label}
                <input
                  name={name}
                  type={
                    ["subtotal", "tax", "total"].includes(name)
                      ? "number"
                      : "text"
                  }
                  step="0.01"
                  value={document[name] || ""}
                  onChange={handleChange}
                  className="rounded-xl border border-gray-300 px-4 py-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </label>
            ))}
          </div>

          <div className="mt-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-3">
              Validation issues
            </h2>

            {document.issues?.length > 0 ? (
              <ul className="rounded-xl bg-red-50 border border-red-200 p-4 text-sm text-red-700 space-y-1">
                {document.issues.map((issue, index) => (
                  <li key={index}>• {issue}</li>
                ))}
              </ul>
            ) : (
              <p className="rounded-xl bg-green-50 border border-green-200 p-4 text-sm text-green-700">
                No issues.
              </p>
            )}
          </div>

          <div className="mt-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-3">
              Line items
            </h2>

            {lineItems.length === 0 ? (
              <p className="text-gray-600">No line items detected.</p>
            ) : (
              <div className="overflow-x-auto rounded-xl border border-gray-200">
                <table className="w-full text-sm">
                  <thead className="bg-gray-100 text-gray-700">
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
                        className="border-t border-gray-100 hover:bg-gray-50"
                      >
                        <td className="px-4 py-3 text-gray-800">
                          {item.description}
                        </td>
                        <td className="px-4 py-3 text-gray-700">
                          {item.quantity}
                        </td>
                        <td className="px-4 py-3 text-gray-700">
                          {item.unit_price}
                        </td>
                        <td className="px-4 py-3 text-gray-700">
                          {item.total}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="mt-8 flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => saveWithStatus("Validated")}
              className="px-5 py-3 rounded-xl bg-green-600 text-white font-medium hover:bg-green-700 transition"
            >
              Confirm and validate
            </button>

            <button
              onClick={() => saveWithStatus("Rejected")}
              className="px-5 py-3 rounded-xl bg-red-600 text-white font-medium hover:bg-red-700 transition"
            >
              Reject
            </button>

            <button
              onClick={() => saveWithStatus("Needs Review")}
              className="px-5 py-3 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-700 transition"
            >
              Save changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ReviewDocument;