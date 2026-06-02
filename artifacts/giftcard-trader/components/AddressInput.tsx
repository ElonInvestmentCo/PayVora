import React, {
  useState,
  useCallback,
  useRef,
  useEffect,
  memo,
} from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Platform,
  Animated,
  Pressable,
} from "react-native";
import Svg, { Path, Circle } from "react-native-svg";

// ── Icon helpers ───────────────────────────────────────────────────────────────

function PinIcon({ size = 14, color = "#1A5AFF" }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill={color} opacity={0.15} />
      <Path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" stroke={color} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" />
      <Circle cx="12" cy="9" r="2.5" fill={color} />
    </Svg>
  );
}

function CloseIcon({ size = 14, color = "#8E8E93" }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M18 6L6 18M6 6l12 12" stroke={color} strokeWidth={2} strokeLinecap="round" />
    </Svg>
  );
}

function SearchIcon({ size = 14, color = "#8E8E93" }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
    </Svg>
  );
}

// ── Address database ───────────────────────────────────────────────────────────

interface AddressEntry {
  full: string;
  street: string;
  area: string;
  city: string;
  state: string;
  popular?: boolean;
}

const ADDRESS_DB: AddressEntry[] = [
  // ── Lagos — VI / Ikoyi ──────────────────────────────────────────────────────
  { full: "2 Kofo Abayomi Street, Victoria Island, Lagos, Nigeria",       street: "2 Kofo Abayomi Street",         area: "Victoria Island",     city: "Lagos", state: "Lagos State", popular: true },
  { full: "12 Adeola Odeku Street, Victoria Island, Lagos, Nigeria",      street: "12 Adeola Odeku Street",        area: "Victoria Island",     city: "Lagos", state: "Lagos State" },
  { full: "6 Akin Adesola Street, Victoria Island, Lagos, Nigeria",       street: "6 Akin Adesola Street",         area: "Victoria Island",     city: "Lagos", state: "Lagos State" },
  { full: "8 Karimu Kotun Street, Victoria Island, Lagos, Nigeria",       street: "8 Karimu Kotun Street",         area: "Victoria Island",     city: "Lagos", state: "Lagos State" },
  { full: "18 Awolowo Road, Ikoyi, Lagos, Nigeria",                       street: "18 Awolowo Road",               area: "Ikoyi",               city: "Lagos", state: "Lagos State", popular: true },
  { full: "33 Obafemi Awolowo Road, Ikoyi, Lagos, Nigeria",              street: "33 Obafemi Awolowo Road",       area: "Ikoyi",               city: "Lagos", state: "Lagos State" },
  { full: "5 Bourdillon Road, Ikoyi, Lagos, Nigeria",                     street: "5 Bourdillon Road",             area: "Ikoyi",               city: "Lagos", state: "Lagos State" },
  { full: "14 Gerard Road, Ikoyi, Lagos, Nigeria",                        street: "14 Gerard Road",                area: "Ikoyi",               city: "Lagos", state: "Lagos State" },
  // ── Lagos — Lekki / Ajah ────────────────────────────────────────────────────
  { full: "7 Admiralty Way, Lekki Phase 1, Lagos, Nigeria",               street: "7 Admiralty Way",               area: "Lekki Phase 1",       city: "Lagos", state: "Lagos State", popular: true },
  { full: "21 Fola Osibo Road, Lekki Phase 1, Lagos, Nigeria",            street: "21 Fola Osibo Road",            area: "Lekki Phase 1",       city: "Lagos", state: "Lagos State" },
  { full: "4 Omorinre Johnson Street, Lekki Phase 1, Lagos, Nigeria",     street: "4 Omorinre Johnson Street",     area: "Lekki Phase 1",       city: "Lagos", state: "Lagos State" },
  { full: "11 Kusenla Road, Ikate, Lekki, Lagos, Nigeria",                street: "11 Kusenla Road",               area: "Ikate, Lekki",        city: "Lagos", state: "Lagos State" },
  { full: "3 Chevron Drive, Lekki, Lagos, Nigeria",                       street: "3 Chevron Drive",               area: "Lekki",               city: "Lagos", state: "Lagos State" },
  // ── Lagos — Ikeja ───────────────────────────────────────────────────────────
  { full: "10 Allen Avenue, Ikeja, Lagos, Nigeria",                        street: "10 Allen Avenue",               area: "Ikeja",               city: "Lagos", state: "Lagos State", popular: true },
  { full: "3 Isaac John Street, GRA Ikeja, Lagos, Nigeria",               street: "3 Isaac John Street",           area: "GRA Ikeja",           city: "Lagos", state: "Lagos State" },
  { full: "9 Opebi Road, Ikeja, Lagos, Nigeria",                          street: "9 Opebi Road",                  area: "Ikeja",               city: "Lagos", state: "Lagos State" },
  { full: "2 Salvation Road, Opebi, Ikeja, Lagos, Nigeria",               street: "2 Salvation Road",              area: "Opebi, Ikeja",        city: "Lagos", state: "Lagos State" },
  { full: "30 Aba Johnson Road, Adeniyi Jones, Ikeja, Lagos, Nigeria",    street: "30 Aba Johnson Road",           area: "Adeniyi Jones",       city: "Lagos", state: "Lagos State" },
  { full: "15 Ogunnusi Road, Ojodu, Lagos, Nigeria",                       street: "15 Ogunnusi Road",              area: "Ojodu",               city: "Lagos", state: "Lagos State" },
  // ── Lagos — Surulere / Yaba / Island ────────────────────────────────────────
  { full: "23 Bode Thomas Street, Surulere, Lagos, Nigeria",              street: "23 Bode Thomas Street",         area: "Surulere",            city: "Lagos", state: "Lagos State" },
  { full: "18 Fola Agoro Street, Yaba, Lagos, Nigeria",                   street: "18 Fola Agoro Street",          area: "Yaba",                city: "Lagos", state: "Lagos State" },
  { full: "5 Broad Street, Lagos Island, Lagos, Nigeria",                 street: "5 Broad Street",                area: "Lagos Island",        city: "Lagos", state: "Lagos State" },
  { full: "42 Marina Street, Lagos Island, Lagos, Nigeria",               street: "42 Marina Street",              area: "Lagos Island",        city: "Lagos", state: "Lagos State" },
  { full: "8 Catholic Mission Street, Lagos Island, Lagos, Nigeria",      street: "8 Catholic Mission Street",     area: "Lagos Island",        city: "Lagos", state: "Lagos State" },
  // ── Abuja ───────────────────────────────────────────────────────────────────
  { full: "1 Adetokunbo Ademola Crescent, Wuse 2, Abuja, Nigeria",        street: "1 Adetokunbo Ademola Crescent", area: "Wuse 2",              city: "Abuja", state: "FCT", popular: true },
  { full: "7 Aminu Kano Crescent, Wuse 2, Abuja, Nigeria",                street: "7 Aminu Kano Crescent",         area: "Wuse 2",              city: "Abuja", state: "FCT" },
  { full: "3 Lobito Crescent, Wuse 2, Abuja, Nigeria",                    street: "3 Lobito Crescent",             area: "Wuse 2",              city: "Abuja", state: "FCT" },
  { full: "14 Gana Street, Maitama, Abuja, Nigeria",                      street: "14 Gana Street",                area: "Maitama",             city: "Abuja", state: "FCT", popular: true },
  { full: "9 Aguiyi Ironsi Street, Maitama, Abuja, Nigeria",              street: "9 Aguiyi Ironsi Street",        area: "Maitama",             city: "Abuja", state: "FCT" },
  { full: "22 Idris Ibrahim Crescent, Garki, Abuja, Nigeria",             street: "22 Idris Ibrahim Crescent",     area: "Garki",               city: "Abuja", state: "FCT" },
  { full: "5 Constitution Avenue, CBD, Abuja, Nigeria",                   street: "5 Constitution Avenue",         area: "Central Business District", city: "Abuja", state: "FCT" },
  { full: "11 Mike Akhigbe Way, Jabi, Abuja, Nigeria",                    street: "11 Mike Akhigbe Way",           area: "Jabi",                city: "Abuja", state: "FCT" },
  { full: "6 Durumi Road, Gudu, Abuja, Nigeria",                          street: "6 Durumi Road",                 area: "Gudu",                city: "Abuja", state: "FCT" },
  { full: "18 Cadastral Zone, Asokoro, Abuja, Nigeria",                   street: "18 Cadastral Zone",             area: "Asokoro",             city: "Abuja", state: "FCT" },
  // ── Port Harcourt ───────────────────────────────────────────────────────────
  { full: "8 Aba Road, Port Harcourt, Rivers State, Nigeria",             street: "8 Aba Road",                    area: "Port Harcourt",       city: "Port Harcourt", state: "Rivers State", popular: true },
  { full: "17 GRA Phase 2, Port Harcourt, Rivers State, Nigeria",         street: "17 GRA Phase 2",                area: "GRA",                 city: "Port Harcourt", state: "Rivers State" },
  { full: "3 Rumuola Road, Port Harcourt, Rivers State, Nigeria",         street: "3 Rumuola Road",                area: "Port Harcourt",       city: "Port Harcourt", state: "Rivers State" },
  { full: "25 Woji Road, GRA Phase 3, Port Harcourt, Rivers State, Nigeria", street: "25 Woji Road",              area: "GRA Phase 3",         city: "Port Harcourt", state: "Rivers State" },
  { full: "12 Peter Odili Road, Port Harcourt, Rivers State, Nigeria",    street: "12 Peter Odili Road",           area: "Port Harcourt",       city: "Port Harcourt", state: "Rivers State" },
  // ── Kano ────────────────────────────────────────────────────────────────────
  { full: "14 Bello Road, Kano Municipal, Kano, Nigeria",                 street: "14 Bello Road",                 area: "Kano Municipal",      city: "Kano", state: "Kano State" },
  { full: "5 Ibrahim Taiwo Road, Kano, Nigeria",                          street: "5 Ibrahim Taiwo Road",          area: "Kano",                city: "Kano", state: "Kano State" },
  { full: "9 Zoo Road, Kano, Nigeria",                                    street: "9 Zoo Road",                    area: "Kano",                city: "Kano", state: "Kano State" },
  { full: "22 Club Road, Nassarawa GRA, Kano, Nigeria",                   street: "22 Club Road",                  area: "Nassarawa GRA",       city: "Kano", state: "Kano State" },
  // ── Ibadan ──────────────────────────────────────────────────────────────────
  { full: "12 Ring Road, Ibadan, Oyo State, Nigeria",                     street: "12 Ring Road",                  area: "Ibadan",              city: "Ibadan", state: "Oyo State" },
  { full: "7 Bodija Market Road, Ibadan, Oyo State, Nigeria",             street: "7 Bodija Market Road",          area: "Bodija",              city: "Ibadan", state: "Oyo State" },
  { full: "20 Agodi GRA, Ibadan, Oyo State, Nigeria",                     street: "20 Agodi GRA",                  area: "Agodi GRA",           city: "Ibadan", state: "Oyo State" },
  { full: "4 Awolowo Avenue, Bodija, Ibadan, Oyo State, Nigeria",         street: "4 Awolowo Avenue",              area: "Bodija",              city: "Ibadan", state: "Oyo State" },
  // ── Enugu ───────────────────────────────────────────────────────────────────
  { full: "9 Garden Avenue, GRA Enugu, Enugu State, Nigeria",             street: "9 Garden Avenue",               area: "GRA",                 city: "Enugu", state: "Enugu State" },
  { full: "15 Ogui Road, Enugu, Enugu State, Nigeria",                    street: "15 Ogui Road",                  area: "Enugu",               city: "Enugu", state: "Enugu State" },
  { full: "3 Independence Layout, Enugu, Enugu State, Nigeria",           street: "3 Independence Layout",         area: "Independence Layout", city: "Enugu", state: "Enugu State" },
  // ── Benin City ──────────────────────────────────────────────────────────────
  { full: "4 Airport Road, Benin City, Edo State, Nigeria",               street: "4 Airport Road",                area: "Benin City",          city: "Benin City", state: "Edo State" },
  { full: "11 Akpakpava Road, Benin City, Edo State, Nigeria",            street: "11 Akpakpava Road",             area: "Benin City",          city: "Benin City", state: "Edo State" },
  { full: "6 GRA Road, Benin City, Edo State, Nigeria",                   street: "6 GRA Road",                    area: "GRA",                 city: "Benin City", state: "Edo State" },
  // ── Kaduna ──────────────────────────────────────────────────────────────────
  { full: "6 Katsina Road, Kaduna, Kaduna State, Nigeria",                street: "6 Katsina Road",                area: "Kaduna",              city: "Kaduna", state: "Kaduna State" },
  { full: "22 Ahmadu Bello Way, Kaduna, Kaduna State, Nigeria",           street: "22 Ahmadu Bello Way",           area: "Kaduna",              city: "Kaduna", state: "Kaduna State" },
  { full: "10 Ali Akilu Road, GRA Kaduna, Kaduna State, Nigeria",         street: "10 Ali Akilu Road",             area: "GRA Kaduna",          city: "Kaduna", state: "Kaduna State" },
  // ── Warri / Calabar / Owerri / Uyo / Jos ────────────────────────────────────
  { full: "7 Effurun Road, Warri, Delta State, Nigeria",                  street: "7 Effurun Road",                area: "Warri",               city: "Warri", state: "Delta State" },
  { full: "14 Okumagba Avenue, Warri, Delta State, Nigeria",              street: "14 Okumagba Avenue",            area: "Warri",               city: "Warri", state: "Delta State" },
  { full: "3 Calabar Road, Calabar, Cross River State, Nigeria",          street: "3 Calabar Road",                area: "Calabar",             city: "Calabar", state: "Cross River State" },
  { full: "9 Mary Slessor Avenue, Calabar, Cross River State, Nigeria",   street: "9 Mary Slessor Avenue",         area: "Calabar",             city: "Calabar", state: "Cross River State" },
  { full: "5 Douglas Road, Owerri, Imo State, Nigeria",                   street: "5 Douglas Road",                area: "Owerri",              city: "Owerri", state: "Imo State" },
  { full: "12 Wetheral Road, Owerri, Imo State, Nigeria",                 street: "12 Wetheral Road",              area: "Owerri",              city: "Owerri", state: "Imo State" },
  { full: "8 Abak Road, Uyo, Akwa Ibom State, Nigeria",                   street: "8 Abak Road",                   area: "Uyo",                 city: "Uyo", state: "Akwa Ibom State" },
  { full: "6 Udo Umana Street, Uyo, Akwa Ibom State, Nigeria",            street: "6 Udo Umana Street",            area: "Uyo",                 city: "Uyo", state: "Akwa Ibom State" },
  { full: "17 Yakubu Gowon Way, Jos, Plateau State, Nigeria",             street: "17 Yakubu Gowon Way",           area: "Jos",                 city: "Jos", state: "Plateau State" },
  { full: "4 Zaria Road, Jos, Plateau State, Nigeria",                    street: "4 Zaria Road",                  area: "Jos",                 city: "Jos", state: "Plateau State" },
];

const POPULAR_ENTRIES = ADDRESS_DB.filter((e) => e.popular);

// ── Smart matching ─────────────────────────────────────────────────────────────

function scoreEntry(query: string, entry: AddressEntry): number {
  const q = query.toLowerCase().trim();
  const fullLower = entry.full.toLowerCase();
  const searchable = `${entry.street} ${entry.area} ${entry.city} ${entry.state}`.toLowerCase();

  let score = 0;
  // Exact phrase bonus
  if (fullLower.includes(q)) score += 10;
  // Word-by-word scoring
  const words = q.split(/[\s,]+/).filter((w) => w.length >= 2);
  for (const word of words) {
    if (entry.city.toLowerCase().startsWith(word)) score += 4;
    else if (entry.area.toLowerCase().startsWith(word)) score += 3;
    else if (entry.street.toLowerCase().includes(word)) score += 2;
    else if (searchable.includes(word)) score += 1;
  }
  return score;
}

function getMatches(query: string): AddressEntry[] {
  const q = query.trim();
  if (q.length < 2) return [];
  return ADDRESS_DB.filter((e) => scoreEntry(q, e) > 0)
    .sort((a, b) => scoreEntry(q, b) - scoreEntry(q, a))
    .slice(0, 6);
}

// ── Highlight matching text ────────────────────────────────────────────────────

const HighlightText = memo(function HighlightText({
  text,
  query,
  style,
}: {
  text: string;
  query: string;
  style: object;
}) {
  const q = query.trim();
  if (!q || q.length < 2) return <Text style={style}>{text}</Text>;

  const lower = text.toLowerCase();
  const qLower = q.toLowerCase();
  const idx = lower.indexOf(qLower);
  if (idx === -1) return <Text style={style}>{text}</Text>;

  return (
    <Text style={style}>
      {text.slice(0, idx)}
      <Text style={[style, s.matchHighlight]}>{text.slice(idx, idx + q.length)}</Text>
      {text.slice(idx + q.length)}
    </Text>
  );
});

// ── Component ─────────────────────────────────────────────────────────────────

export interface AddressInputProps {
  value: string;
  onChangeText: (text: string) => void;
  onSelect?: (entry: AddressEntry) => void;
  placeholder?: string;
  error?: string;
}

export default function AddressInput({
  value,
  onChangeText,
  onSelect,
  placeholder,
  error,
}: AddressInputProps) {
  const inputRef = useRef<TextInput>(null);
  const [focused, setFocused] = useState(false);
  const [selected, setSelected] = useState<AddressEntry | null>(null);

  // Fade + translateY animation for dropdown
  const anim = useRef(new Animated.Value(0)).current;

  const matches = getMatches(value);
  const showingPopular = focused && value.trim().length < 2;
  const items = showingPopular ? POPULAR_ENTRIES : matches;
  const visible = focused && items.length > 0;

  useEffect(() => {
    Animated.timing(anim, {
      toValue: visible ? 1 : 0,
      duration: visible ? 180 : 120,
      useNativeDriver: true,
    }).start();
  }, [visible]);

  const handleSelect = useCallback(
    (entry: AddressEntry) => {
      onChangeText(entry.full);
      setSelected(entry);
      onSelect?.(entry);
      setTimeout(() => {
        setFocused(false);
        inputRef.current?.blur();
      }, 60);
    },
    [onChangeText, onSelect],
  );

  const handleChange = useCallback(
    (text: string) => {
      onChangeText(text);
      if (selected && text !== selected.full) setSelected(null);
    },
    [onChangeText, selected],
  );

  const handleClear = useCallback(() => {
    onChangeText("");
    setSelected(null);
    inputRef.current?.focus();
  }, [onChangeText]);

  const dropdownStyle = {
    opacity: anim,
    transform: [
      {
        translateY: anim.interpolate({
          inputRange: [0, 1],
          outputRange: [-10, 0],
        }),
      },
    ],
  };

  return (
    <View style={s.wrapper}>
      {/* Input row */}
      <View style={[s.inputRow, focused && s.inputRowFocused, !!error && s.inputRowError]}>
        <View style={s.inputIcon}>
          <SearchIcon size={16} color={focused ? "#1A5AFF" : "#C7C7CC"} />
        </View>
        <TextInput
          ref={inputRef}
          value={value}
          onChangeText={handleChange}
          placeholder={placeholder ?? "Start typing your address…"}
          placeholderTextColor="#C7C7CC"
          style={s.input}
          multiline={false}
          autoCapitalize="words"
          // Native autofill
          textContentType="streetAddressLine1"
          // Web autofill — passed through as HTML autocomplete attribute
          {...(Platform.OS === "web"
            ? ({ autoComplete: "street-address" } as object)
            : { autoComplete: "street-address" })}
          onFocus={() => setFocused(true)}
          onBlur={() => setTimeout(() => setFocused(false), 200)}
          returnKeyType="done"
          accessibilityLabel="Home address"
          accessibilityHint="Type your street address. Suggestions will appear."
        />
        {value.length > 0 && (
          <Pressable
            onPress={handleClear}
            style={s.clearBtn}
            accessibilityLabel="Clear address"
            hitSlop={8}
          >
            <CloseIcon size={14} color="#8E8E93" />
          </Pressable>
        )}
      </View>

      {/* After-selection chip */}
      {selected && !focused && (
        <View style={s.selectedChip}>
          <PinIcon size={12} color="#30D158" />
          <Text style={s.selectedChipText} numberOfLines={1}>
            {selected.area ? `${selected.area} · ` : ""}{selected.city}, {selected.state}
          </Text>
        </View>
      )}

      {/* Helper text */}
      {!error && (
        <Text style={s.hint}>
          {showingPopular && focused
            ? "Popular areas — or type your full address"
            : focused && value.length >= 2 && items.length === 0
            ? "No matches — enter your full address manually"
            : "Type street, area, or city"}
        </Text>
      )}
      {error ? <Text style={s.errorText}>{error}</Text> : null}

      {/* Dropdown */}
      {visible && (
        <Animated.View style={[s.dropdown, dropdownStyle]}>
          {showingPopular && (
            <View style={s.dropdownHeader}>
              <Text style={s.dropdownHeaderText}>Popular areas</Text>
            </View>
          )}
          <ScrollView
            keyboardShouldPersistTaps="handled"
            nestedScrollEnabled
            bounces={false}
            showsVerticalScrollIndicator={false}
            style={{ maxHeight: 280 }}
          >
            {items.map((entry, i) => (
              <TouchableOpacity
                key={entry.full}
                onPress={() => handleSelect(entry)}
                activeOpacity={0.7}
                style={[s.suggestion, i < items.length - 1 && s.suggestionBorder]}
                accessibilityRole="button"
                accessibilityLabel={entry.full}
              >
                <View style={s.suggestionPin}>
                  <PinIcon size={13} color="#1A5AFF" />
                </View>
                <View style={s.suggestionBody}>
                  <HighlightText
                    text={entry.street}
                    query={value}
                    style={s.suggestionLine1}
                  />
                  <Text style={s.suggestionLine2} numberOfLines={1}>
                    {entry.area ? `${entry.area} · ` : ""}
                    {entry.city}, {entry.state}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
          {!showingPopular && (
            <TouchableOpacity
              onPress={() => setFocused(false)}
              style={s.manualRow}
            >
              <Text style={s.manualText}>Enter address manually instead</Text>
            </TouchableOpacity>
          )}
        </Animated.View>
      )}
    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const BORDER_RADIUS = 14;

const s = StyleSheet.create({
  wrapper: { position: "relative", zIndex: 20 },

  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8F8FA",
    borderRadius: BORDER_RADIUS,
    borderWidth: 1.5,
    borderColor: "#E5E5EA",
    paddingHorizontal: 12,
    paddingVertical: Platform.OS === "ios" ? 10 : 8,
    gap: 8,
  },
  inputRowFocused: {
    borderColor: "#1A5AFF",
    backgroundColor: "#FAFBFF",
  },
  inputRowError: {
    borderColor: "#FF3B30",
    backgroundColor: "#FFF8F8",
  },
  inputIcon: { opacity: 0.9 },
  input: {
    flex: 1,
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    color: "#1C1C1E",
    padding: 0,
  },
  clearBtn: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "#E5E5EA",
    alignItems: "center",
    justifyContent: "center",
  },

  selectedChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginTop: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: "#F0FFF5",
    borderRadius: 20,
    alignSelf: "flex-start",
    borderWidth: 1,
    borderColor: "#30D15830",
  },
  selectedChipText: {
    fontSize: 12,
    fontFamily: "Inter_500Medium",
    color: "#20A845",
    maxWidth: 260,
  },

  hint: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    color: "#AEAEB2",
    marginTop: 5,
    marginLeft: 2,
  },
  errorText: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    color: "#FF3B30",
    marginTop: 5,
    marginLeft: 2,
  },

  dropdown: {
    position: "absolute",
    top: "100%",
    left: 0,
    right: 0,
    marginTop: 6,
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#E5E5EA",
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 8 },
    elevation: 16,
    overflow: "hidden",
    zIndex: 999,
  },

  dropdownHeader: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 6,
  },
  dropdownHeaderText: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
    color: "#8E8E93",
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },

  suggestion: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 12,
  },
  suggestionBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#F2F2F7",
  },
  suggestionPin: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#EEF3FF",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  suggestionBody: { flex: 1, gap: 2 },
  suggestionLine1: {
    fontSize: 14,
    fontFamily: "Inter_500Medium",
    color: "#1C1C1E",
    lineHeight: 18,
  },
  suggestionLine2: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    color: "#8E8E93",
    lineHeight: 16,
  },
  matchHighlight: {
    color: "#1A5AFF",
    fontFamily: "Inter_700Bold",
  },

  manualRow: {
    paddingHorizontal: 14,
    paddingVertical: 11,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "#F2F2F7",
    alignItems: "center",
  },
  manualText: {
    fontSize: 12,
    fontFamily: "Inter_500Medium",
    color: "#8E8E93",
  },
});
