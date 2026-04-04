import React from "react";
import { Text as RNText, TextStyle, StyleProp, TextProps as RNTextProps } from "react-native";

const SIZE_MAP: Record<string, { fontSize: number; lineHeight: number }> = {
  "$1": { fontSize: 11, lineHeight: 15 },
  "$2": { fontSize: 12, lineHeight: 17 },
  "$3": { fontSize: 13, lineHeight: 18 },
  "$4": { fontSize: 14, lineHeight: 20 },
  "$5": { fontSize: 16, lineHeight: 22 },
  "$true": { fontSize: 14, lineHeight: 20 },
  "$6": { fontSize: 18, lineHeight: 25 },
  "$7": { fontSize: 20, lineHeight: 28 },
  "$8": { fontSize: 23, lineHeight: 30 },
  "$9": { fontSize: 30, lineHeight: 38 },
  "$10": { fontSize: 36, lineHeight: 44 },
};

const WEIGHT_MAP: Record<string, string> = {
  "400": "Inter_400Regular",
  "normal": "Inter_400Regular",
  "500": "Inter_500Medium",
  "600": "Inter_600SemiBold",
  "700": "Inter_700Bold",
  "800": "Inter_700Bold",
  "bold": "Inter_700Bold",
};

interface BaseTextProps extends RNTextProps {
  size?: keyof typeof SIZE_MAP;
  color?: string;
  fontWeight?: TextStyle["fontWeight"];
  fontStyle?: TextStyle["fontStyle"];
  textAlign?: TextStyle["textAlign"];
  letterSpacing?: number;
  textTransform?: TextStyle["textTransform"];
  textDecorationLine?: TextStyle["textDecorationLine"];
  opacity?: number;
  flex?: number;
  maxWidth?: number;
  marginBottom?: number;
  marginTop?: number;
  userSelect?: "auto" | "none";
  style?: StyleProp<TextStyle>;
}

function resolveFont(weight: TextStyle["fontWeight"] | undefined): string {
  if (!weight) return "Inter_400Regular";
  return WEIGHT_MAP[String(weight)] || "Inter_400Regular";
}

function buildTextStyle(props: BaseTextProps, defaults?: Partial<TextStyle>): TextStyle {
  const sizeToken = props.size || defaults?.fontSize ? undefined : "$true";
  const sizeValues = props.size ? SIZE_MAP[props.size] : sizeToken ? SIZE_MAP[sizeToken] : undefined;
  const weight = props.fontWeight || defaults?.fontWeight || "400";

  const s: TextStyle = {
    ...defaults,
    fontFamily: resolveFont(weight),
    fontWeight: weight,
  };

  if (sizeValues) {
    s.fontSize = sizeValues.fontSize;
    s.lineHeight = sizeValues.lineHeight;
  }
  if (props.color) s.color = props.color;
  if (props.fontStyle) s.fontStyle = props.fontStyle;
  if (props.textAlign) s.textAlign = props.textAlign;
  if (props.letterSpacing !== undefined) s.letterSpacing = props.letterSpacing;
  if (props.textTransform) s.textTransform = props.textTransform;
  if (props.textDecorationLine) s.textDecorationLine = props.textDecorationLine;
  if (props.opacity !== undefined) s.opacity = props.opacity;
  if (props.flex !== undefined) s.flex = props.flex;
  if (props.maxWidth !== undefined) s.maxWidth = props.maxWidth;
  if (props.marginBottom !== undefined) s.marginBottom = props.marginBottom;
  if (props.marginTop !== undefined) s.marginTop = props.marginTop;

  return s;
}

export function SizableText(props: BaseTextProps) {
  const { size, color, fontWeight, fontStyle, textAlign, letterSpacing, textTransform, textDecorationLine, opacity, flex, maxWidth, marginBottom, marginTop, userSelect, style, ...rest } = props;
  return (
    <RNText
      style={[buildTextStyle(props), style]}
      selectable={userSelect === "auto" ? true : userSelect === "none" ? false : undefined}
      {...rest}
    />
  );
}

export function Paragraph(props: BaseTextProps) {
  const { size, color, fontWeight, fontStyle, textAlign, letterSpacing, textTransform, textDecorationLine, opacity, flex, maxWidth, marginBottom, marginTop, userSelect, style, ...rest } = props;
  const defaults: Partial<TextStyle> = {
    color: undefined,
  };
  return (
    <RNText
      style={[buildTextStyle(props, defaults), style]}
      selectable={userSelect === "auto" ? true : userSelect === "none" ? false : true}
      {...rest}
    />
  );
}

interface InlineProps extends RNTextProps {
  color?: string;
  style?: StyleProp<TextStyle>;
}

export function Strong(props: InlineProps) {
  const { color, style, ...rest } = props;
  return (
    <RNText
      style={[
        { fontFamily: "Inter_700Bold", fontWeight: "bold" },
        color ? { color } : undefined,
        style,
      ]}
      {...rest}
    />
  );
}

export function Em(props: InlineProps) {
  const { color, style, ...rest } = props;
  return (
    <RNText
      style={[
        { fontFamily: "Inter_400Regular", fontStyle: "italic" },
        color ? { color } : undefined,
        style,
      ]}
      {...rest}
    />
  );
}

export function Span(props: InlineProps) {
  const { color, style, ...rest } = props;
  return (
    <RNText
      style={[
        { fontFamily: "Inter_400Regular" },
        color ? { color } : undefined,
        style,
      ]}
      {...rest}
    />
  );
}
