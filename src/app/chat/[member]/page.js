'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import ChatContainer from '@/components/chat/ChatContainer';
import { getMemberData } from '@/lib/memberData';
import { notFound } from 'next/navigation';

/**
 * MemberChatPage - Page for chatting with a specific TWICE member
 */
export default function MemberChatPage() {
  const params = useParams();
  const memberId = params.member;
  
  // Check if member exists
  const member = getMemberData(memberId);
  if (!member) {
    notFound();
  }
  
  return (
    <div className="h-[100dvh] w-full">
      <ChatContainer memberId={memberId} />
    </div>
  );
}
