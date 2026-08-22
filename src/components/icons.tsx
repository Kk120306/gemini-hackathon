import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

function IconFrame({ children, ...props }: IconProps) {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.8"
      {...props}
    >
      {children}
    </svg>
  );
}

export function ArrowRightIcon(props: IconProps) {
  return (
    <IconFrame {...props}>
      <path d="M5 12h14M14 7l5 5-5 5" />
    </IconFrame>
  );
}

export function CareIcon(props: IconProps) {
  return (
    <IconFrame {...props}>
      <path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10Z" />
      <path d="M9.5 12.2h5" />
    </IconFrame>
  );
}

export function CheckIcon(props: IconProps) {
  return (
    <IconFrame {...props}>
      <path d="m5 12.5 4.2 4.2L19 7" />
    </IconFrame>
  );
}

export function EyeIcon(props: IconProps) {
  return (
    <IconFrame {...props}>
      <path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z" />
      <circle cx="12" cy="12" r="2.5" />
    </IconFrame>
  );
}

export function HelpIcon(props: IconProps) {
  return (
    <IconFrame {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M9.8 9a2.5 2.5 0 0 1 4.8 1c0 1.8-2.6 2-2.6 4M12 17.2h.01" />
    </IconFrame>
  );
}

export function ImageIcon(props: IconProps) {
  return (
    <IconFrame {...props}>
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <circle cx="9" cy="9" r="1.5" />
      <path d="m4 17 5-5 3 3 2-2 6 5" />
    </IconFrame>
  );
}

export function PlayIcon(props: IconProps) {
  return (
    <IconFrame {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="m10 8 6 4-6 4Z" />
    </IconFrame>
  );
}

export function ReplayIcon(props: IconProps) {
  return (
    <IconFrame {...props}>
      <path d="M4 7v5h5" />
      <path d="M5.5 16a8 8 0 1 0 .2-8.2L4 10" />
    </IconFrame>
  );
}

export function ShieldIcon(props: IconProps) {
  return (
    <IconFrame {...props}>
      <path d="M12 3 5 6v5c0 4.8 2.9 8.3 7 10 4.1-1.7 7-5.2 7-10V6l-7-3Z" />
      <path d="m9 12 2 2 4-4" />
    </IconFrame>
  );
}

export function SparkIcon(props: IconProps) {
  return (
    <IconFrame {...props}>
      <path d="m12 3 1.3 4.2L17.5 9l-4.2 1.4L12 15l-1.4-4.6L6.5 9l4.1-1.8L12 3Z" />
      <path d="m18.5 15 .7 2.2 2.3.8-2.3.8-.7 2.2-.8-2.2-2.2-.8 2.2-.8.8-2.2Z" />
    </IconFrame>
  );
}

export function UploadIcon(props: IconProps) {
  return (
    <IconFrame {...props}>
      <path d="M12 16V4M7 9l5-5 5 5M5 20h14" />
    </IconFrame>
  );
}

export function UserIcon(props: IconProps) {
  return (
    <IconFrame {...props}>
      <circle cx="12" cy="8" r="4" />
      <path d="M4.5 21c.8-4.2 3.3-6.5 7.5-6.5s6.7 2.3 7.5 6.5" />
    </IconFrame>
  );
}

export function VolumeIcon(props: IconProps) {
  return (
    <IconFrame {...props}>
      <path d="M5 10v4h3l4 4V6L8 10H5Z" />
      <path d="M16 9a4 4 0 0 1 0 6M18.5 6.5a8 8 0 0 1 0 11" />
    </IconFrame>
  );
}
