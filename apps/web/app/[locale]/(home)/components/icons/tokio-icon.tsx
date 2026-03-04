import type { SVGProps } from "react";

export const TokioIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    {/* Stylized "T" with motion lines representing Tokio's async runtime */}
    <path d="M4 4h16" />
    <path d="M12 4v16" />
    <path d="M7 8l2-2" />
    <path d="M17 8l-2-2" />
  </svg>
);
