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

  return (
    <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">
        Upload document
      </h2>

      <form onSubmit={handleUpload} className="flex flex-col gap-4">
        <input
          type="file"
          accept=".pdf,.txt,.csv,.png,.jpg,.jpeg"
          onChange={(e) => setFile(e.target.files[0])}
          className="block w-full text-sm text-gray-700 border border-gray-300 rounded-xl cursor-pointer bg-gray-50 file:mr-4 file:py-3 file:px-4 file:rounded-l-xl file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full sm:w-fit px-6 py-3 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
        >
          {loading ? "Processing..." : "Upload and process"}
        </button>
      </form>

      {result && (
        <div className="mt-5 rounded-xl border border-gray-200 bg-gray-50 p-4">
          <p className="text-gray-800">
            <strong>Status:</strong>{" "}
            <span className="font-semibold">{result.document.status}</span>
          </p>

          {result.issues?.length > 0 ? (
            <ul className="mt-3 list-disc list-inside text-sm text-red-600 space-y-1">
              {result.issues.map((issue, index) => (
                <li key={index}>{issue}</li>
              ))}
            </ul>
          ) : (
            <p className="mt-2 text-sm text-green-600">
              No validation issues detected.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

export default UploadDocument;