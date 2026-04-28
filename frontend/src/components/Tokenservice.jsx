import { databases, client_ } from './appwriteConfig';
import { ID, Query } from 'appwrite';

// ── Fill these in from your Appwrite console ─────────────────────────────────
const DATABASE_ID   = import.meta.env.VITE_APPWRITE_DATABASE_ID   || 'YOUR_DATABASE_ID';
const COLLECTION_ID = import.meta.env.VITE_APPWRITE_COLLECTION_ID || 'YOUR_COLLECTION_ID';

/**
 * @typedef {{
 *   id: string,
 *   studentId: string,
 *   studentName: string,
 *   serviceType: string,
 *   status: 'pending' | 'calling' | 'serving' | 'done',
 *   tokenNumber: number,
 *   estimatedWait?: number,
 *   counter?: string,
 *   createdAt: string,
 * }} Token
 */

// ── Helpers ──────────────────────────────────────────────────────────────────

/** Map a raw Appwrite document to our Token shape */
function docToToken(doc) {
  return {
    id:            doc.$id,
    studentId:     doc.studentId,
    studentName:   doc.studentName,
    serviceType:   doc.serviceType,
    status:        doc.status,
    tokenNumber:   doc.tokenNumber,
    estimatedWait: doc.estimatedWait ?? undefined,
    counter:       doc.counter ?? undefined,
    createdAt:     doc.$createdAt,
  };
}

/** Get the next token number (max existing + 1) */
async function nextTokenNumber() {
  const res = await databases.listDocuments(DATABASE_ID, COLLECTION_ID, [
    Query.orderDesc('tokenNumber'),
    Query.limit(1),
  ]);
  return res.total === 0 ? 100 : Number(res.documents[0].tokenNumber) + 1;
}

// ── Service ──────────────────────────────────────────────────────────────────
export const tokenService = {

  /**
   * Create a new token document and return its Appwrite document ID.
   */
  requestToken: async (
    studentId,
    studentName,
    serviceType,
  ) => {
    const tokenNumber   = await nextTokenNumber();
    const estimatedWait = tokenNumber - 100; // simple heuristic — adjust as needed

    const doc = await databases.createDocument(
      DATABASE_ID,
      COLLECTION_ID,
      ID.unique(),
      {
        studentId,
        studentName,
        serviceType,
        status: 'pending',
        tokenNumber,
        estimatedWait,
        counter: null,
      },
    );

    return doc.$id;
  },

  /**
   * Fetch all tokens once and subscribe to real-time updates.
   * Returns an unsubscribe function — call it on component unmount.
   */
  subscribeToTokens: (callback) => {
    // Initial fetch
    databases
      .listDocuments(DATABASE_ID, COLLECTION_ID, [
        Query.orderAsc('tokenNumber'),
        Query.limit(100),
      ])
      .then((res) => callback(res.documents.map(docToToken)))
      .catch(console.error);

    // Real-time subscription
    const channel = `databases.${DATABASE_ID}.collections.${COLLECTION_ID}.documents`;

    const unsubscribe = client_.subscribe(channel, (event) => {
      // Re-fetch the full list on any change so ordering stays consistent.
      // For large queues, replace with optimistic local state updates instead.
      databases
        .listDocuments(DATABASE_ID, COLLECTION_ID, [
          Query.orderAsc('tokenNumber'),
          Query.limit(100),
        ])
        .then((res) => callback(res.documents.map(docToToken)))
        .catch(console.error);
    });

    return unsubscribe;
  },

  /**
   * Update a token's status and optionally assign a counter.
   */
  updateTokenStatus: async (
    tokenId,
    status,
    counter,
  ) => {
    await databases.updateDocument(DATABASE_ID, COLLECTION_ID, tokenId, {
      status,
      ...(counter !== undefined ? { counter } : {}),
    });
  },
};
