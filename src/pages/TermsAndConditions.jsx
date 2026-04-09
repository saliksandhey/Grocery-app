import { useState } from 'react';
import { ArrowLeft, FileText, Calendar, Scale } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function TermsAndConditions() {
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
        <span style={{ fontSize: '16px', fontWeight: '600', color: '#111827' }}>Terms & Conditions</span>
        <div style={{ width: '32px' }} />
      </div>

      <div onScroll={(e) => setScrolled(e.target.scrollTop > 10)} style={{ maxHeight: 'calc(100vh - 56px)', overflowY: 'auto' }}>
        {/* Header Section */}
        <div style={{
          background: 'linear-gradient(135deg, #16A34A 0%, #22C55E 100%)',
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
            <Scale size={32} />
          </div>
          <h1 style={{ fontSize: '24px', fontWeight: '800', marginBottom: '8px' }}>
            Terms & Conditions
          </h1>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontSize: '13px', opacity: 0.9 }}>
            <Calendar size={14} />
            Last updated: {lastUpdated}
          </div>
        </div>

        {/* Content */}
        <div style={{ padding: '24px 16px' }}>
          <div style={{
            background: '#FEF3C7',
            border: '1px solid #FCD34D',
            borderRadius: '12px',
            padding: '16px',
            marginBottom: '24px',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '12px'
          }}>
            <FileText size={20} color='#F59E0B' style={{ flexShrink: 0, marginTop: '2px' }} />
            <div style={{ fontSize: '13px', color: '#92400E', lineHeight: 1.5 }}>
              <strong>Important:</strong> By using the Malerkotla Fresh app and services, you agree to be bound by these Terms and Conditions. Please read them carefully before using our services.
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Section 1 */}
            <section>
              <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#111827', marginBottom: '12px' }}>
                1. Acceptance of Terms
              </h2>
              <div style={{ fontSize: '14px', color: '#4B5563', lineHeight: 1.7 }}>
                <p style={{ marginBottom: '12px' }}>
                  By accessing or using the Malerkotla Fresh mobile application, website, or any of our services, you agree to be bound by these Terms and Conditions ("Terms"). If you do not agree with any part of these terms, you must not use our services.
                </p>
                <p>
                  We reserve the right to modify these Terms at any time. Changes will be effective immediately upon posting. Your continued use of the service after changes constitutes acceptance of the new Terms.
                </p>
              </div>
            </section>

            {/* Section 2 */}
            <section>
              <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#111827', marginBottom: '12px' }}>
                2. Eligibility
              </h2>
              <div style={{ fontSize: '14px', color: '#4B5563', lineHeight: 1.7 }}>
                <p style={{ marginBottom: '12px' }}>To use our services, you must:</p>
                <ul style={{ marginLeft: '20px', marginBottom: '12px' }}>
                  <li>Be at least 18 years of age</li>
                  <li>Have the legal capacity to enter into a binding agreement</li>
                  <li>Provide accurate and complete registration information</li>
                  <li>Reside in our delivery service area (Malerkotla and surrounding areas)</li>
                </ul>
                <p>
                  By creating an account, you represent and warrant that you meet all these requirements.
                </p>
              </div>
            </section>

            {/* Section 3 */}
            <section>
              <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#111827', marginBottom: '12px' }}>
                3. Account Registration
              </h2>
              <div style={{ fontSize: '14px', color: '#4B5563', lineHeight: 1.7 }}>
                <p style={{ marginBottom: '12px' }}>
                  To place orders, you must create an account. You agree to:
                </p>
                <ul style={{ marginLeft: '20px', marginBottom: '12px' }}>
                  <li>Provide true, accurate, and complete information</li>
                  <li>Keep your password secure and confidential</li>
                  <li>Notify us immediately of any unauthorized access</li>
                  <li>Accept responsibility for all activities under your account</li>
                </ul>
                <p>
                  We reserve the right to suspend or terminate accounts that violate these Terms.
                </p>
              </div>
            </section>

            {/* Section 4 */}
            <section>
              <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#111827', marginBottom: '12px' }}>
                4. Orders and Pricing
              </h2>
              <div style={{ fontSize: '14px', color: '#4B5563', lineHeight: 1.7 }}>
                <h3 style={{ fontSize: '15px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>4.1 Order Placement</h3>
                <p style={{ marginBottom: '16px' }}>
                  All orders are subject to availability and acceptance. We reserve the right to refuse or cancel any order for any reason, including but not limited to product availability, pricing errors, or suspected fraud.
                </p>

                <h3 style={{ fontSize: '15px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>4.2 Pricing</h3>
                <p style={{ marginBottom: '12px' }}>
                  All prices are displayed in Indian Rupees (₹) and are subject to change without notice. Prices shown on the app are final at the time of order placement.
                </p>

                <h3 style={{ fontSize: '15px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>4.3 Order Cancellation</h3>
                <p>
                  You may cancel your order only when it is in "Placed" status. Once the order moves to "Confirmed" or any subsequent status, cancellation is not permitted. We reserve the right to cancel orders in cases of force majeure, product unavailability, or other unforeseen circumstances.
                </p>
              </div>
            </section>

            {/* Section 5 */}
            <section>
              <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#111827', marginBottom: '12px' }}>
                5. Payment Terms
              </h2>
              <div style={{ fontSize: '14px', color: '#4B5563', lineHeight: 1.7 }}>
                <p style={{ marginBottom: '12px' }}>
                  We accept the following payment methods:
                </p>
                <ul style={{ marginLeft: '20px', marginBottom: '12px' }}>
                  <li><strong>Cash on Delivery (COD):</strong> Pay when your order is delivered</li>
                  <li><strong>UPI Payments:</strong> Google Pay, PhonePe, Paytm, and other UPI apps</li>
                </ul>
                <p style={{ marginBottom: '12px' }}>
                  <strong>Delivery Charges:</strong> Free delivery on orders above ₹299. Orders below ₹299 incur a ₹30 delivery fee.
                </p>
                <p>
                  <strong>Refunds:</strong> Refunds for cancelled or failed orders will be processed within 3-5 business days to the original payment method.
                </p>
              </div>
            </section>

            {/* Section 6 */}
            <section>
              <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#111827', marginBottom: '12px' }}>
                6. Delivery and Shipping
              </h2>
              <div style={{ fontSize: '14px', color: '#4B5563', lineHeight: 1.7 }}>
                <p style={{ marginBottom: '12px' }}>
                  <strong>Delivery Hours:</strong> 10:00 AM to 10:00 PM, seven days a week.
                </p>
                <p style={{ marginBottom: '12px' }}>
                  <strong>Delivery Time:</strong> We aim to deliver within 30-45 minutes. Actual delivery times may vary based on location, weather, and order volume.
                </p>
                <p style={{ marginBottom: '12px' }}>
                  <strong>Delivery Area:</strong> Currently limited to Malerkotla and surrounding areas.
                </p>
                <p>
                  <strong>Risk of Loss:</strong> Risk of loss passes to you upon delivery. Please inspect your order upon receipt and report any issues immediately.
                </p>
              </div>
            </section>

            {/* Section 7 */}
            <section>
              <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#111827', marginBottom: '12px' }}>
                7. Product Information
              </h2>
              <div style={{ fontSize: '14px', color: '#4B5563', lineHeight: 1.7 }}>
                <p style={{ marginBottom: '12px' }}>
                  We strive to provide accurate product descriptions, images, and pricing. However, we do not warrant that product descriptions or other content is accurate, complete, or error-free.
                </p>
                <p>
                  Product images are for illustrative purposes and may differ from actual products. We reserve the right to substitute products of equal or greater value if the ordered product is unavailable.
                </p>
              </div>
            </section>

            {/* Section 8 */}
            <section>
              <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#111827', marginBottom: '12px' }}>
                8. Returns and Refunds
              </h2>
              <div style={{ fontSize: '14px', color: '#4B5563', lineHeight: 1.7 }}>
                <p style={{ marginBottom: '12px' }}>
                  Due to the nature of grocery items, we generally do not accept returns. However:
                </p>
                <ul style={{ marginLeft: '20px', marginBottom: '12px' }}>
                  <li>Damaged or defective items may be eligible for refund or replacement</li>
                  <li>Report issues within 2 hours of delivery</li>
                  <li>Contact our support team with photos of the issue</li>
                  <li>Refunds are processed at our discretion</li>
                </ul>
                <p>
                  Perishable items cannot be returned once delivered unless they are damaged or defective.
                </p>
              </div>
            </section>

            {/* Section 9 */}
            <section>
              <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#111827', marginBottom: '12px' }}>
                9. User Conduct
              </h2>
              <div style={{ fontSize: '14px', color: '#4B5563', lineHeight: 1.7 }}>
                <p style={{ marginBottom: '12px' }}>
                  You agree not to:
                </p>
                <ul style={{ marginLeft: '20px', marginBottom: '12px' }}>
                  <li>Use the service for any illegal purpose</li>
                  <li>Provide false or misleading information</li>
                  <li>Attempt to gain unauthorized access to our systems</li>
                  <li>Interfere with or disrupt the service</li>
                  <li>Abuse delivery partners or support staff</li>
                  <li>Place fraudulent orders</li>
                </ul>
                <p>
                  Violation of these rules may result in account suspension or termination.
                </p>
              </div>
            </section>

            {/* Section 10 */}
            <section>
              <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#111827', marginBottom: '12px' }}>
                10. Limitation of Liability
              </h2>
              <div style={{ fontSize: '14px', color: '#4B5563', lineHeight: 1.7 }}>
                <p style={{ marginBottom: '12px' }}>
                  To the maximum extent permitted by law, Malerkotla Fresh shall not be liable for:
                </p>
                <ul style={{ marginLeft: '20px', marginBottom: '12px' }}>
                  <li>Indirect, incidental, or consequential damages</li>
                  <li>Loss of profits, data, or business opportunities</li>
                  <li>Delays caused by factors beyond our control</li>
                  <li>Product quality issues from third-party suppliers</li>
                </ul>
                <p>
                  Our total liability shall not exceed the amount you paid for the specific order giving rise to the claim.
                </p>
              </div>
            </section>

            {/* Section 11 */}
            <section>
              <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#111827', marginBottom: '12px' }}>
                11. Intellectual Property
              </h2>
              <div style={{ fontSize: '14px', color: '#4B5563', lineHeight: 1.7 }}>
                <p>
                  All content, trademarks, logos, and intellectual property displayed on the app are owned by or licensed to Malerkotla Fresh. You may not use, reproduce, or distribute any content without our prior written consent.
                </p>
              </div>
            </section>

            {/* Section 12 */}
            <section>
              <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#111827', marginBottom: '12px' }}>
                12. Governing Law
              </h2>
              <div style={{ fontSize: '14px', color: '#4B5563', lineHeight: 1.7 }}>
                <p>
                  These Terms shall be governed by and construed in accordance with the laws of India. Any disputes arising from these Terms shall be subject to the exclusive jurisdiction of the courts in Punjab, India.
                </p>
              </div>
            </section>

            {/* Section 13 */}
            <section>
              <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#111827', marginBottom: '12px' }}>
                13. Contact Information
              </h2>
              <div style={{ fontSize: '14px', color: '#4B5563', lineHeight: 1.7 }}>
                <p style={{ marginBottom: '12px' }}>
                  For questions about these Terms, please contact us:
                </p>
                <div style={{
                  background: '#F9FAFB',
                  padding: '16px',
                  borderRadius: '12px',
                  border: '1px solid #E5E7EB'
                }}>
                  <p style={{ marginBottom: '8px', fontSize: '14px' }}><strong>Email:</strong> support@malerkotlafresh.com</p>
                  <p style={{ marginBottom: '8px', fontSize: '14px' }}><strong>Phone:</strong> +91 98765 43210</p>
                  <p style={{ fontSize: '14px' }}><strong>Address:</strong> Main Market, Malerkotla, Punjab, India</p>
                </div>
              </div>
            </section>
          </div>

          {/* Acceptance Note */}
          <div style={{
            marginTop: '32px',
            padding: '20px',
            background: '#F0FDF4',
            border: '1px solid #DCFCE7',
            borderRadius: '12px',
            textAlign: 'center'
          }}>
            <p style={{ fontSize: '13px', color: '#166534', lineHeight: 1.6 }}>
              By continuing to use our services, you acknowledge that you have read, understood, and agree to be bound by these Terms and Conditions.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
