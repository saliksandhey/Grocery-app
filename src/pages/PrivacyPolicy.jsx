import { useState } from 'react';
import { ArrowLeft, Shield, Eye, Lock, Database, UserCheck, Mail, Calendar, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function PrivacyPolicy() {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);

  const lastUpdated = 'April 8, 2026';

  return (
    <div style={{ background: '#F9FAFB', minHeight: '100vh', paddingBottom: '24px' }}>
      <style>{`
        .press-scale { transition: transform 0.15s ease; cursor: pointer; }
        .press-scale:active { transform: scale(0.97); }
      `}</style>

      {/* Header */}
      <div style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        background: '#fff',
        height: '56px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 16px',
        boxShadow: scrolled ? '0 4px 12px rgba(0,0,0,0.04)' : 'none',
        borderBottom: scrolled ? 'none' : '1px solid #E5E7EB'
      }}>
        <div className="press-scale" onClick={() => navigate(-1)} style={{ width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <ArrowLeft size={22} color="#111827" />
        </div>
        <span style={{ fontSize: '16px', fontWeight: '600', color: '#111827' }}>Privacy Policy</span>
        <div style={{ width: '32px' }} />
      </div>

      <div onScroll={(e) => setScrolled(e.target.scrollTop > 10)} style={{ maxHeight: 'calc(100vh - 56px)', overflowY: 'auto' }}>
        {/* Header Section */}
        <div style={{
          background: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)',
          padding: '32px 24px',
          color: '#fff',
          textAlign: 'center'
        }}>
          <div style={{
            width: '64px',
            height: '64px',
            margin: '0 auto 16px',
            borderRadius: '50%',
            background: 'rgba(255, 255, 255, 0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Shield size={32} />
          </div>
          <h1 style={{ fontSize: '24px', fontWeight: '800', marginBottom: '8px' }}>
            Privacy Policy
          </h1>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontSize: '13px', opacity: 0.9 }}>
            <Calendar size={14} />
            Last updated: {lastUpdated}
          </div>
        </div>

        {/* Content */}
        <div style={{ padding: '24px 16px' }}>
          {/* Important Notice */}
          <div style={{
            background: '#DBEAFE',
            border: '1px solid #93C5FD',
            borderRadius: '12px',
            padding: '16px',
            marginBottom: '24px',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '12px'
          }}>
            <Eye size={20} color='#2563EB' style={{ flexShrink: 0, marginTop: '2px' }} />
            <div style={{ fontSize: '13px', color: '#1E40AF', lineHeight: 1.5 }}>
              <strong>Your Privacy Matters:</strong> We are committed to protecting your personal information and being transparent about how we collect, use, and share your data. This policy explains our practices in detail.
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Section 1 */}
            <section>
              <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#111827', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Shield size={20} color="#16A34A" />
                1. Introduction
              </h2>
              <div style={{ fontSize: '14px', color: '#4B5563', lineHeight: 1.7 }}>
                <p style={{ marginBottom: '12px' }}>
                  Malerkotla Fresh ("we", "our", or "us") operates the Malerkotla Fresh mobile application. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our service.
                </p>
                <p>
                  By using our app, you consent to the practices described in this policy. If you do not agree, please do not use our services.
                </p>
              </div>
            </section>

            {/* Section 2 */}
            <section>
              <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#111827', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Database size={20} color="#16A34A" />
                2. Information We Collect
              </h2>
              
              <h3 style={{ fontSize: '15px', fontWeight: '600', color: '#374151', marginBottom: '8px', marginTop: '16px' }}>2.1 Personal Information</h3>
              <p style={{ fontSize: '14px', color: '#4B5563', lineHeight: 1.7, marginBottom: '12px' }}>
                We collect information that you provide directly:
              </p>
              <ul style={{ marginLeft: '20px', marginBottom: '16px', fontSize: '14px', color: '#4B5563', lineHeight: 1.8 }}>
                <li>Name and contact information (phone number, email)</li>
                <li>Delivery addresses and location data</li>
                <li>Payment information (processed securely through payment partners)</li>
                <li>Account credentials (encrypted password)</li>
                <li>Order history and preferences</li>
                <li>Communication with our support team</li>
              </ul>

              <h3 style={{ fontSize: '15px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>2.2 Automatically Collected Information</h3>
              <p style={{ fontSize: '14px', color: '#4B5563', lineHeight: 1.7, marginBottom: '12px' }}>
                When you use our app, we automatically collect:
              </p>
              <ul style={{ marginLeft: '20px', marginBottom: '16px', fontSize: '14px', color: '#4B5563', lineHeight: 1.8 }}>
                <li>Device information (phone model, operating system)</li>
                <li>App usage data and browsing patterns</li>
                <li>IP address and approximate location</li>
                <li>Order timestamps and transaction history</li>
              </ul>
            </section>

            {/* Section 3 */}
            <section>
              <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#111827', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Lock size={20} color="#16A34A" />
                3. How We Use Your Information
              </h2>
              <div style={{ fontSize: '14px', color: '#4B5563', lineHeight: 1.7 }}>
                <p style={{ marginBottom: '12px' }}>We use your information to:</p>
                <ul style={{ marginLeft: '20px', marginBottom: '12px' }}>
                  <li>Process and deliver your orders</li>
                  <li>Communicate order updates and delivery status</li>
                  <li>Provide customer support</li>
                  <li>Improve our services and user experience</li>
                  <li>Send promotional offers (with your consent)</li>
                  <li>Prevent fraud and ensure security</li>
                  <li>Comply with legal obligations</li>
                  <li>Analyze app performance and usage patterns</li>
                </ul>
              </div>
            </section>

            {/* Section 4 */}
            <section>
              <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#111827', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <UserCheck size={20} color="#16A34A" />
                4. Information Sharing
              </h2>
              <div style={{ fontSize: '14px', color: '#4B5563', lineHeight: 1.7 }}>
                <p style={{ marginBottom: '12px' }}>
                  <strong>We do NOT sell your personal information.</strong> We may share your data only in these circumstances:
                </p>
                
                <h4 style={{ fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px', marginTop: '12px' }}>4.1 Service Providers</h4>
                <p style={{ marginBottom: '12px' }}>
                  We share necessary information with trusted partners who help us operate:
                </p>
                <ul style={{ marginLeft: '20px', marginBottom: '16px' }}>
                  <li><strong>Delivery Partners:</strong> Name, phone number, and delivery address</li>
                  <li><strong>Payment Processors:</strong> Transaction details (we don't store payment info)</li>
                  <li><strong>Cloud Services:</strong> Encrypted data storage (Supabase)</li>
                </ul>

                <h4 style={{ fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>4.2 Legal Requirements</h4>
                <p style={{ marginBottom: '12px' }}>
                  We may disclose information if required by law or to:
                </p>
                <ul style={{ marginLeft: '20px', marginBottom: '12px' }}>
                  <li>Comply with legal obligations</li>
                  <li>Protect our rights and property</li>
                  <li>Prevent fraud or security issues</li>
                </ul>
              </div>
            </section>

            {/* Section 5 */}
            <section>
              <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#111827', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Lock size={20} color="#16A34A" />
                5. Data Security
              </h2>
              <div style={{ fontSize: '14px', color: '#4B5563', lineHeight: 1.7 }}>
                <p style={{ marginBottom: '12px' }}>
                  We implement industry-standard security measures:
                </p>
                <ul style={{ marginLeft: '20px', marginBottom: '12px' }}>
                  <li><strong>Encryption:</strong> All data is encrypted in transit (HTTPS) and at rest</li>
                  <li><strong>Access Controls:</strong> Strict access limitations for staff</li>
                  <li><strong>Secure Storage:</strong> Data stored on secure cloud servers (Supabase)</li>
                  <li><strong>Regular Audits:</strong> Periodic security reviews and updates</li>
                  <li><strong>Password Protection:</strong> Passwords are encrypted and never stored in plain text</li>
                </ul>
                <p style={{ fontSize: '13px', color: '#6B7280', fontStyle: 'italic' }}>
                  While we strive to protect your information, no method of transmission over the Internet is 100% secure.
                </p>
              </div>
            </section>

            {/* Section 6 */}
            <section>
              <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#111827', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <UserCheck size={20} color="#16A34A" />
                6. Your Rights
              </h2>
              <div style={{ fontSize: '14px', color: '#4B5563', lineHeight: 1.7 }}>
                <p style={{ marginBottom: '12px' }}>You have the right to:</p>
                <ul style={{ marginLeft: '20px', marginBottom: '12px' }}>
                  <li><strong>Access:</strong> Request a copy of your personal data</li>
                  <li><strong>Correction:</strong> Update or correct inaccurate information</li>
                  <li><strong>Deletion:</strong> Request deletion of your account and data</li>
                  <li><strong>Opt-out:</strong> Unsubscribe from marketing communications</li>
                  <li><strong>Portability:</strong> Receive your data in a portable format</li>
                </ul>
                <p>
                  To exercise these rights, contact us at <strong>support@malerkotlafresh.com</strong>
                </p>
              </div>
            </section>

            {/* Section 7 */}
            <section>
              <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#111827', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Database size={20} color="#16A34A" />
                7. Data Retention
              </h2>
              <div style={{ fontSize: '14px', color: '#4B5563', lineHeight: 1.7 }}>
                <p style={{ marginBottom: '12px' }}>
                  We retain your information for as long as:
                </p>
                <ul style={{ marginLeft: '20px', marginBottom: '12px' }}>
                  <li>Your account is active</li>
                  <li>Needed to provide our services</li>
                  <li>Required by law (typically 3-7 years for transaction records)</li>
                </ul>
                <p>
                  After deletion, some data may remain in backup systems for up to 90 days.
                </p>
              </div>
            </section>

            {/* Section 8 */}
            <section>
              <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#111827', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <AlertTriangle size={20} color="#16A34A" />
                8. Children's Privacy
              </h2>
              <div style={{ fontSize: '14px', color: '#4B5563', lineHeight: 1.7 }}>
                <p>
                  Our services are not intended for children under 18. We do not knowingly collect personal information from children. If we discover we have inadvertently collected data from a minor, we will delete it immediately.
                </p>
              </div>
            </section>

            {/* Section 9 */}
            <section>
              <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#111827', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Database size={20} color="#16A34A" />
                9. Cookies and Tracking
              </h2>
              <div style={{ fontSize: '14px', color: '#4B5563', lineHeight: 1.7 }}>
                <p style={{ marginBottom: '12px' }}>
                  Our app uses local storage and session management to:
                </p>
                <ul style={{ marginLeft: '20px', marginBottom: '12px' }}>
                  <li>Maintain your login session</li>
                  <li>Remember your cart items</li>
                  <li>Store your preferences</li>
                  <li>Improve app performance</li>
                </ul>
                <p>
                  You can clear this data through your device settings, but it may affect app functionality.
                </p>
              </div>
            </section>

            {/* Section 10 */}
            <section>
              <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#111827', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Shield size={20} color="#16A34A" />
                10. Changes to This Policy
              </h2>
              <div style={{ fontSize: '14px', color: '#4B5563', lineHeight: 1.7 }}>
                <p style={{ marginBottom: '12px' }}>
                  We may update this Privacy Policy from time to time. We will notify you of significant changes by:
                </p>
                <ul style={{ marginLeft: '20px', marginBottom: '12px' }}>
                  <li>Posting the new policy in the app</li>
                  <li>Updating the "Last Updated" date</li>
                  <li>Sending an email notification (for major changes)</li>
                </ul>
                <p>
                  Continued use of our services after changes constitutes acceptance of the updated policy.
                </p>
              </div>
            </section>

            {/* Section 11 */}
            <section>
              <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#111827', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Mail size={20} color="#16A34A" />
                11. Contact Us
              </h2>
              <div style={{ fontSize: '14px', color: '#4B5563', lineHeight: 1.7 }}>
                <p style={{ marginBottom: '12px' }}>
                  If you have questions or concerns about this Privacy Policy, please contact us:
                </p>
                <div style={{
                  background: '#F9FAFB',
                  padding: '16px',
                  borderRadius: '12px',
                  border: '1px solid #E5E7EB'
                }}>
                  <p style={{ marginBottom: '8px', fontSize: '14px' }}><strong>Email:</strong> privacy@malerkotlafresh.com</p>
                  <p style={{ marginBottom: '8px', fontSize: '14px' }}><strong>Phone:</strong> +91 98765 43210</p>
                  <p style={{ marginBottom: '8px', fontSize: '14px' }}><strong>Address:</strong> Main Market, Malerkotla, Punjab, India</p>
                  <p style={{ fontSize: '13px', color: '#6B7280', marginTop: '12px' }}>We respond to all privacy inquiries within 48 hours.</p>
                </div>
              </div>
            </section>
          </div>

          {/* Consent Notice */}
          <div style={{
            marginTop: '32px',
            padding: '20px',
            background: '#EFF6FF',
            border: '1px solid #BFDBFE',
            borderRadius: '12px',
            textAlign: 'center'
          }}>
            <p style={{ fontSize: '13px', color: '#1E40AF', lineHeight: 1.6 }}>
              By using Malerkotla Fresh, you acknowledge that you have read and understood this Privacy Policy and consent to our data practices.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
