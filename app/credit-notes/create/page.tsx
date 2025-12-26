'use client';

import { useRouter } from 'next/navigation';
import CreditNoteForm from '@/components/CreditNoteForm';

export default function CreateCreditNotePage() {
  const router = useRouter();
  
  return <CreditNoteForm onSuccess={() => router.push('/credit-notes')} />;
}

