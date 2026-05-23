/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  id: string;
  title: string;
  value: string | number;
  subtext: string;
  icon: LucideIcon;
  badgeText?: string;
  badgeType?: 'success' | 'warning' | 'info' | 'danger';
}

export const MetricCard: React.FC<MetricCardProps> = ({
  id,
  title,
  value,
  subtext,
  icon: Icon,
  badgeText,
  badgeType = 'info'
}) => {
  const getBadgeClass = () => {
    switch (badgeType) {
      case 'success':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200/60 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/30';
      case 'warning':
        return 'bg-amber-50 text-amber-700 border-amber-200/60 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/30';
      case 'danger':
        return 'bg-rose-50 text-rose-700 border-rose-200/60 dark:bg-rose-950/20 dark:text-rose-400 dark:border-rose-900/30';
      default:
        return 'bg-sky-50 text-sky-700 border-sky-200/60 dark:bg-sky-950/20 dark:text-sky-400 dark:border-sky-900/30';
    }
  };

  return (
    <div 
      id={id}
      className="relative flex flex-col justify-between p-6 bg-white dark:bg-gray-900/60 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-xs hover:shadow-md hover:border-gray-200 dark:hover:border-gray-700 transition-all duration-200 group overflow-hidden"
    >
      {/* Decorative ambient background blur */}
      <div className="absolute top-0 right-0 w-24 h-24 bg-linear-to-bl from-teal-500/5 to-transparent rounded-full pointer-events-none group-hover:scale-125 transition-transform duration-300" />

      <div className="flex items-start justify-between">
        <div className="space-y-1.5">
          <span className="text-xs font-medium uppercase tracking-wider text-gray-400 dark:text-gray-500">
            {title}
          </span>
          <h3 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white font-sans">
            {value}
          </h3>
        </div>
        <div className="p-3 bg-gray-50 dark:bg-gray-800/80 text-gray-500 dark:text-gray-400 rounded-xl group-hover:scale-105 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-all duration-200">
          <Icon className="w-5 h-5 stroke-2" />
        </div>
      </div>

      <div className="flex items-center justify-between mt-5 pt-3.5 border-t border-gray-50 dark:border-gray-800/75">
        <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
          {subtext}
        </span>
        {badgeText && (
          <span className={`px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider rounded-full border ${getBadgeClass()}`}>
            {badgeText}
          </span>
        )}
      </div>
    </div>
  );
};
