import React from 'react';
import { businessConfig } from '../data/business';

export function StoreHeader() {
  return (
    <header className="bg-slate-900 text-white py-4 shadow-md">
      <div className="container mx-auto px-4 flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold">{businessConfig.name}</h1>
          <p className="text-xs text-slate-400">{businessConfig.domain}</p>
        </div>
        <div className="text-right text-sm">
          <p>Hotline: <a href={`tel:${businessConfig.hotline}`} className="text-blue-400 hover:underline">{businessConfig.hotline}</a></p>
          <p>Email: <a href={`mailto:${businessConfig.email}`} className="text-blue-400 hover:underline">{businessConfig.email}</a></p>
        </div>
      </div>
    </header>
  );
}
