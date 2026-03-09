import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { PolicyContainer, PolicySection, LastUpdated, PolicyHighlight } from "../policy-components";

export default function HostResponsibilities() {
    return (
        <div className="min-h-screen bg-stone-50 flex flex-col">
            <Navbar />
            <main className="flex-1">
                <PolicyContainer title="Host Responsibilities">
                    <LastUpdated date="09/03/2026" />

                    <PolicyHighlight>
                        As a Host on Communew, you are the foundation of our community. You are responsible for
                        creating safe, welcoming, and accurately described experiences for your guests.
                    </PolicyHighlight>

                    <PolicySection title="1. Accurate & Honest Listings">
                        <p>
                            Hosts must provide a clear, truthful, and up-to-date description of their event or studio.
                            This includes pricing, capacity, available materials, and precisely what guests should expect.
                            Misleading descriptions are considered a violation of our Community Guidelines.
                        </p>
                    </PolicySection>

                    <PolicySection title="2. Safety & Legal Compliance">
                        <p>
                            You are solely responsible for ensuring that your venue (whether a home, studio, or public space)
                            meets all local safety regulations, building codes, and insurance requirements.
                        </p>
                        <ul className="list-disc space-y-2">
                            <li><strong>Permits:</strong> Ensure you have the right to host events in your chosen space.</li>
                            <li><strong>Insurance:</strong> We strongly recommend hosts carry personal liability insurance.</li>
                            <li><strong>Environment:</strong> Venues must be clean, safe, and free of known hazards.</li>
                        </ul>
                    </PolicySection>

                    <PolicySection title="3. Communication & Bookings">
                        <p>
                            Responsiveness is key to a professional community. Hosts should respond to inquiries and
                            booking requests promptly. Once a booking is confirmed, any changes to the time or
                            location must be communicated to all guests immediately through the platform.
                        </p>
                    </PolicySection>

                    <PolicySection title="4. Professional Payments">
                        <p>
                            Since payments are handled manually off-platform, hosts must provide clear, secure,
                            and professional payment instructions. Do not share sensitive banking information
                            publicly; only share it with confirmed guests through the messaging system.
                        </p>
                    </PolicySection>

                    <PolicySection title="5. Cancellation & Refunds">
                        <p>
                            Hosts should establish and honor a clear cancellation policy. If you must cancel an event,
                            you are responsible for issuing any agreed-upon refunds to guests who have already paid you.
                        </p>
                    </PolicySection>

                </PolicyContainer>
            </main>
            <Footer />
        </div>
    );
}
