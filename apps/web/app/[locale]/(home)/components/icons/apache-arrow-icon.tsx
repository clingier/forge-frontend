import type { SVGProps } from "react";

export const ApacheArrowIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    {...props}
  >
    {/* Stylized arrow representing Apache Arrow's columnar data format */}
    <path d="M4 12h13.17l-4.58-4.59L14 6l7 6-7 6-1.41-1.41L17.17 12H4z" />
  </svg>
);
