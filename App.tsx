/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState, useEffect, useMemo } from 'react';
import Header from './components/Header';
import { TrashIcon } from './components/icons';

interface Transaction {
  id: string;
  name: string;
  quantity: number;
  price: number;
  timestamp: number;
}

const App: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    try {
      const saved = localStorage.getItem('dailySales');
      return saved ? JSON.parse(saved) : [];
    } catch (error) {
      console.error("Failed to parse transactions from localStorage", error);
      return [];
    }
  });

  const [productName, setProductName] = useState('');
  const [quantity, setQuantity] = useState<number | ''>(1);
  const [price, setPrice] = useState<number | ''>('');

  useEffect(() => {
    try {
      localStorage.setItem('dailySales', JSON.stringify(transactions));
    } catch (error) {
      console.error("Failed to save transactions to localStorage", error);
    }
  }, [transactions]);

  const {
    totalSalesToday,
    totalItemsToday,
    totalSalesThisWeek,
    showWarning,
    transactionsToday,
  } = useMemo(() => {
    const WEEKLY_TARGET = 9000000;
    const now = new Date();
    
    // Get start of today for daily filtering
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    // Get start of the custom week (Saturday)
    const todayDay = now.getDay(); // Sun=0, Mon=1, ..., Sat=6
    const offset = (todayDay < 6) ? todayDay + 1 : todayDay - 6;
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - offset);
    startOfWeek.setHours(0, 0, 0, 0);

    const weeklyTransactions = transactions.filter(t => t.timestamp >= startOfWeek.getTime());
    const dailyTransactions = weeklyTransactions.filter(t => t.timestamp >= startOfToday.getTime());

    const weekTotals = weeklyTransactions.reduce(
      (acc, t) => {
        acc.sales += t.quantity * t.price;
        return acc;
      },
      { sales: 0 }
    );

    const dayTotals = dailyTransactions.reduce(
      (acc, t) => {
        acc.sales += t.quantity * t.price;
        acc.items += Number(t.quantity);
        return acc;
      },
      { sales: 0, items: 0 }
    );

    const isThursday = todayDay === 4;
    const shouldShowWarning = isThursday && weekTotals.sales < WEEKLY_TARGET;

    return {
      totalSalesToday: dayTotals.sales,
      totalItemsToday: dayTotals.items,
      totalSalesThisWeek: weekTotals.sales,
      showWarning: shouldShowWarning,
      transactionsToday: dailyTransactions,
    };
  }, [transactions]);


  const handleAddTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    if (productName.trim() && Number(quantity) > 0 && Number(price) > 0) {
      const newTransaction: Transaction = {
        id: crypto.randomUUID(),
        name: productName.trim(),
        quantity: Number(quantity),
        price: Number(price),
        timestamp: Date.now(),
      };
      setTransactions([newTransaction, ...transactions]);
      setProductName('');
      setQuantity(1);
      setPrice('');
    }
  };
  
  const handleDeleteTransaction = (id: string) => {
    setTransactions(transactions.filter(t => t.id !== id));
  };
  
  const handleClearAll = () => {
    if (window.confirm("Anda yakin ingin menghapus semua transaksi hari ini? Tindakan ini tidak dapat dibatalkan.")) {
       const startOfToday = new Date();
       startOfToday.setHours(0, 0, 0, 0);
       const startOfTodayTimestamp = startOfToday.getTime();

       setTransactions(transactions.filter(t => t.timestamp < startOfTodayTimestamp));
    }
  };
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(amount);
  };

  return (
    <div className="min-h-screen text-gray-100 flex flex-col">
      <Header />
      <main className="flex-grow w-full max-w-5xl mx-auto p-4 md:p-8">
        <div className="flex flex-col gap-8">
        
          {/* Summary */}
          <section className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-fade-in">
            <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6 backdrop-blur-sm">
              <h2 className="text-md font-medium text-gray-400">Total Penjualan Hari Ini</h2>
              <p className="text-4xl font-extrabold text-green-400 tracking-tight">{formatCurrency(totalSalesToday)}</p>
            </div>
            <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6 backdrop-blur-sm">
              <h2 className="text-md font-medium text-gray-400">Total Barang Terjual</h2>
              <p className="text-4xl font-extrabold text-blue-400 tracking-tight">{totalItemsToday}</p>
            </div>
             <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6 backdrop-blur-sm">
              <h2 className="text-md font-medium text-gray-400">Penjualan Minggu Ini</h2>
              <p className="text-4xl font-extrabold text-purple-400 tracking-tight">{formatCurrency(totalSalesThisWeek)}</p>
              {showWarning && (
                <p className="text-red-400 text-sm mt-2 animate-pulse">
                  Peringatan: Penjualan belum mencapai target mingguan!
                </p>
              )}
            </div>
          </section>

          {/* Add Transaction Form */}
          <section className="bg-gray-800/50 border border-gray-700 rounded-lg p-6 backdrop-blur-sm animate-fade-in" style={{ animationDelay: '100ms' }}>
             <h2 className="text-xl font-bold mb-4">Tambah Penjualan Baru</h2>
            <form onSubmit={handleAddTransaction} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
              <div className="md:col-span-2">
                <label htmlFor="productName" className="block text-sm font-medium text-gray-300 mb-1">Nama Produk</label>
                <input
                  id="productName"
                  type="text"
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  placeholder="Contoh: Kopi Susu"
                  required
                  className="w-full bg-gray-900/50 border border-gray-600 rounded-md px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
                />
              </div>
              <div>
                <label htmlFor="quantity" className="block text-sm font-medium text-gray-300 mb-1">Jumlah</label>
                <input
                  id="quantity"
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value === '' ? '' : Math.max(1, parseInt(e.target.value, 10)))}
                  min="1"
                  required
                  className="w-full bg-gray-900/50 border border-gray-600 rounded-md px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
                />
              </div>
              <div>
                <label htmlFor="price" className="block text-sm font-medium text-gray-300 mb-1">Harga Satuan (Rp)</label>
                <input
                  id="price"
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value === '' ? '' : Math.max(0, parseInt(e.target.value, 10)))}
                  placeholder="Contoh: 18000"
                  min="0"
                  required
                  className="w-full bg-gray-900/50 border border-gray-600 rounded-md px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-md transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-green-500"
              >
                Tambah
              </button>
            </form>
          </section>

          {/* Transaction List */}
          <section className="bg-gray-800/50 border border-gray-700 rounded-lg p-6 backdrop-blur-sm animate-fade-in" style={{ animationDelay: '200ms' }}>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Transaksi Hari Ini</h2>
              {transactionsToday.length > 0 && (
                <button
                  onClick={handleClearAll}
                  className="bg-red-600/50 hover:bg-red-500 text-red-100 text-sm font-medium py-1 px-3 rounded-md transition-colors duration-300 flex items-center gap-2"
                  aria-label="Hapus semua transaksi hari ini"
                >
                  <TrashIcon className="w-4 h-4" />
                  <span>Bersihkan</span>
                </button>
              )}
            </div>
            <div className="flow-root">
                {transactionsToday.length === 0 ? (
                    <p className="text-gray-400 text-center py-8">Belum ada penjualan hari ini.</p>
                ) : (
                    <ul role="list" className="divide-y divide-gray-700">
                        {transactionsToday.map((transaction) => (
                        <li key={transaction.id} className="py-3 sm:py-4 flex items-center justify-between gap-4 animate-fade-in">
                            <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-100 truncate">{transaction.name}</p>
                            <p className="text-sm text-gray-400 truncate">
                                {transaction.quantity} x {formatCurrency(transaction.price)}
                            </p>
                            </div>
                            <div className="inline-flex items-center text-base font-semibold text-green-400">
                            {formatCurrency(transaction.quantity * transaction.price)}
                            </div>
                             <button
                                onClick={() => handleDeleteTransaction(transaction.id)}
                                className="p-2 text-gray-400 hover:text-red-400 hover:bg-gray-700 rounded-full transition-colors"
                                aria-label={`Hapus transaksi ${transaction.name}`}
                            >
                                <TrashIcon className="w-5 h-5" />
                            </button>
                        </li>
                        ))}
                    </ul>
                )}
            </div>
          </section>

        </div>
      </main>
    </div>
  );
};

export default App;
