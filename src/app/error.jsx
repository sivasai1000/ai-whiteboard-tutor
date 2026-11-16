"use client";
import { ErrorState } from "@/components/shared/ErrorState";
export default function ErrorPage({ reset }) {
  return (
    <div className="mx-auto max-w-xl px-6 py-24">
      <h1 className="mb-5 text-2xl font-medium">
        Something interrupted this page.
      </h1>
      <ErrorState
        message="Your saved lessons are still on this device. Please try loading the page again."
        onRetry={reset}
      />
    </div>
  );
}
