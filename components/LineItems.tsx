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
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b-2 border-gray-200">
              <th className="text-left p-3 text-sm font-semibold text-gray-700">Description</th>
              <th className="text-right p-3 text-sm font-semibold text-gray-700 w-24">Quantity</th>
              <th className="text-right p-3 text-sm font-semibold text-gray-700 w-32">Rate</th>
              <th className="text-right p-3 text-sm font-semibold text-gray-700 w-32">Amount</th>
              <th className="w-16"></th>
            </tr>
          </thead>
          <tbody>
            {lineItems.map((item, index) => (
              <tr
                key={item.id}
                className={`border-b border-gray-200 hover:bg-gray-50 ${
                  index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                }`}
              >
                <td className="p-3">
                  <input
                    type="text"
                    value={item.description}
                    onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                    placeholder="Item description"
                    className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-theme-primary focus:border-transparent"
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
                    className="w-full px-2 py-1 border border-gray-300 rounded text-right focus:outline-none focus:ring-2 focus:ring-theme-primary focus:border-transparent"
                  />
                </td>
                <td className="p-3">
                  <div className="flex items-center justify-end">
                    <span className="mr-1 text-gray-600">{currencySymbol}</span>
                    <input
                      type="number"
                      value={item.rate || ''}
                      onChange={(e) =>
                        updateItem(item.id, 'rate', parseFloat(e.target.value) || 0)
                      }
                      min="0"
                      step="0.01"
                      className="w-full px-2 py-1 border border-gray-300 rounded text-right focus:outline-none focus:ring-2 focus:ring-theme-primary focus:border-transparent"
                    />
                  </div>
                </td>
                <td className="p-3">
                  <div className="flex items-center justify-end">
                    <span className="mr-1 text-gray-600">{currencySymbol}</span>
                    <span className="text-gray-900 font-medium">
                      {formatCurrency(item.amount)}
                    </span>
                  </div>
                </td>
                <td className="p-3 text-center">
                  <button
                    onClick={() => removeItem(item.id)}
                    className="text-red-600 hover:text-red-800 font-bold text-lg leading-none px-2 py-1 rounded hover:bg-red-50 transition-colors"
                    title="Remove item"
                  >
                    ×
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-3">
        {lineItems.map((item, index) => (
          <div
            key={item.id}
            className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm"
          >
            {/* Description Row */}
            <div className="mb-3">
              <input
                type="text"
                value={item.description}
                onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                placeholder="Description of item/service..."
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-theme-primary focus:border-transparent"
              />
            </div>
            
            {/* Quantity, Rate, Amount Row */}
            <div className="flex items-center gap-2">
              {/* Rate */}
              <div className="flex-1">
                <div className="flex items-center border border-gray-300 rounded">
                  <span className="px-2 text-gray-600">{currencySymbol}</span>
                  <input
                    type="number"
                    value={item.rate || ''}
                    onChange={(e) =>
                      updateItem(item.id, 'rate', parseFloat(e.target.value) || 0)
                    }
                    min="0"
                    step="0.01"
                    placeholder="0"
                    className="flex-1 px-2 py-2 border-0 rounded-r focus:outline-none focus:ring-2 focus:ring-theme-primary"
                  />
                </div>
              </div>
              
              {/* Multiplier */}
              <span className="text-gray-400 text-xl">×</span>
              
              {/* Quantity */}
              <div className="w-20">
                <input
                  type="number"
                  value={item.quantity || ''}
                  onChange={(e) =>
                    updateItem(item.id, 'quantity', parseFloat(e.target.value) || 0)
                  }
                  min="0"
                  step="0.01"
                  className="w-full px-2 py-2 border border-gray-300 rounded text-center focus:outline-none focus:ring-2 focus:ring-theme-primary focus:border-transparent"
                />
              </div>
              
              {/* Amount Display */}
              <div className="flex-1 text-right">
                <div className="px-3 py-2 bg-gray-50 border border-gray-300 rounded">
                  <span className="text-gray-600 mr-1">{currencySymbol}</span>
                  <span className="text-gray-900 font-medium">
                    {formatCurrency(item.amount)}
                  </span>
                </div>
              </div>
              
              {/* Remove Button */}
              <button
                onClick={() => removeItem(item.id)}
                className="text-red-600 hover:text-red-800 font-bold text-xl leading-none px-3 py-2 rounded hover:bg-red-50 transition-colors"
                title="Remove item"
              >
                ×
              </button>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4">
        <button
          onClick={addItem}
          className="px-4 py-2 bg-theme-primary text-white rounded hover:bg-theme-primary-dark transition-colors text-sm font-medium"
        >
          + Add Line Item
        </button>
      </div>
      {lineItems.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <p>No line items yet. Click "Add Line Item" to get started.</p>
        </div>
      )}
    </div>
  );
}

