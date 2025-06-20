import Navbar from '../../../pages/Navbar'

export default function PrivacyPolicy() {
    return (
        <div className="min-h-screen bg-warm-50">
            <Navbar />
            <main className="max-w-4xl mx-auto px-4 py-8">
                <div className="bg-warm-100 rounded-2xl shadow-lg p-8 border border-warm-200">
                    <h1 className="text-3xl font-bold mb-6 text-warm-800">Privacy Policy</h1>
                    <p className="text-sm text-warm-600 mb-8">Last updated: {new Date().toLocaleDateString()}</p>
                    
                    <div className="space-y-6 text-warm-700">
                        <section>
                            <h2 className="text-xl font-semibold mb-3 text-warm-800">1. Introduction</h2>
                            <p className="mb-3">
                                Bad Therapy ("we," "our," or "us") is committed to protecting your privacy and maintaining the confidentiality of your personal information. 
                                This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our AI mental health coaching service.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold mb-3 text-warm-800">2. Information We Collect</h2>
                            
                            <h3 className="text-lg font-medium mb-2 text-warm-800">2.1 Personal Information</h3>
                            <ul className="list-disc pl-6 space-y-2 mb-4">
                                <li>Account information (email, name) provided through Auth0 authentication</li>
                                <li>Profile information you choose to provide</li>
                                <li>Chat messages and conversations with our AI coach</li>
                                <li>Journal entries and mood tracking data</li>
                                <li>Usage patterns and session information</li>
                            </ul>

                            <h3 className="text-lg font-medium mb-2 text-warm-800">2.2 Technical Information</h3>
                            <ul className="list-disc pl-6 space-y-2">
                                <li>Usage analytics and performance metrics</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold mb-3 text-warm-800">3. Data Security and Encryption</h2>
                            <div className="bg-green-50 border-l-4 border-green-400 p-4 mb-4">
                                <p className="font-semibold text-green-800 mb-2">SECURITY MEASURES:</p>
                                <p className="text-green-700">
                                    Your sensitive data, including chat messages and journal entries, are encrypted using base64 encoding and stored securely at rest. 
                                </p>
                            </div>
                            <ul className="list-disc pl-6 space-y-2">
                                <li>Data encryption at rest using base64 encoding</li>
                                <li>Secure transmission using HTTPS/TLS protocols</li>
                                <li>Regular security audits and updates</li>
                                <li>Limited access controls for authorized personnel only</li>
                                <li>Secure cloud infrastructure (Supabase)</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold mb-3 text-warm-800">4. How We Use Your Information</h2>
                            <p className="mb-3">We use your information to:</p>
                            <ul className="list-disc pl-6 space-y-2">
                                <li>Provide AI-powered mental health coaching services</li>
                                <li>Track your mood and wellness progress</li>
                                <li>Save and organize your journal entries</li>
                                <li>Authenticate and secure your account</li>
                                <li>Analyze usage patterns to improve our services</li>
                                <li>Ensure platform security and prevent abuse</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold mb-3 text-warm-800">5. Third-Party Services</h2>
                            <p className="mb-3">We integrate with the following third-party services:</p>
                            
                            <h3 className="text-lg font-medium mb-2 text-warm-800">5.1 Authentication</h3>
                            <ul className="list-disc pl-6 space-y-2 mb-4">
                                <li><strong>Auth0:</strong> Secure user authentication and identity management</li>
                            </ul>

                            <h3 className="text-lg font-medium mb-2 text-warm-800">5.2 AI Services</h3>
                            <ul className="list-disc pl-6 space-y-2 mb-4">
                                <li><strong>OpenAI:</strong> AI-powered chat responses (data processing only, not stored by OpenAI)</li>
                                <li><strong>Perplexity API:</strong> Enhanced AI capabilities for certain features</li>
                            </ul>

                            <h3 className="text-lg font-medium mb-2 text-warm-800">5.3 Infrastructure</h3>
                            <ul className="list-disc pl-6 space-y-2">
                                <li><strong>Supabase:</strong> Secure database hosting and management</li>
                                <li><strong>Render:</strong> Hosting and deployment</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold mb-3 text-warm-800">6. Data Sharing and Disclosure</h2>
                            <p className="mb-3">We do NOT sell, trade, or otherwise transfer your personal information to third parties except:</p>
                            <ul className="list-disc pl-6 space-y-2">
                                <li>With your explicit consent</li>
                                <li>To provide services through our trusted third-party partners (listed above)</li>
                                <li>When required by law or legal process</li>
                                <li>To protect our rights, property, or safety, or that of others</li>
                                <li>In connection with a business transfer or merger</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold mb-3 text-warm-800">7. Your Rights and Choices</h2>
                            <p className="mb-3">You have the right to:</p>
                            <ul className="list-disc pl-6 space-y-2">
                                <li>Access your personal data</li>
                                <li>Correct inaccurate information</li>
                                <li>Delete your account and associated data</li>
                                <li>Export your data in a portable format</li>
                                <li>Opt-out of certain data processing activities</li>
                                <li>Withdraw consent at any time</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold mb-3 text-warm-800">8. Data Retention</h2>
                            <p>
                                We retain your personal information only as long as necessary to provide our services and fulfill the purposes outlined in this policy. 
                                You may request deletion of your account and data at any time through your account settings.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold mb-3 text-warm-800">9. Cookies and Tracking</h2>
                            <p className="mb-3">We use cookies and similar technologies to:</p>
                            <ul className="list-disc pl-6 space-y-2">
                                <li>Maintain your login session</li>
                                <li>Remember your preferences</li>
                                <li>Analyze website usage and performance</li>
                                <li>Improve user experience</li>
                            </ul>
                            <p className="mt-3">You can control cookie settings through your browser preferences.</p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold mb-3 text-warm-800">10. International Data Transfers</h2>
                            <p>
                                Your information may be transferred to and maintained on servers located outside of your jurisdiction. 
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold mb-3 text-warm-800">11. Children's Privacy</h2>
                            <p>
                                Our service is not intended for children under 18 years of age. We do not knowingly collect personal information from children under 18. 
                                If you believe we have collected information from a child under 18, please contact us immediately.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold mb-3 text-warm-800">12. Changes to Privacy Policy</h2>
                            <p>
                                We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new policy on this page with an updated revision date. 
                                Your continued use of the service after changes become effective constitutes acceptance of the revised policy.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold mb-3 text-warm-800">13. Contact Us</h2>
                            <p className="mb-3">
                                If you have any questions about this Privacy Policy or our data practices, please contact us at badtherapy.dev@gmail.com.
                            </p>
                            <p>
                                For data protection inquiries or to exercise your rights, please include "Privacy Request" in your communication.
                            </p>
                        </section>

                        <div className="mt-8 p-4 bg-warm-200 rounded-lg">
                            <p className="text-sm text-warm-700">
                                <strong>Your Privacy Matters:</strong> We are committed to maintaining the highest standards of data protection and privacy. 
                                Your trust is essential to our mission of providing safe, secure AI mental health coaching.
                            </p>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}