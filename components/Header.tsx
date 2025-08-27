/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React from 'react';
import { DollarSignIcon } from './icons';

const Header: React.FC = () => {
  return (
    <header className="w-full py-4 px-8 border-b border-gray-700 bg-gray-800/30 backdrop-blur-sm sticky top-0 z-50">
      <div className="flex items-center justify-center gap-3">
          <DollarSignIcon className="w-6 h-6 text-green-400" />
          <h1 className="text-xl font-bold tracking-tight text-gray-100">
            Daily Sales Tracker
          </h1>
      </div>
    </header>
  );
};

export default Header;