import React from "react";
import { View, ViewStyle, StyleProp } from "react-native";

interface StackProps {
  children?: React.ReactNode;
  gap?: number;
  padding?: number;
  paddingHorizontal?: number;
  paddingVertical?: number;
  alignItems?: ViewStyle["alignItems"];
  justifyContent?: ViewStyle["justifyContent"];
  flex?: number;
  flexWrap?: ViewStyle["flexWrap"];
  backgroundColor?: string;
  borderRadius?: number;
  borderWidth?: number;
  borderColor?: string;
  width?: ViewStyle["width"];
  height?: ViewStyle["height"];
  minHeight?: ViewStyle["minHeight"];
  overflow?: ViewStyle["overflow"];
  style?: StyleProp<ViewStyle>;
}

function buildStyle(props: StackProps, direction: "row" | "column"): ViewStyle {
  const s: ViewStyle = { flexDirection: direction };
  if (props.gap !== undefined) s.gap = props.gap;
  if (props.padding !== undefined) s.padding = props.padding;
  if (props.paddingHorizontal !== undefined) s.paddingHorizontal = props.paddingHorizontal;
  if (props.paddingVertical !== undefined) s.paddingVertical = props.paddingVertical;
  if (props.alignItems) s.alignItems = props.alignItems;
  if (props.justifyContent) s.justifyContent = props.justifyContent;
  if (props.flex !== undefined) s.flex = props.flex;
  if (props.flexWrap) s.flexWrap = props.flexWrap;
  if (props.backgroundColor) s.backgroundColor = props.backgroundColor;
  if (props.borderRadius !== undefined) s.borderRadius = props.borderRadius;
  if (props.borderWidth !== undefined) s.borderWidth = props.borderWidth;
  if (props.borderColor) s.borderColor = props.borderColor;
  if (props.width !== undefined) s.width = props.width;
  if (props.height !== undefined) s.height = props.height;
  if (props.minHeight !== undefined) s.minHeight = props.minHeight;
  if (props.overflow) s.overflow = props.overflow;
  return s;
}

export function XStack(props: StackProps) {
  return (
    <View style={[buildStyle(props, "row"), props.style]}>
      {props.children}
    </View>
  );
}

export function YStack(props: StackProps) {
  return (
    <View style={[buildStyle(props, "column"), props.style]}>
      {props.children}
    </View>
  );
}

export function ZStack(props: StackProps) {
  const base = buildStyle(props, "column");
  const children = React.Children.toArray(props.children);
  return (
    <View style={[base, { position: "relative" }, props.style]}>
      {children[0]}
      {children.slice(1).map((child, index) => (
        <View
          key={index}
          style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}
        >
          {child}
        </View>
      ))}
    </View>
  );
}
