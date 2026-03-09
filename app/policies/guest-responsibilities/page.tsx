import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { PolicyContainer, PolicySection, LastUpdated, PolicyHighlight } from "../policy-components";

export default function GuestResponsibilities() {
    return (
        <div className="min-h-screen bg-stone-50 flex flex-col">
            <Navbar />
            <main className="flex-1">
                <PolicyContainer title="Guest Responsibilities">
                    <LastUpdated date="09/03/2026" />

                    <PolicyHighlight>
                        Communew is built on mutual respect. When you join someone&apos;s creative space, you become part
                        of their community. We expect all guests to act with integrity and care.
                    </PolicyHighlight>

                    <PolicySection title="1. Respect for Space & Rules">
                        <p>
                            Every creative space has its own rhythm. Guests are expected to follow all documented
                            House Rules and any verbal instructions provided by the Host upon arrival. This includes
                            rules regarding noise, materials, equipment use, and restricted areas.
                        </p>
                    </PolicySection>

                    <PolicySection title="2. Punctuality & Communication">
                        <p>
                            Hosts put significant effort into planning and preparation. Please arrive on time.
                            If you are running late or can no longer attend, notify the Host immediately through
                            the Communew messaging system. Frequent no-shows or lack of communication
                            may result in account suspension.
                        </p>
                    </PolicySection>

                    <PolicySection title="3. Safety & Personal Conduct">
                        <p>
                            You are responsible for your own safety and conduct. Communew is a connection platform
                            and does not provide on-site supervision.
                        </p>
                        <ul className="list-disc space-y-2">
                            <li><strong>Behavior:</strong> Treat everyone with kindness. Harassment or exclusionary behavior is not tolerated.</li>
                            <li><strong>Safety:</strong> If you see a hazard or feel unsafe, remove yourself from the situation and report it to us.</li>
                            <li><strong>Substances:</strong> Follow the Host&apos;s policy regarding alcohol or tobacco. Illegal substances are strictly prohibited.</li>
                        </ul>
                    </PolicySection>

                    <PolicySection title="4. Payment Integrity">
                        <p>
                            Manual payments require trust. Ensure you follow the Host&apos;s payment instructions
                            accurately and promptly. Attempting to bypass agreed-upon fees or failing to pay for
                            an attended event is a serious violation of community trust.
                        </p>
                    </PolicySection>

                    <PolicySection title="5. Shared Experiences">
                        <p>
                            Many events are collaborative. Contributed positively to the atmosphere.
                            Clean up after yourself and respect the creative work of others sharing the space.
                        </p>
                    </PolicySection>

                </PolicyContainer>
            </main>
            <Footer />
        </div>
    );
}
