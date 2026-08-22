import type { CSSProperties, PropsWithChildren } from "react";
import { Img, staticFile } from "remotion";
import { colors } from "../theme";

type MediaCardProps = PropsWithChildren<{
  src: string;
  alt: string;
  style?: CSSProperties;
  imageStyle?: CSSProperties;
  label?: string;
}>;

export const MediaCard: React.FC<MediaCardProps> = ({
  src,
  alt,
  style,
  imageStyle,
  label,
  children,
}) => (
  <div
    style={{
      background: colors.paper,
      border: "1px solid rgba(23,35,31,0.12)",
      borderRadius: 34,
      boxShadow: "0 30px 90px rgba(23,35,31,0.18)",
      overflow: "hidden",
      position: "relative",
      ...style,
    }}
  >
    <Img
      alt={alt}
      src={staticFile(src)}
      style={{
        height: "100%",
        objectFit: "cover",
        width: "100%",
        ...imageStyle,
      }}
    />
    {label ? (
      <div
        style={{
          background: "rgba(23,35,31,0.86)",
          borderRadius: 999,
          bottom: 22,
          color: colors.white,
          fontSize: 20,
          fontWeight: 600,
          left: 22,
          padding: "12px 18px",
          position: "absolute",
        }}
      >
        {label}
      </div>
    ) : null}
    {children}
  </div>
);
