'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ROUTES } from '@/lib/constants';

/**
 * MemberCard - Component for displaying a TWICE member card
 * 
 * @param {Object} props
 * @param {Object} props.member - Member data object
 * @param {boolean} props.compact - Whether to display in compact mode
 * @param {string} props.className - Additional CSS classes
 */
const MemberCard = ({ 
  member, 
  compact = false,
  className = ''
}) => {
  if (!member) return null;
  
  // Compact version (small card)
  if (compact) {
    return (
      <Link 
        href={ROUTES.MEMBER_CHAT(member.id)}
        className={`flex items-center p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors ${className}`}
      >
        <div className="relative h-10 w-10 rounded-full overflow-hidden border-2 flex-shrink-0" style={{ borderColor: member.color }}>
          {member.imageUrl ? (
            <Image 
              src={member.imageUrl} 
              alt={member.name}
              fill
              className="object-cover"
              sizes="40px"
            />
          ) : (
            <div 
              className="h-full w-full flex items-center justify-center text-white text-lg font-bold"
              style={{ backgroundColor: member.color }}
            >
              {member.name.charAt(0)}
            </div>
          )}
        </div>
        
        <div className="ml-3">
          <h3 className="font-medium text-gray-900 dark:text-white">{member.name}</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">{member.position}</p>
        </div>
      </Link>
    );
  }
  
  // Full version
  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden h-full ${className}`} style={{ borderTop: `4px solid ${member.color}` }}>
      {/* Member Image */}
      <div className="relative w-full h-48">
        {member.imageUrl ? (
          <Image
            src={member.imageUrl}
            alt={member.name}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 33vw"
          />
        ) : (
          <div 
            className="w-full h-full flex items-center justify-center text-white text-4xl font-bold"
            style={{ backgroundColor: member.color }}
          >
            {member.name.charAt(0)}
          </div>
        )}
      </div>
      
      {/* Member Info */}
      <div className="p-4">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">{member.name}</h2>
            <p className="text-gray-600 dark:text-gray-400 text-sm">{member.position}</p>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-2 py-1 rounded">
              {member.mbti}
            </span>
            <span className="text-xl" title={member.emoji}>
              {member.emoji}
            </span>
          </div>
        </div>
        
        {/* Personality Traits */}
        {member.personality && (
          <div className="mt-3">
            <div className="flex flex-wrap gap-1">
              {member.personality.traits.slice(0, 3).map((trait, index) => (
                <span key={index} className="text-xs px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200">
                  {trait}
                </span>
              ))}
            </div>
          </div>
        )}
        
        {/* Chat Button */}
        <Link 
          href={ROUTES.MEMBER_CHAT(member.id)} 
          className="mt-4 block w-full text-center py-2 rounded-full text-white font-medium text-sm hover:opacity-90 transition-opacity"
          style={{ backgroundColor: member.color }}
        >
          Chat with {member.name}
        </Link>
      </div>
    </div>
  );
};

export default MemberCard;
