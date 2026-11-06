import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
} from "@react-pdf/renderer";

// Register fonts (using built-in Helvetica for now)
// To use custom fonts, add TTF files to public/fonts and register them:
// Font.register({ family: 'Open Sans', src: '/fonts/OpenSans-Regular.ttf' });

// Color palette - easy to customize
const colors = {
  primary: "#1a365d", // Dark blue for headings
  secondary: "#2d3748", // Dark gray for subheadings
  text: "#4a5568", // Gray for body text
  muted: "#718096", // Light gray for secondary text
  border: "#e2e8f0", // Light border color
  background: "#f7fafc", // Light background
  accent: "#3182ce", // Blue accent
};

// Styles - centralized for easy template editing
const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 10,
    fontFamily: "Helvetica",
    color: colors.text,
    lineHeight: 1.4,
  },
  // Header section
  header: {
    marginBottom: 20,
    borderBottomWidth: 2,
    borderBottomColor: colors.primary,
    paddingBottom: 15,
  },
  name: {
    fontSize: 24,
    fontFamily: "Helvetica-Bold",
    color: colors.primary,
    marginBottom: 4,
  },
  ahpraNumber: {
    fontSize: 11,
    color: colors.accent,
    marginBottom: 8,
  },
  contactInfo: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 15,
  },
  contactItem: {
    fontSize: 9,
    color: colors.muted,
  },
  // Section styles
  section: {
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingBottom: 4,
  },
  sectionTitle: {
    fontSize: 12,
    fontFamily: "Helvetica-Bold",
    color: colors.primary,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  // Entry styles (for qualifications, work history, etc.)
  entry: {
    marginBottom: 10,
    paddingLeft: 8,
    borderLeftWidth: 2,
    borderLeftColor: colors.border,
  },
  entryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 2,
  },
  entryTitle: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    color: colors.secondary,
    flex: 1,
  },
  entryDate: {
    fontSize: 9,
    color: colors.muted,
    textAlign: "right",
  },
  entrySubtitle: {
    fontSize: 9,
    color: colors.text,
    marginBottom: 2,
  },
  entryDescription: {
    fontSize: 9,
    color: colors.muted,
    marginTop: 3,
  },
  // Badge/Tag styles
  badge: {
    fontSize: 8,
    backgroundColor: colors.background,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 3,
    color: colors.secondary,
  },
  badgeRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 4,
    marginTop: 4,
  },
  // Skills grid
  skillsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  skillItem: {
    fontSize: 9,
    backgroundColor: colors.background,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: colors.border,
  },
  // Referee card
  refereeCard: {
    backgroundColor: colors.background,
    padding: 10,
    borderRadius: 4,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  refereeName: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    color: colors.secondary,
  },
  refereeDetails: {
    fontSize: 9,
    color: colors.text,
    marginTop: 2,
  },
  refereeContact: {
    fontSize: 8,
    color: colors.muted,
    marginTop: 4,
  },
  // Declaration section
  declaration: {
    marginTop: 20,
    padding: 15,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 4,
  },
  declarationTitle: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    color: colors.primary,
    marginBottom: 8,
  },
  declarationText: {
    fontSize: 9,
    color: colors.text,
    lineHeight: 1.5,
    marginBottom: 15,
  },
  signatureSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  signatureLine: {
    width: 200,
  },
  signatureLabel: {
    fontSize: 8,
    color: colors.muted,
    marginTop: 4,
  },
  // Footer
  footer: {
    position: "absolute",
    bottom: 30,
    left: 40,
    right: 40,
    textAlign: "center",
    fontSize: 8,
    color: colors.muted,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 10,
  },
  pageNumber: {
    fontSize: 8,
    color: colors.muted,
  },
  // Two column layout for referees
  twoColumn: {
    flexDirection: "row",
    gap: 10,
  },
  column: {
    flex: 1,
  },
});

// CV Data interface matching the stored JSONB structure
interface CVData {
  personalDetails: {
    full_name: string;
    date_of_birth?: string;
    address?: string;
    city?: string;
    state?: string;
    postcode?: string;
    country?: string;
    phone?: string;
    email?: string;
    ahpra_number?: string;
    passport_number?: string;
    citizenship?: string;
  } | null;
  qualifications: Array<{
    degree_title: string;
    institution: string;
    country: string;
    year_completed?: number;
  }>;
  workHistory: Array<{
    position_title: string;
    employer_name: string;
    department?: string;
    city?: string;
    country?: string;
    start_date: string;
    end_date?: string;
    is_current: boolean;
    employment_type?: string;
    responsibilities?: string;
  }>;
  clinicalSkills: Array<{
    skill_name: string;
    category?: string;
    proficiency?: string;
  }>;
  cpdActivities: Array<{
    activity_name: string;
    provider?: string;
    date_completed: string;
    hours_credits?: number;
  }>;
  internships: Array<{
    institution: string;
    department?: string;
    position?: string;
    start_date: string;
    end_date?: string;
  }>;
  bridgingPrograms: Array<{
    program_name: string;
    facility?: string;
    date_completed?: string;
    result?: string;
    status?: string;
  }>;
  practiceGaps: Array<{
    start_date: string;
    end_date: string;
    reason: string;
    activities?: string;
  }>;
  publications: Array<{
    title: string;
    journal_conference?: string;
    date_published?: string;
    authors?: string;
  }>;
  referees: Array<{
    name: string;
    title?: string;
    position: string;
    organization: string;
    email: string;
    phone?: string;
    relationship: string;
  }>;
  generatedAt: string;
}

interface CVTemplateProps {
  cvData: CVData;
  cvName: string;
  declarationText?: string;
  signedAt?: string;
}

// Helper functions
const formatDate = (dateString: string | undefined): string => {
  if (!dateString) return "";
  return new Date(dateString).toLocaleDateString("en-AU", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const formatMonthYear = (dateString: string | undefined): string => {
  if (!dateString) return "";
  return new Date(dateString).toLocaleDateString("en-AU", {
    month: "short",
    year: "numeric",
  });
};

// Main CV Template Component
export function CVTemplate({
  cvData,
  cvName,
  declarationText,
  signedAt,
}: CVTemplateProps) {
  const { personalDetails } = cvData;

  return (
    <Document title={cvName} author={personalDetails?.full_name || "Unknown"}>
      <Page size="A4" style={styles.page}>
        {/* Header with Personal Details */}
        {personalDetails && (
          <View style={styles.header}>
            <Text style={styles.name}>{personalDetails.full_name}</Text>
            {personalDetails.ahpra_number && (
              <Text style={styles.ahpraNumber}>
                AHPRA Registration: {personalDetails.ahpra_number}
              </Text>
            )}
            <View style={styles.contactInfo}>
              {personalDetails.email && (
                <Text style={styles.contactItem}>{personalDetails.email}</Text>
              )}
              {personalDetails.phone && (
                <Text style={styles.contactItem}>{personalDetails.phone}</Text>
              )}
              {personalDetails.city && personalDetails.country && (
                <Text style={styles.contactItem}>
                  {personalDetails.city}, {personalDetails.country}
                </Text>
              )}
            </View>
          </View>
        )}

        {/* Qualifications */}
        {cvData.qualifications.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Qualifications</Text>
            </View>
            {cvData.qualifications.map((q, i) => (
              <View key={i} style={styles.entry}>
                <View style={styles.entryHeader}>
                  <Text style={styles.entryTitle}>{q.degree_title}</Text>
                  {q.year_completed && (
                    <Text style={styles.entryDate}>{q.year_completed}</Text>
                  )}
                </View>
                <Text style={styles.entrySubtitle}>
                  {q.institution}, {q.country}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Work History */}
        {cvData.workHistory.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Work History</Text>
            </View>
            {cvData.workHistory.map((w, i) => (
              <View key={i} style={styles.entry}>
                <View style={styles.entryHeader}>
                  <Text style={styles.entryTitle}>{w.position_title}</Text>
                  <Text style={styles.entryDate}>
                    {formatMonthYear(w.start_date)} -{" "}
                    {w.is_current ? "Present" : formatMonthYear(w.end_date)}
                  </Text>
                </View>
                <Text style={styles.entrySubtitle}>
                  {w.employer_name}
                  {w.department && ` - ${w.department}`}
                </Text>
                {w.city && w.country && (
                  <Text style={styles.entrySubtitle}>
                    {w.city}, {w.country}
                  </Text>
                )}
                {w.employment_type && (
                  <View style={styles.badgeRow}>
                    <Text style={styles.badge}>{w.employment_type}</Text>
                  </View>
                )}
                {w.responsibilities && (
                  <Text style={styles.entryDescription}>
                    {w.responsibilities}
                  </Text>
                )}
              </View>
            ))}
          </View>
        )}

        {/* Clinical Skills */}
        {cvData.clinicalSkills.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Clinical Skills</Text>
            </View>
            <View style={styles.skillsGrid}>
              {cvData.clinicalSkills.map((s, i) => (
                <Text key={i} style={styles.skillItem}>
                  {s.skill_name}
                  {s.proficiency && ` (${s.proficiency})`}
                </Text>
              ))}
            </View>
          </View>
        )}

        {/* CPD Activities */}
        {cvData.cpdActivities.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>
                Continuing Professional Development
              </Text>
            </View>
            {cvData.cpdActivities.map((a, i) => (
              <View key={i} style={styles.entry}>
                <View style={styles.entryHeader}>
                  <Text style={styles.entryTitle}>{a.activity_name}</Text>
                  <Text style={styles.entryDate}>
                    {formatDate(a.date_completed)}
                  </Text>
                </View>
                {a.provider && (
                  <Text style={styles.entrySubtitle}>{a.provider}</Text>
                )}
                {a.hours_credits && (
                  <Text style={styles.entryDescription}>
                    {a.hours_credits} hours/credits
                  </Text>
                )}
              </View>
            ))}
          </View>
        )}

        {/* Internships */}
        {cvData.internships.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Internships & Training</Text>
            </View>
            {cvData.internships.map((item, i) => (
              <View key={i} style={styles.entry}>
                <View style={styles.entryHeader}>
                  <Text style={styles.entryTitle}>{item.institution}</Text>
                  <Text style={styles.entryDate}>
                    {formatMonthYear(item.start_date)} -{" "}
                    {formatMonthYear(item.end_date) || "Present"}
                  </Text>
                </View>
                {(item.department || item.position) && (
                  <Text style={styles.entrySubtitle}>
                    {item.department}
                    {item.position && ` - ${item.position}`}
                  </Text>
                )}
              </View>
            ))}
          </View>
        )}

        {/* Bridging Programs */}
        {cvData.bridgingPrograms.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Bridging Programs</Text>
            </View>
            {cvData.bridgingPrograms.map((b, i) => (
              <View key={i} style={styles.entry}>
                <View style={styles.entryHeader}>
                  <Text style={styles.entryTitle}>{b.program_name}</Text>
                  {b.date_completed && (
                    <Text style={styles.entryDate}>
                      {formatDate(b.date_completed)}
                    </Text>
                  )}
                </View>
                {b.facility && (
                  <Text style={styles.entrySubtitle}>{b.facility}</Text>
                )}
                {(b.status || b.result) && (
                  <View style={styles.badgeRow}>
                    {b.status && <Text style={styles.badge}>{b.status}</Text>}
                    {b.result && <Text style={styles.badge}>{b.result}</Text>}
                  </View>
                )}
              </View>
            ))}
          </View>
        )}

        {/* Practice Gaps */}
        {cvData.practiceGaps.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Practice Gaps</Text>
            </View>
            {cvData.practiceGaps.map((g, i) => (
              <View key={i} style={styles.entry}>
                <View style={styles.entryHeader}>
                  <Text style={styles.entryTitle}>{g.reason}</Text>
                  <Text style={styles.entryDate}>
                    {formatMonthYear(g.start_date)} -{" "}
                    {formatMonthYear(g.end_date)}
                  </Text>
                </View>
                {g.activities && (
                  <Text style={styles.entryDescription}>{g.activities}</Text>
                )}
              </View>
            ))}
          </View>
        )}

        {/* Publications */}
        {cvData.publications.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Publications</Text>
            </View>
            {cvData.publications.map((p, i) => (
              <View key={i} style={styles.entry}>
                <Text style={styles.entryTitle}>{p.title}</Text>
                <Text style={styles.entrySubtitle}>
                  {p.authors && `${p.authors}. `}
                  {p.journal_conference && `${p.journal_conference}. `}
                  {p.date_published && formatDate(p.date_published)}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Referees */}
        {cvData.referees.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Referees</Text>
            </View>
            <View style={styles.twoColumn}>
              {cvData.referees.map((r, i) => (
                <View key={i} style={styles.refereeCard}>
                  <Text style={styles.refereeName}>
                    {r.title && `${r.title} `}
                    {r.name}
                  </Text>
                  <Text style={styles.refereeDetails}>{r.position}</Text>
                  <Text style={styles.refereeDetails}>{r.organization}</Text>
                  <Text style={styles.refereeDetails}>{r.relationship}</Text>
                  <Text style={styles.refereeContact}>
                    {r.email}
                    {r.phone && ` | ${r.phone}`}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Declaration */}
        {declarationText && (
          <View style={styles.declaration}>
            <Text style={styles.declarationTitle}>Declaration</Text>
            <Text style={styles.declarationText}>{declarationText}</Text>
            <View style={styles.signatureSection}>
              <View style={styles.signatureLine}>
                <Text style={styles.signatureLabel}>Signature</Text>
              </View>
              <View style={styles.signatureLine}>
                <Text style={styles.signatureLabel}>
                  Date: {signedAt ? formatDate(signedAt) : "_______________"}
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Footer */}
        <Text
          style={styles.footer}
          render={({ pageNumber, totalPages }) =>
            `Page ${pageNumber} of ${totalPages} | Generated: ${formatDate(cvData.generatedAt)}`
          }
          fixed
        />
      </Page>
    </Document>
  );
}
