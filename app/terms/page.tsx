import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { PolicyContainer, PolicySection, LastUpdated, PolicyHighlight } from "../policies/policy-components";

export default function TermsPage() {
    return (
        <div className="min-h-screen bg-stone-50 flex flex-col">
            <Navbar />
            <main className="flex-1">
                <PolicyContainer title="Terms of Service">
                    <LastUpdated date="09/03/2026" />

                    <PolicyHighlight>
                        Communew is a community-driven platform for connecting people through shared creative hobbies.
                        By using the platform, you acknowledge that Communew is an information service provider and
                        not a party to any transactions, agreements, or events organized through the site.
                    </PolicyHighlight>

                    <PolicySection title="1. Acceptance of Agreement">
                        <p>
                            These Terms of Service constitute a legally binding agreement between you and Communew regarding your
                            access to and use of our website and services. By creating an account or browsing the platform,
                            you agree to be bound by these terms.
                        </p>
                    </PolicySection>

                    <PolicySection title="2. Platform Role & Manual Payments">
                        <p>
                            Communew provides a venue for Hosts to list studios and events and for Guests to discover them.
                            <strong> We do not process payments directly.</strong> All financial transactions occur between
                            the Host and the Guest outside of the platform (e.g., via Cash, PayPal, or Bank Transfer).
                        </p>
                        <p>
                            Communew is not responsible for the non-payment of fees, failure to provide refunds, or any
                            financial disputes arising between users.
                        </p>
                    </PolicySection>

                    <PolicySection title="3. User Eligibility & Conduct">
                        <p>
                            You must be at least 18 years old to create an account. You agree to provide accurate, current,
                            and complete information during the registration process.
                        </p>
                        <p>
                            Users are strictly prohibited from:
                        </p>
                        <ul className="list-disc space-y-2">
                            <li>Posting fraudulent, misleading, or offensive content.</li>
                            <li>Harassing or discriminating against other community members.</li>
                            <li>Engaging in illegal activities or violating local ordinances during events.</li>
                            <li>Attempting to bypass platform security or scraping data.</li>
                        </ul>
                    </PolicySection>

                    <PolicySection title="4. Host Responsibilities">
                        <p>
                            Hosts are solely responsible for their listings and the safety of their venues. This includes:
                        </p>
                        <ul className="list-disc space-y-2">
                            <li>Ensuring all necessary permits and licenses are in place.</li>
                            <li>Maintaining a safe and accessible environment for guests.</li>
                            <li>Clearly communicating payment instructions and cancellation policies.</li>
                        </ul>
                    </PolicySection>

                    <PolicySection title="5. Limitation of Liability">
                        <p className="font-bold uppercase text-stone-900">
                            COMMUNEW IS NOT LIABLE FOR ANY PERSONAL INJURY, PROPERTY DAMAGE, OR FINANCIAL LOSS SUSTAINED
                            DURING OR AS A RESULT OF AN EVENT DISCOVERED THROUGH OUR PLATFORM.
                        </p>
                        <p>
                            We do not conduct background checks on users or inspect physical venues. You interact with
                            others and attend events at your own risk. To the maximum extent permitted by law,
                            Communew disclaims all warranties, express or implied.
                        </p>
                    </PolicySection>

                    <PolicySection title="6. Termination of Access">
                        <p>
                            We reserve the right to suspend or terminate any account that violates our Community Guidelines,
                            receives multiple valid reports, or poses a risk to the community.
                        </p>
                    </PolicySection>

                    <PolicySection title="7. Governing Law & Jurisdiction">
                        <p>
                            These terms are governed by the laws of Germany. Any disputes arising from these terms
                            shall be resolved in the courts of Berlin, Germany.
                        </p>
                    </PolicySection>

                </PolicyContainer>
            </main>
            <Footer />
        </div>
    );
}
