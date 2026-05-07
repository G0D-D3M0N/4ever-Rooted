import React from "react";

export function LoadingSpinner({ size = 40 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 44 44"
      xmlns="http://www.w3.org/2000/svg"
      stroke="currentColor"
    >
      <g fill="none" fillRule="evenodd" strokeWidth="2">
        <circle cx="22" cy="22" r="20" opacity="0.5" />
        <path d="M22 2a20 20 0 0 1 20 20" />
      </g>
      <style>{"@keyframes spin { to { transform: rotate(360deg); } }"}</style>
      <animateTransform attributeName="transform" type="rotate" from="0 22 22" to="360 22 22" dur="1s" repeatCount="indefinite" />
    </svg>
  );
}
