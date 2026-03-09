import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { PolicyContainer, PolicySection, LastUpdated, PolicyHighlight } from "../policy-components";

export default function CommunityGuidelines() {
    return (
        <div className="min-h-screen bg-stone-50 flex flex-col">
            <Navbar />
            <main className="flex-1">
                <PolicyContainer title="Community Guidelines">
                    <LastUpdated date="09/03/2026" />

                    <PolicyHighlight>
                        Communew is a place for creative growth and connection. These guidelines ensure our
                        community remains a safe, inclusive, and professional environment for everyone.
                    </PolicyHighlight>

                    <PolicySection title="1. Radical Inclusion">
                        <p>
                            We welcome individuals of all backgrounds, skill levels, and identities.
                            Discrimination, hate speech, or exclusionary behavior based on race, gender,
                            religion, orientation, or disability is strictly prohibited and will result
                            in immediate account termination.
                        </p>
                    </PolicySection>

                    <PolicySection title="2. Respect for Creative Work">
                        <p>
                            Communew is built on the vulnerability of sharing creative processes.
                            Treat the work, ideas, and spaces of others with the highest respect.
                            Constructive feedback is welcome; mockery or theft of intellectual property is not.
                        </p>
                    </PolicySection>

                    <PolicySection title="3. Authenticity & Trust">
                        <p>
                            To maintain a safe environment, we require all members to be who they say they are.
                        </p>
                        <ul className="list-disc space-y-2">
                            <li>Use your real name and an accurate profile photo.</li>
                            <li>Provide truthful descriptions of your skills, events, and venues.</li>
                            <li>Do not use the platform for deceptive marketing or spam.</li>
                        </ul>
                    </PolicySection>

                    <PolicySection title="4. Safety & Reporting">
                        <p>
                            We rely on our members to help protect the community. If you encounter a listing,
                            message, or behavior that violates these guidelines or makes you feel unsafe:
                        </p>
                        <ol className="list-decimal space-y-2">
                            <li>Use the &quot;Report&quot; feature on the event or profile page.</li>
                            <li>Provide as much detail as possible to our moderation team.</li>
                            <li>Disengage from the situation immediately.</li>
                        </ol>
                    </PolicySection>

                    <PolicySection title="5. Platform Integrity">
                        <p>
                            Do not attempt to scrape data, bypass our security systems, or use the platform
                            for purposes other than creative community building. Protect your account credentials
                            and report any suspicious activity to us.
                        </p>
                    </PolicySection>

                    <PolicySection title="6. Enforcement">
                        <p>
                            Communew reserves the right to remove content or suspend users who violate either
                            the spirit or the letter of these guidelines. Our goal is always to protect
                            the integrity of our creative community.
                        </p>
                    </PolicySection>

                </PolicyContainer>
            </main>
            <Footer />
        </div>
    );
}
