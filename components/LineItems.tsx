'use client';

import React from 'react';
import { LineItem } from '@/types/invoice';

interface LineItemsProps {
  lineItems: LineItem[];
  onUpdate: (items: LineItem[]) => void;
  currency: string;
  currencySymbol: string;
}

export default function LineItems({ lineItems, onUpdate, currency, currencySymbol }: LineItemsProps) {
  const updateItem = (id: string, field: keyof LineItem, value: string | number) => {
    const updated = lineItems.map((item) => {
      if (item.id === id) {
        const updatedItem = { ...item, [field]: value };
        // Recalculate amount when quantity or rate changes
        if (field === 'quantity' || field === 'rate') {
          updatedItem.amount = updatedItem.quantity * updatedItem.rate;
        }
        return updatedItem;
      }
      return item;
    });
    onUpdate(updated);
  };

  const addItem = () => {
    const newItem: LineItem = {
      id: Date.now().toString(),
      description: '',
      quantity: 1,
      rate: 0,
      amount: 0,
    };
    onUpdate([...lineItems, newItem]);
  };

  const removeItem = (id: string) => {
    onUpdate(lineItems.filter((item) => item.id !== id));
  };

  const formatCurrency = (amount: number): string => {
    if (isNaN(amount)) return '0.00';
    if (currency === 'JPY') {
      return Math.round(amount).toString();
    }
    return Math.abs(amount).toFixed(2);
  };

  return (
    <div>
      {/* Desktop Table View */}
      <div className="hidden md:block overflow-x-auto rounded-xl border border-gray-200/50 ">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-50/80 border-b border-gray-200">
              <th className="text-left p-4 text-[11px] font-bold text-gray-500 uppercase tracking-widest">Description</th>
              <th className="text-right p-4 text-[11px] font-bold text-gray-500 uppercase tracking-widest w-24">Quantity</th>
              <th className="text-right p-4 text-[11px] font-bold text-gray-500 uppercase tracking-widest w-32">Rate</th>
              <th className="text-right p-4 text-[11px] font-bold text-gray-500 uppercase tracking-widest w-32">Amount</th>
              <th className="w-16 p-4"></th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {lineItems.map((item) => (
              <tr
                key={item.id}
                className="group hover:bg-gray-50/50 transition-colors"
              >
                <td className="p-3">
                  <input
                    type="text"
                    value={item.description}
                    onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                    placeholder="Item description"
                    className="w-full px-4 py-2.5 bg-gray-50 border border-transparent hover:border-gray-200 rounded-xl text-[15px] text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-theme-primary/20 focus:border-theme-primary transition-all"
                  />
                </td>
                <td className="p-3">
                  <input
                    type="number"
                    value={item.quantity || ''}
                    onChange={(e) =>
                      updateItem(item.id, 'quantity', parseFloat(e.target.value) || 0)
                    }
                    min="0"
                    step="0.01"
                    className="w-full px-4 py-2.5 bg-gray-50 border border-transparent hover:border-gray-200 rounded-xl text-[15px] text-right text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-theme-primary/20 focus:border-theme-primary transition-all"
                  />
                </td>
                <td className="p-3">
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs pointer-events-none">{currencySymbol}</span>
                    <input
                      type="number"
                      value={item.rate || ''}
                      onChange={(e) =>
                        updateItem(item.id, 'rate', parseFloat(e.target.value) || 0)
                      }
                      min="0"
                      step="0.01"
                      className="w-full pl-6 pr-4 py-2.5 bg-gray-50 border border-transparent hover:border-gray-200 rounded-xl text-[15px] text-right text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-theme-primary/20 focus:border-theme-primary transition-all"
                    />
                  </div>
                </td>
                <td className="p-3 text-right">
                  <span className="text-sm font-semibold text-gray-900 block py-2 px-3">
                    {currencySymbol} {formatCurrency(item.amount)}
                  </span>
                </td>
                <td className="p-3 text-center">
                  <button
                    onClick={() => removeItem(item.id)}
                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                    title="Remove item"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {lineItems.length === 0 && (
          <div className="p-8 text-center text-gray-400 bg-gray-50/50">
            <p className="text-sm">No items added yet. Click "Add Line Item" below.</p>
          </div>
        )}
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-4">
        {lineItems.map((item) => (
          <div
            key={item.id}
            className="bg-white border border-gray-200 rounded-xl p-5 "
          >
            {/* Description Row */}
            <div className="mb-4">
              <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">Description</label>
              <input
                type="text"
                value={item.description}
                onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                placeholder="Description of item/service..."
                className="w-full px-4 py-3.5 bg-gray-50 border border-transparent focus:bg-white focus:border-theme-primary rounded-xl text-[15px] outline-none ring-0 focus:ring-2 focus:ring-theme-primary/20 transition-all"
              />
            </div>

            {/* Quantity, Rate, Amount Row */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">Rate</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-[15px]">{currencySymbol}</span>
                  <input
                    type="number"
                    value={item.rate || ''}
                    onChange={(e) => updateItem(item.id, 'rate', parseFloat(e.target.value) || 0)}
                    className="w-full pl-8 pr-4 py-3.5 bg-gray-50 border border-transparent focus:bg-white focus:border-theme-primary rounded-xl text-[15px] outline-none ring-0 focus:ring-2 focus:ring-theme-primary/20 transition-all"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">Qty</label>
                <input
                  type="number"
                  value={item.quantity || ''}
                  onChange={(e) => updateItem(item.id, 'quantity', parseFloat(e.target.value) || 0)}
                  className="w-full px-4 py-3.5 bg-gray-50 border border-transparent focus:bg-white focus:border-theme-primary rounded-xl text-[15px] outline-none ring-0 focus:ring-2 focus:ring-theme-primary/20 transition-all"
                />
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between pt-4 border-t border-gray-100">
              <div>
                <span className="text-xs text-gray-500 uppercase font-bold">Amount</span>
                <div className="text-lg font-bold text-gray-900 mt-1">
                  {currencySymbol} {formatCurrency(item.amount)}
                </div>
              </div>
              <button
                onClick={() => removeItem(item.id)}
                className="p-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                title="Remove item"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
              </button>
            </div>
          </div>
        ))}
        {lineItems.length === 0 && (
          <div className="p-8 text-center text-gray-400 bg-gray-50 rounded-xl border border-dashed border-gray-200">
            <p className="text-sm">No items added yet.</p>
          </div>
        )}
      </div>
      <div className="mt-4">
        <button
          onClick={addItem}
          className="w-full md:w-auto px-6 py-2.5 bg-gray-900 text-white rounded-xl hover:bg-black transition-all flex items-center justify-center gap-2 text-sm font-semibold"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          Add Line Item
        </button>
      </div>
    </div>
  );
}

