import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { PolicyContainer, PolicySection, LastUpdated, PolicyHighlight } from "../policies/policy-components";

export default function PrivacyPage() {
    return (
        <div className="min-h-screen bg-stone-50 flex flex-col">
            <Navbar />
            <main className="flex-1">
                <PolicyContainer title="Privacy Policy">
                    <LastUpdated date="09/03/2026" />

                    <PolicyHighlight>
                        Your privacy is paramount. This document explains how Communew collects, uses, and safeguards
                        the personal information you provide when using our creative community platform.
                    </PolicyHighlight>

                    <PolicySection title="1. Information We Collect">
                        <p>
                            We collect information that identifies, relates to, or could reasonably be linked with you
                            (&quot;Personal Information&quot;):
                        </p>
                        <ul className="list-disc space-y-2">
                            <li><strong>Account Data:</strong> Email address, password (encrypted), and account creation date.</li>
                            <li><strong>Profile Information:</strong> Full name, bio, profile photo (avatar), and social media links.</li>
                            <li><strong>Activity Data:</strong> Events you create, studios you list, and booking requests you send or receive.</li>
                            <li><strong>Communication:</strong> In-app messages exchanged between hosts and guests.</li>
                        </ul>
                    </PolicySection>

                    <PolicySection title="2. How We Use Your Data">
                        <p>We use your information to provide and improve the Communew experience, specifically for:</p>
                        <ul className="list-disc space-y-2">
                            <li>Facilitating bookings and communications between members.</li>
                            <li>Displaying your public profile to other community members.</li>
                            <li>Verifying host identity to maintain a safe environment.</li>
                            <li>Sending essential service notifications and platform updates.</li>
                        </ul>
                    </PolicySection>

                    <PolicySection title="3. Data Storage & Security">
                        <p>
                            Communew utilizes industry-standard cloud infrastructure provided by Supabase and Amazon Web Services (AWS).
                            Your data is stored in secure, encrypted databases with strict Row-Level Security (RLS) policies
                            ensuring only you (and authorized recipients, like a host you message) can access your private data.
                        </p>
                        <p>
                            While we implement robust technical safeguards, no method of transmission or electronic storage
                            is 100% secure. We cannot guarantee absolute security but commit to rapid notification in the
                            event of a data breach.
                        </p>
                    </PolicySection>

                    <PolicySection title="4. Third-Party Services">
                        <p>We share minimal data with service providers to enable platform functionality:</p>
                        <ul className="list-disc space-y-2">
                            <li><strong>Mapbox:</strong> Used to geocode addresses into coordinates and display event maps. No personal identities are shared with Mapbox.</li>
                            <li><strong>Supabase Auth:</strong> Used for secure authentication and session management.</li>
                        </ul>
                    </PolicySection>

                    <PolicySection title="5. Your Rights (GDPR & Beyond)">
                        <p>Depending on your location, you may have the following rights regarding your personal data:</p>
                        <ul className="list-disc space-y-2">
                            <li><strong>Access & Portability:</strong> Request a copy of the data we hold about you.</li>
                            <li><strong>Correction:</strong> Update inaccurate or incomplete profile information.</li>
                            <li><strong>Deletion:</strong> Request the deletion of your account and associated personal data.</li>
                            <li><strong>Objection:</strong> Object to how we process your data for specific purposes.</li>
                        </ul>
                    </PolicySection>

                    <PolicySection title="6. Cookies & Local Storage">
                        <p>
                            We use essential cookies and local storage to keep you logged in and remember your preferences.
                            We do not use tracking cookies for third-party advertising.
                        </p>
                    </PolicySection>

                    <PolicySection title="7. Contact Us">
                        <p>
                            If you have questions about this policy or our privacy practices, please contact the
                            Communew team through our official community channels.
                        </p>
                    </PolicySection>

                </PolicyContainer>
            </main>
            <Footer />
        </div>
    );
}
