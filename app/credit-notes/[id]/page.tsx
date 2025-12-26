'use client';

import { useRouter, useParams } from 'next/navigation';
import CreditNoteForm from '@/components/CreditNoteForm';

export default function ViewCreditNotePage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  
  return <CreditNoteForm id={id} onSuccess={() => router.push('/credit-notes')} />;
}

