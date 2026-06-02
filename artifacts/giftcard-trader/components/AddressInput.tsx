import React, { useState, useCallback, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Platform,
} from "react-native";

// Common Nigerian addresses (street patterns, LGAs, states)
const ADDRESS_SUGGESTIONS = [
  // Lagos
  "1 Victoria Island, Lagos, Nigeria",
  "12 Adeola Odeku Street, Victoria Island, Lagos, Nigeria",
  "5 Broad Street, Lagos Island, Lagos, Nigeria",
  "23 Bode Thomas Street, Surulere, Lagos, Nigeria",
  "10 Allen Avenue, Ikeja, Lagos, Nigeria",
  "7 Admiralty Way, Lekki Phase 1, Lagos, Nigeria",
  "15 Ogunnusi Road, Ojodu, Lagos, Nigeria",
  "3 Isaac John Street, GRA Ikeja, Lagos, Nigeria",
  "42 Marina Street, Lagos Island, Lagos, Nigeria",
  "18 Awolowo Road, Ikoyi, Lagos, Nigeria",
  "30 Aba Johnson Road, Adeniyi Jones, Ikeja, Lagos, Nigeria",
  "9 Opebi Road, Ikeja, Lagos, Nigeria",
  "6 Akin Adesola Street, Victoria Island, Lagos, Nigeria",
  "25 Ogunyemi Road, Ifako, Lagos, Nigeria",
  // Abuja
  "1 Adetokunbo Ademola Crescent, Wuse 2, Abuja, Nigeria",
  "7 Aminu Kano Crescent, Wuse 2, Abuja, Nigeria",
  "14 Gana Street, Maitama, Abuja, Nigeria",
  "3 Lobito Crescent, Wuse 2, Abuja, Nigeria",
  "22 Idris Ibrahim Crescent, Garki, Abuja, Nigeria",
  "5 Constitution Avenue, Central Business District, Abuja, Nigeria",
  "11 Mike Akhigbe Way, Jabi, Abuja, Nigeria",
  // Port Harcourt
  "8 Aba Road, Port Harcourt, Rivers State, Nigeria",
  "17 GRA Phase 2, Port Harcourt, Rivers State, Nigeria",
  "3 Rumuola Road, Port Harcourt, Rivers State, Nigeria",
  // Kano
  "14 Bello Road, Kano Municipal, Kano, Nigeria",
  "5 Ibrahim Taiwo Road, Kano, Nigeria",
  // Ibadan
  "12 Ring Road, Ibadan, Oyo State, Nigeria",
  "7 Bodija Market Road, Ibadan, Oyo State, Nigeria",
  "20 Agodi GRA, Ibadan, Oyo State, Nigeria",
  // Enugu
  "9 Garden Avenue, GRA Enugu, Enugu State, Nigeria",
  "15 Ogui Road, Enugu, Enugu State, Nigeria",
  // Benin City
  "4 Airport Road, Benin City, Edo State, Nigeria",
  "11 Akpakpava Road, Benin City, Edo State, Nigeria",
  // Kaduna
  "6 Katsina Road, Kaduna, Kaduna State, Nigeria",
  "22 Ahmadu Bello Way, Kaduna, Kaduna State, Nigeria",
  // Other
  "18 Fola Agoro Street, Yaba, Lagos, Nigeria",
  "2 Salvation Road, Opebi, Ikeja, Lagos, Nigeria",
  "33 Obafemi Awolowo Road, Ikoyi, Lagos, Nigeria",
  "8 Karimu Kotun Street, Victoria Island, Lagos, Nigeria",
];

function getSuggestions(query: string): string[] {
  if (query.trim().length < 3) return [];
  const lower = query.toLowerCase();
  return ADDRESS_SUGGESTIONS.filter((s) => s.toLowerCase().includes(lower)).slice(0, 5);
}

interface AddressInputProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  error?: string;
}

export default function AddressInput({ value, onChangeText, placeholder, error }: AddressInputProps) {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [focused, setFocused] = useState(false);
  const inputRef = useRef<TextInput>(null);

  const suggestions = getSuggestions(value);
  const shouldShow = focused && suggestions.length > 0;

  const handleSelect = useCallback((suggestion: string) => {
    onChangeText(suggestion);
    setShowSuggestions(false);
    inputRef.current?.blur();
  }, [onChangeText]);

  const handleChange = useCallback((text: string) => {
    onChangeText(text);
    setShowSuggestions(true);
  }, [onChangeText]);

  return (
    <View style={s.wrapper}>
      <TextInput
        ref={inputRef}
        value={value}
        onChangeText={handleChange}
        placeholder={placeholder ?? "12 Lagos Road, Victoria Island, Lagos, Nigeria"}
        placeholderTextColor="#C7C7CC"
        style={[s.input, focused && s.inputFocused, !!error && s.inputError]}
        multiline
        autoCapitalize="words"
        onFocus={() => { setFocused(true); setShowSuggestions(true); }}
        onBlur={() => {
          // Delay so tap on suggestion registers first
          setTimeout(() => { setFocused(false); setShowSuggestions(false); }, 180);
        }}
      />
      <Text style={s.hint}>Start typing — tap a suggestion or enter manually</Text>
      {error ? <Text style={s.error}>{error}</Text> : null}

      {shouldShow && (
        <View style={s.dropdown}>
          <ScrollView
            keyboardShouldPersistTaps="handled"
            nestedScrollEnabled
            style={{ maxHeight: 220 }}
          >
            {suggestions.map((suggestion, i) => (
              <TouchableOpacity
                key={suggestion}
                onPress={() => handleSelect(suggestion)}
                activeOpacity={0.75}
                style={[s.suggestion, i < suggestions.length - 1 && s.suggestionBorder]}
              >
                <View style={s.pinIcon}>
                  <Text style={s.pinEmoji}>📍</Text>
                </View>
                <Text style={s.suggestionText} numberOfLines={2}>{suggestion}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              onPress={() => setShowSuggestions(false)}
              style={s.dismissRow}
            >
              <Text style={s.dismissText}>Enter address manually</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  wrapper: { position: "relative", zIndex: 10 },
  input: {
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    color: "#1C1C1E",
    minHeight: 44,
    paddingTop: Platform.OS === "ios" ? 2 : 0,
    lineHeight: 22,
  },
  inputFocused: {},
  inputError: { color: "#FF3B30" },
  hint: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    color: "#C7C7CC",
    marginTop: 3,
  },
  error: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    color: "#FF3B30",
    marginTop: 4,
  },
  dropdown: {
    position: "absolute",
    top: "100%",
    left: -16,
    right: -16,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    marginTop: 4,
    shadowColor: "#000",
    shadowOpacity: 0.14,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 8 },
    elevation: 12,
    overflow: "hidden",
    zIndex: 999,
  },
  suggestion: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 13,
    gap: 10,
  },
  suggestionBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#F2F2F7",
  },
  pinIcon: { width: 28, height: 28, borderRadius: 14, backgroundColor: "#EEF3FF", alignItems: "center", justifyContent: "center" },
  pinEmoji: { fontSize: 14 },
  suggestionText: {
    flex: 1,
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: "#1C1C1E",
    lineHeight: 18,
  },
  dismissRow: {
    paddingHorizontal: 16,
    paddingVertical: 11,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "#F2F2F7",
    alignItems: "center",
  },
  dismissText: {
    fontSize: 12,
    fontFamily: "Inter_500Medium",
    color: "#8E8E93",
  },
});
