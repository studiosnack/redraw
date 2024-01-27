import * as React from "react";
import styled from "@emotion/styled";

export const IconButton = styled.button`
  border: none;
  padding: 0;
  background: none;
  display: flex;
`;

export const ArrowIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    width="20"
    height="20"
    viewBox="0 0 205 205"
    version="1.1"
  >
    <g id="Artboard1" transform="matrix(1,0,0,1,485.568,-43.7983)">
      <g transform="matrix(1.6212,0,0,1.6212,-713.003,-294.494)">
        <path d="M237.029,276.643C238.757,275.668 239.826,273.838 239.826,271.853C239.826,269.869 238.757,268.038 237.029,267.063L175.324,232.246C173.621,231.285 171.536,231.3 169.848,232.286C168.159,233.272 167.121,235.081 167.121,237.036L167.121,306.671C167.121,308.626 168.159,310.434 169.848,311.42C171.536,312.406 173.621,312.422 175.324,311.461L237.029,276.643Z" />
      </g>
    </g>
  </svg>
);

export const EllipsisIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    width="12"
    height="12"
    viewBox="0 0 522 522"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M261 522C405.146 522 522 405.146 522 261C522 116.854 405.146 0 261 0C116.854 0 0 116.854 0 261C0 405.146 116.854 522 261 522ZM109 317C139.928 317 165 291.928 165 261C165 230.072 139.928 205 109 205C78.0721 205 53 230.072 53 261C53 291.928 78.0721 317 109 317ZM317 261C317 291.928 291.928 317 261 317C230.072 317 205 291.928 205 261C205 230.072 230.072 205 261 205C291.928 205 317 230.072 317 261ZM413 317C443.928 317 469 291.928 469 261C469 230.072 443.928 205 413 205C382.072 205 357 230.072 357 261C357 291.928 382.072 317 413 317Z"
    />
  </svg>
);
