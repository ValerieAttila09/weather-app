'use client';

import { Suspense } from 'react';
import ResetForm from './form';

export default function ResetPage() {
  return (
    <Suspense fallback={<ResetFormSkeleton />}>
      <ResetForm />
    </Suspense>
  );
}

function ResetFormSkeleton() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-lg animate-pulse">
        <div className="h-8 bg-slate-200 rounded mb-4"></div>
        <div className="h-4 bg-slate-200 rounded mb-8"></div>
        <div className="space-y-4">
          <div className="h-10 bg-slate-200 rounded"></div>
          <div className="h-10 bg-slate-200 rounded"></div>
          <div className="h-10 bg-slate-200 rounded"></div>
        </div>
      </div>
    </div>
  );
}
