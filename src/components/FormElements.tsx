/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

export const SectionTitle = ({ title, icon: Icon }: { title: string; icon: any }) => (
  <div className="flex items-center gap-2 mb-6 border-b pb-2 border-slate-200">
    <Icon className="w-5 h-5 text-blue-600" />
    <h2 className="text-lg font-bold text-slate-800 uppercase tracking-wide">{title}</h2>
  </div>
);

export const InputGroup = ({ label, name, value, onChange, placeholder, type = "text", className = "", multiline = false }: any) => (
  <div className={`flex flex-col gap-1.5 ${className}`}>
    <label className="text-sm font-medium text-slate-600">{label}</label>
    {multiline ? (
      <textarea
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        rows={2}
        className="px-3 py-2 bg-white border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none text-slate-800 placeholder:text-slate-400"
      />
    ) : (
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="px-3 py-2 bg-white border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none text-slate-800 placeholder:text-slate-400"
      />
    )}
  </div>
);

export const SelectGroup = ({ label, name, value, onChange, options, className = "" }: any) => (
  <div className={`flex flex-col gap-1.5 ${className}`}>
    <label className="text-sm font-medium text-slate-600">{label}</label>
    <select
      name={name}
      value={value}
      onChange={onChange}
      className="px-3 py-2 bg-white border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none text-slate-800"
    >
      <option value="">Chọn...</option>
      {options.map((opt: any) => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </select>
  </div>
);

export const TimeInput = ({ label, hourName, hourValue, minuteName, minuteValue, onChange }: any) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-sm font-medium text-slate-600">{label}</label>
    <div className="flex items-center gap-2">
      <input
        type="text"
        inputMode="numeric"
        name={hourName}
        value={hourValue}
        onChange={onChange}
        placeholder=".."
        className="w-12 px-2 py-2 text-center bg-white border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
      />
      <span className="text-sm text-slate-500">giờ</span>
      <input
        type="text"
        inputMode="numeric"
        name={minuteName}
        value={minuteValue}
        onChange={onChange}
        placeholder=".."
        className="w-12 px-2 py-2 text-center bg-white border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
      />
      <span className="text-sm text-slate-500">phút</span>
    </div>
  </div>
);

export const DateInput = ({ label, dayName, dayValue, monthName, monthValue, yearName, yearValue, onChange }: any) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-sm font-medium text-slate-600">{label}</label>
    <div className="flex items-center gap-2 flex-wrap">
      <input
        type="text"
        inputMode="numeric"
        name={dayName}
        value={dayValue}
        onChange={onChange}
        placeholder=".."
        className="w-12 px-2 py-2 text-center bg-white border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
      />
      <span className="text-sm text-slate-500">ngày</span>
      <input
        type="text"
        inputMode="numeric"
        name={monthName}
        value={monthValue}
        onChange={onChange}
        placeholder=".."
        className="w-12 px-2 py-2 text-center bg-white border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
      />
      <span className="text-sm text-slate-500">tháng</span>
      <input
        type="text"
        inputMode="numeric"
        name={yearName}
        value={yearValue}
        onChange={onChange}
        placeholder="...."
        className="w-20 px-2 py-2 text-center bg-white border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
      />
      <span className="text-sm text-slate-500">năm</span>
    </div>
  </div>
);

import { Plus, Trash2 } from 'lucide-react';

export const TestResultTable = ({ results, onChange, onAdd, onRemove }: any) => (
  <div className="overflow-x-auto">
    <table className="w-full border-collapse text-sm">
      <thead>
        <tr className="bg-slate-100 text-slate-700">
          <th className="border p-2 text-left">Tên xét nghiệm</th>
          <th className="border p-2 text-left">Giá trị</th>
          <th className="border p-2 text-left w-24">Đơn vị</th>
          <th className="border p-2 text-left w-40">Giá trị bình thường</th>
          <th className="border p-2 text-left">Nhận xét</th>
          <th className="border p-2 w-10"></th>
        </tr>
      </thead>
      <tbody>
        {results.map((res: any, index: number) => (
          <tr key={res.id || index} className="bg-white">
            <td className="border p-1">
              <input 
                className="w-full px-2 py-1 outline-none" 
                value={res.name} 
                onChange={(e) => onChange(index, 'name', e.target.value)}
                placeholder="..."
              />
            </td>
            <td className="border p-1">
              <input 
                className="w-full px-2 py-1 outline-none" 
                value={res.value} 
                onChange={(e) => onChange(index, 'value', e.target.value)}
                placeholder="..."
              />
            </td>
            <td className="border p-1">
              <input 
                className="w-full px-2 py-1 outline-none" 
                value={res.unit} 
                onChange={(e) => onChange(index, 'unit', e.target.value)}
                placeholder="..."
              />
            </td>
            <td className="border p-1">
              <input 
                className="w-full px-2 py-1 outline-none" 
                value={res.normalValue} 
                onChange={(e) => onChange(index, 'normalValue', e.target.value)}
                placeholder="..."
              />
            </td>
            <td className="border p-1">
              <input 
                className="w-full px-2 py-1 outline-none" 
                value={res.remark} 
                onChange={(e) => onChange(index, 'remark', e.target.value)}
                placeholder="..."
              />
            </td>
            <td className="border p-1 text-center">
              <button onClick={() => onRemove(index)} className="text-red-500 hover:text-red-700">
                <Trash2 className="w-4 h-4" />
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
    <button 
      onClick={onAdd}
      className="mt-2 flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors"
    >
      <Plus className="w-4 h-4" /> THÊM DÒNG
    </button>
  </div>
);

export const DrugOrderTable = ({ rows, onChange, onAdd, onRemove }: any) => (
  <div className="overflow-x-auto">
    <table className="w-full border-collapse text-sm">
      <thead>
        <tr className="bg-slate-100 text-slate-700">
          <th className="border p-2 text-left">Tên thuốc</th>
          <th className="border p-2 text-left w-24">Số lượng</th>
          <th className="border p-2 text-left">Đường truyền</th>
          <th className="border p-2 text-left">Tốc độ</th>
          <th className="border p-2 text-left">Thời gian</th>
          <th className="border p-2 w-10"></th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row: any, index: number) => (
          <tr key={row.id || index} className="bg-white">
            <td className="border p-1">
              <input 
                className="w-full px-2 py-1 outline-none" 
                value={row.name} 
                onChange={(e) => onChange(index, 'name', e.target.value)}
                placeholder="..."
              />
            </td>
            <td className="border p-1">
              <input 
                className="w-full px-2 py-1 outline-none" 
                value={row.quantity} 
                onChange={(e) => onChange(index, 'quantity', e.target.value)}
                placeholder="x1"
              />
            </td>
            <td className="border p-1">
              <input 
                className="w-full px-2 py-1 outline-none" 
                value={row.route} 
                onChange={(e) => onChange(index, 'route', e.target.value)}
                placeholder="..."
              />
            </td>
            <td className="border p-1">
              <input 
                className="w-full px-2 py-1 outline-none" 
                value={row.speed} 
                onChange={(e) => onChange(index, 'speed', e.target.value)}
                placeholder="..."
              />
            </td>
            <td className="border p-1">
              <input 
                className="w-full px-2 py-1 outline-none" 
                value={row.time} 
                onChange={(e) => onChange(index, 'time', e.target.value)}
                placeholder="..."
              />
            </td>
            <td className="border p-1 text-center">
              <button onClick={() => onRemove(index)} className="text-red-500 hover:text-red-700">
                <Trash2 className="w-4 h-4" />
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
    <button 
      onClick={onAdd}
      className="mt-2 flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors"
    >
      <Plus className="w-4 h-4" /> THÊM DÒNG
    </button>
  </div>
);

export const DynamicList = ({ label, items, onChange, onAdd, onRemove, prefix = "" }: any) => (
  <div className="flex flex-col gap-1.5 w-full">
    <label className="text-sm font-medium text-slate-600">{label}</label>
    <div className="space-y-2">
      {items.map((item: string, index: number) => (
        <div key={index} className="flex gap-2 items-start">
          <span className="mt-2 text-xs font-bold text-slate-400 w-8">{prefix}{index + 1}</span>
          <textarea
            value={item}
            onChange={(e) => onChange(index, e.target.value)}
            rows={2}
            className="flex-1 px-3 py-2 bg-white border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none text-slate-800"
          />
          <button onClick={() => onRemove(index)} className="mt-2 text-red-500 hover:text-red-700">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
    <button 
      onClick={onAdd}
      className="mt-2 self-start flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors"
    >
      <Plus className="w-4 h-4" /> THÊM MỤC
    </button>
  </div>
);

export const TextAreaGroup = ({ label, name, value, onChange, placeholder, rows = 3 }: any) => (
  <div className="flex flex-col gap-1.5 w-full">
    <label className="text-sm font-medium text-slate-600">{label}</label>
    <textarea
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      rows={rows}
      className="px-3 py-2 bg-white border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none text-slate-800 placeholder:text-slate-400"
    />
  </div>
);
