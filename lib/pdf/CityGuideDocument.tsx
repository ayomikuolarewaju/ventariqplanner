// lib/pdf/CityGuideDocument.tsx
//
// npm install @react-pdf/renderer
//
// Fonts: download once and commit to your repo:
//   public/fonts/BebasNeue-Regular.ttf
//   public/fonts/SpaceMono-Regular.ttf
//   public/fonts/Inter-Regular.ttf
//   public/fonts/Inter-Bold.ttf

import { Document, Page, View, Text, Image, Font, StyleSheet } from "@react-pdf/renderer";
import path from "path";

Font.register({
  family: "Bebas",
  src: path.join(process.cwd(), "public/fonts/BebasNeue-Regular.ttf"),
});
Font.register({
  family: "SpaceMono",
  src: path.join(process.cwd(), "public/fonts/SpaceMono-Regular.ttf"),
});
Font.register({
  family: "Inter",
  fonts: [
    { src: path.join(process.cwd(), "public/fonts/Inter-Regular.ttf") },
    {
      src: path.join(process.cwd(), "public/fonts/Inter-Bold.ttf"),
      fontWeight: "bold",
    },
  ],
});

const NAVY = "#0D1B4B";
const NAVY_CARD = "#142050";
const CRIMSON = "#E8002D";
const GOLD = "#F5B301";
const MIST = "#9DB2FF";

const styles = StyleSheet.create({
  page: { backgroundColor: NAVY, color: "#FFFFFF", fontFamily: "Inter", padding: 0 },
  cover: { height: "100%", padding: 48, justifyContent: "space-between" },
  eyebrow: { fontFamily: "SpaceMono", fontSize: 10, letterSpacing: 3, color: MIST },
  coverTitle: { fontFamily: "Bebas", fontSize: 64, color: "#FFFFFF", marginTop: 12 },
  coverTitleAccent: { color: CRIMSON },
  coverSub: { fontSize: 12, color: MIST, marginTop: 10, maxWidth: 340 },
  routeStrip: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: "#FFFFFF33",
    borderTopStyle: "dashed",
    paddingTop: 14,
  },
  routeCode: { fontFamily: "SpaceMono", fontSize: 9, color: GOLD },
  section: { padding: 40 },
  sectionTitle: { fontFamily: "Bebas", fontSize: 28, marginBottom: 4 },
  sectionEyebrow: {
    fontFamily: "SpaceMono",
    fontSize: 9,
    letterSpacing: 2,
    color: GOLD,
    marginBottom: 6,
  },
  card: { backgroundColor: NAVY_CARD, borderRadius: 6, padding: 14, marginTop: 10 },
  cardTitle: { fontFamily: "Inter", fontWeight: "bold", fontSize: 12 },
  cardBody: { fontSize: 10, color: MIST, marginTop: 4, lineHeight: 1.4 },
  footer: {
    position: "absolute",
    bottom: 24,
    left: 40,
    right: 40,
    flexDirection: "row",
    justifyContent: "space-between",
    fontFamily: "SpaceMono",
    fontSize: 8,
    color: "#FFFFFF55",
  },
});

type Service = {
  category: string;
  name: string;
  description: string;
};

interface CityGuideProps {
  eyebrow?: string;
  cityName?: string;
  tagline?: string;
  heroImage?: string;
  services?: Service[];
};


export function CityGuideDocument({
  eyebrow,
  cityName,
  tagline,
  heroImage,
  services,
}: CityGuideProps) {
  const categories = services ? Array.from(new Set(services.map((s) => s.category))) : [];

  return (
    <Document title={`${cityName} — ComfortLifeUS Guide`}>
      {/* cover page */}
      <Page size="A4" style={styles.page}>
        {heroImage && (
          <Image
            src={heroImage}
            style={{
              position: "absolute",
              width: "100%",
              height: "60%",
              opacity: 0.35,
            }}
          />
        )}
        <View style={styles.cover}>
          <View>
            <Text style={styles.eyebrow}>{eyebrow}</Text>
            <Text style={styles.coverTitle}>{cityName ? cityName.toUpperCase() : ""}</Text>
            <Text style={[styles.coverTitle, styles.coverTitleAccent]}>
              GUIDE
            </Text>
            <Text style={styles.coverSub}>{tagline}</Text>
          </View>

          <View style={styles.routeStrip}>
            <Text style={styles.routeCode}>COMFORTLIFEUS</Text>
            <Text style={styles.routeCode}>
              ISSUED {new Date().toLocaleDateString()}
            </Text>
          </View>
        </View>
      </Page>

      {/* one section page per category */}
      {categories.map((category) => (
        <Page key={category} size="A4" style={[styles.page, styles.section]}>
          <Text style={styles.sectionEyebrow}>SECTION</Text>
          <Text style={styles.sectionTitle}>{category}</Text>

          {services?.filter((s) => s.category === category)
            .map((s) => (
              <View key={s.name} style={styles.card}>
                <Text style={styles.cardTitle}>{s.name}</Text>
                <Text style={styles.cardBody}>{s.description}</Text>
              </View>
            ))}

          <View style={styles.footer} fixed>
            <Text>{cityName} GUIDE</Text>
            <Text render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`} />
          </View>
        </Page>
      ))}
    </Document>
   
  );
}
