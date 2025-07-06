"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase/client";

export default function SupabaseApiTester() {
  const [selectResult, setSelectResult] = useState<any>(null);
  const [insertResult, setInsertResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSelect = async () => {
    setLoading(true);
    setError(null);
    const { data, error } = await supabase.from("attendees").select("*").limit(5);
    setSelectResult(data);
    if (error) setError(error.message);
    setLoading(false);
  };

  const handleInsert = async () => {
    setLoading(true);
    setError(null);
    const { data, error } = await supabase.from("attendees").insert({
      first_name: "TestUser",
      is_anonymous: true,
    }).select();
    setInsertResult(data);
    if (error) setError(error.message);
    setLoading(false);
  };

  return (
    <div className="max-w-lg mx-auto p-4 space-y-4">
      <h1 className="text-xl font-bold">Supabase API Tester</h1>
      <button onClick={handleSelect} className="px-4 py-2 bg-blue-500 text-white rounded">Test SELECT</button>
      <button onClick={handleInsert} className="px-4 py-2 bg-green-500 text-white rounded ml-2">Test INSERT</button>
      {loading && <div>Loading...</div>}
      {error && <div className="text-red-500">Error: {error}</div>}
      {selectResult && (
        <div>
          <h2 className="font-semibold mt-4">SELECT Result:</h2>
          <pre className="bg-gray-100 p-2 rounded text-xs overflow-x-auto">{JSON.stringify(selectResult, null, 2)}</pre>
        </div>
      )}
      {insertResult && (
        <div>
          <h2 className="font-semibold mt-4">INSERT Result:</h2>
          <pre className="bg-gray-100 p-2 rounded text-xs overflow-x-auto">{JSON.stringify(insertResult, null, 2)}</pre>
        </div>
      )}
    </div>
  );
} 