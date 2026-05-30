import React from "react";
import { View, Text } from "react-native";
import { SvgUri } from "react-native-svg";
import { BRAND_LOGO_URIS } from "@/data/brandLogos";

interface BrandLogoProps {
  id: string;
  name: string;
  color: string;
  size?: number;
  borderRadius?: number;
}

/**
 * Renders an authentic brand logo using locally-stored Simple Icons SVGs.
 * Falls back to a colored circle with the brand initial if no logo is found.
 */
export function BrandLogo({ id, name, color, size = 38, borderRadius = 12 }: BrandLogoProps) {
  const logoUri = BRAND_LOGO_URIS[id];

  const containerStyle = {
    width: size,
    height: size,
    borderRadius,
    backgroundColor: `${color}22`,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    overflow: "hidden" as const,
  };

  const logoSize = Math.round(size * 0.62);

  if (!logoUri) {
    return (
      <View style={[containerStyle, { backgroundColor: `${color}33` }]}>
        <Text
          style={{
            fontSize: size * 0.4,
            fontFamily: "Inter_700Bold",
            color,
          }}
        >
          {name.charAt(0).toUpperCase()}
        </Text>
      </View>
    );
  }

  return (
    <View style={containerStyle}>
      <SvgUri
        uri={logoUri}
        width={logoSize}
        height={logoSize}
      />
    </View>
  );
}
