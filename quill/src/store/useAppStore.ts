import { useState, useEffect } from "react";
import type { Document, SubscriptionStatus } from "../types";

// simple module-level store, no external deps

type AppState = {
  subscription: SubscriptionStatus;
  dailyUsageCount: number;
  documents: Document[];
};

let _state: AppState = {
  subscription: "free",
  dailyUsageCount: 0,
  documents: [
    {
      id: "1",
      title: "What is UI vs UX?",
      body: "In digital design, the user interface (UI) focuses on how a product screen or web page looks and functions, while the user experience (UX) encompasses the overall interaction and satisfaction a user has with the product or website.",
      createdAt: Date.now() - 1000 * 60 * 60 * 2,
      updatedAt: Date.now() - 1000 * 60 * 60 * 2,
    },
    {
      id: "2",
      title: "The Art of Clear Writing",
      body: "Good writing is rewriting. Every first draft is simply you telling yourself the story. The craft begins when you return to the page with fresh eyes and ask: what is the one thing I am trying to say?",
      createdAt: Date.now() - 1000 * 60 * 60 * 24,
      updatedAt: Date.now() - 1000 * 60 * 60 * 24,
    },
    {
      id: "3",
      title: "Notes on Product Thinking",
      body: "The best products solve for the job to be done, not the feature requested. Users ask for faster horses. Your job is to understand why they want to move faster and build accordingly.",
      createdAt: Date.now() - 1000 * 60 * 60 * 48,
      updatedAt: Date.now() - 1000 * 60 * 60 * 48,
    },
  ],
};

const listeners = new Set<() => void>();

function notify() {
  listeners.forEach((fn) => fn());
}

function upgradeToProAction() {
  _state = { ..._state, subscription: "pro" };
  notify();
}

function incrementUsageAction() {
  _state = { ..._state, dailyUsageCount: _state.dailyUsageCount + 1 };
  notify();
}

function upsertDocumentAction(doc: Document) {
  const existing = _state.documents.findIndex((d) => d.id === doc.id);
  const documents =
    existing >= 0
      ? _state.documents.map((d) => (d.id === doc.id ? doc : d))
      : [doc, ..._state.documents];
  _state = { ..._state, documents };
  notify();
}

export function useAppStore() {
  const [, forceRender] = useState(0);

  useEffect(() => {
    const trigger = () => forceRender((n) => n + 1);
    listeners.add(trigger);
    return () => {
      listeners.delete(trigger);
    };
  }, []);

  return {
    subscription: _state.subscription,
    dailyUsageCount: _state.dailyUsageCount,
    documents: _state.documents,
    isPro: _state.subscription === "pro",
    hasReachedLimit:
      _state.subscription === "free" && _state.dailyUsageCount >= 3,

    upgradeToPro: upgradeToProAction,
    incrementUsage: incrementUsageAction,
    upsertDocument: upsertDocumentAction,
  };
}
