'use client';

import React, { useState } from 'react';
import { TestEnvironment } from '../../components/TestEnvironment';
import { SurveyResponse } from '../../types/survey';
import { Visualization } from '../../components/Visualization';

export default function TestPage() {
  const [data, setData] = useState<SurveyResponse[]>([]);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <header className="bg-black text-white py-4 px-8 mb-6">
        <h1 className="text-2xl font-bold">Medtronic WE Summit Visualization Test Environment</h1>
      </header>
      <main className="max-w-6xl mx-auto space-y-8">
        <section>
          <TestEnvironment onDataUpdate={setData}>
            <Visualization data={data} />
          </TestEnvironment>
        </section>
        <section className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-2">Data Statistics</h2>
          <div className="grid grid-cols-2 gap-4 text-base">
            <div>
              <div>Total Entries: {data.length}</div>
              <div>Anonymous Entries: {data.filter(d => d.is_anonymous).length}</div>
            </div>
            <div>
              <div>Unique Locations: {[...new Set(data.map(d => d.location))].length}</div>
              <div>Date Range: {data.length ? `${new Date(data[0].timestamp).toLocaleDateString()} - ${new Date(data[data.length-1].timestamp).toLocaleDateString()}` : 'No data'}</div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
} 