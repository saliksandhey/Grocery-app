import { useState } from 'react';
import { ArrowLeft, ChevronDown, Mail, Phone, MapPin, Clock, HelpCircle, Package, Truck, CreditCard, Shield, MessageCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function HelpSupport() {
  const navigate = useNavigate();
  const [expandedFaq, setExpandedFaq] = useState(null);
  const [scrolled, setScrolled] = useState(false);

  const handleScroll = (e) => {
    setScrolled(e.target.scrollTop > 10);
  };

  const faqs = [
    {
      category: 'Orders & Delivery',
      icon: Package,
      questions: [
        {
          q: 'How do I place an order?',
          a: 'Browse products, add items to your cart, proceed to checkout, select your delivery address and payment method, then click "Place Order". You\'ll receive a confirmation once your order is placed successfully.'
        },
        {
          q: 'What is the minimum order value?',
          a: 'There is no minimum order value. However, orders above ₹299 qualify for free delivery. Orders below ₹299 have a delivery charge of ₹30.'
        },
        {
          q: 'How long does delivery take?',
          a: 'We typically deliver within 30-45 minutes from the time of order confirmation. Delivery time may vary based on your location and order volume.'
        },
        {
          q: 'Can I track my order?',
          a: 'Yes! Once your order is placed, you can track it in real-time from the Home page or Orders section. You\'ll see live updates as your order moves through different stages: Placed → Confirmed → Packed → Assigned → Out for Delivery → Delivered.'
        },
        {
          q: 'Can I cancel or modify my order?',
          a: 'You can cancel your order only when it\'s in "Placed" status. Once the order moves to "Confirmed" or beyond, it cannot be cancelled. Please contact our support team immediately if you need to make changes.'
        }
      ]
    },
    {
      category: 'Payment',
      icon: CreditCard,
      questions: [
        {
          q: 'What payment methods do you accept?',
          a: 'We currently accept Cash on Delivery (COD) and UPI payments (Google Pay, PhonePe, Paytm, etc.). More payment options will be available soon.'
        },
        {
          q: 'Is Cash on Delivery available?',
          a: 'Yes, Cash on Delivery is available for all orders. Please keep exact change ready for a smooth delivery experience.'
        },
        {
          q: 'When will I be charged?',
          a: 'For COD orders, you pay when the order is delivered. For UPI payments, you\'ll be charged at the time of order placement.'
        },
        {
          q: 'Can I get a refund?',
          a: 'If you\'ve paid via UPI and your order is cancelled or there\'s an issue, refunds are processed within 3-5 business days to the original payment method.'
        }
      ]
    },
    {
      category: 'Delivery',
      icon: Truck,
      questions: [
        {
          q: 'What are your delivery hours?',
          a: 'We deliver from 10:00 AM to 10:00 PM, seven days a week. Orders can only be placed when the store is open.'
        },
        {
          q: 'Do you deliver to my area?',
          a: 'We currently deliver within Malerkotla and surrounding areas. If you\'re unsure, try entering your address during checkout.'
        },
        {
          q: 'What if I\'m not available at delivery time?',
          a: 'Our delivery partner will call you before delivery. If you\'re unavailable, they may leave the order at your doorstep or reschedule based on your preference.'
        },
        {
          q: 'Is there a delivery charge?',
          a: 'Delivery is FREE for orders above ₹299. For orders below ₹299, a delivery charge of ₹30 applies.'
        }
      ]
    },
    {
      category: 'Account & Security',
      icon: Shield,
      questions: [
        {
          q: 'How do I create an account?',
          a: 'Click on "Sign Up" on the login page, enter your name, phone number, and create a password. You\'ll be logged in automatically after signup.'
        },
        {
          q: 'I forgot my password. What should I do?',
          a: 'Click on "Forgot Password" on the login page. Enter your registered phone number to reset your password.'
        },
        {
          q: 'Is my data safe?',
          a: 'Yes, we take data security seriously. Your personal information is encrypted and stored securely. We never share your data with third parties without consent.'
        },
        {
          q: 'How do I update my profile?',
          a: 'Go to Profile section from the bottom navigation. You can update your name, phone number, and manage your saved addresses there.'
        }
      ]
    }
  ];

  const supportChannels = [
    {
      icon: Phone,
      title: 'Phone Support',
      description: 'Call us for immediate assistance',
      contact: '+91 98765 43210',
      availability: 'Available 10 AM - 10 PM',
      color: '#16A34A',
      bgColor: '#DCFCE7',
      action: 'tel:+919876543210'
    },
    {
      icon: MessageCircle,
      title: 'WhatsApp Support',
      description: 'Chat with us on WhatsApp',
      contact: '+91 98765 43210',
      availability: 'Quick response guaranteed',
      color: '#25D366',
      bgColor: '#DCFCE7',
      action: 'https://wa.me/919876543210'
    },
    {
      icon: Mail,
      title: 'Email Support',
      description: 'Send us your queries',
      contact: 'support@malerkotlafresh.com',
      availability: 'Response within 24 hours',
      color: '#3B82F6',
      bgColor: '#DBEAFE',
      action: 'mailto:support@malerkotlafresh.com'
    },
    {
      icon: MapPin,
      title: 'Visit Us',
      description: 'Come to our store',
      contact: 'Main Market, Malerkotla, Punjab',
      availability: 'Open 10 AM - 10 PM',
      color: '#F59E0B',
      bgColor: '#FEF3C7',
      action: 'https://maps.google.com/?q=Malerkotla+Punjab'
    }
  ];

  return (
    <div style={{ background: '#F9FAFB', minHeight: '100vh', paddingBottom: '24px' }}>
      <style>{`
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-8px); }
          to { opacity: 1; transform: translateY(0); }
        }
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
        <span style={{ fontSize: '16px', fontWeight: '600', color: '#111827' }}>Help & Support</span>
        <div style={{ width: '32px' }} />
      </div>

      <div onScroll={handleScroll} style={{ maxHeight: 'calc(100vh - 56px)', overflowY: 'auto' }}>
        {/* Quick Support Cards */}
        <div style={{ padding: '16px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#111827', marginBottom: '12px' }}>
            Contact Us
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            {supportChannels.map((channel, idx) => {
              const Icon = channel.icon;
              return (
                <a
                  key={idx}
                  href={channel.action}
                  target={channel.action.startsWith('http') ? '_blank' : undefined}
                  rel={channel.action.startsWith('http') ? 'noopener noreferrer' : undefined}
                  className="press-scale"
                  style={{
                    background: '#fff',
                    borderRadius: '12px',
                    padding: '16px',
                    textDecoration: 'none',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                    border: '1px solid #E5E7EB'
                  }}
                >
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '10px',
                    background: channel.bgColor,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '12px'
                  }}>
                    <Icon size={20} color={channel.color} />
                  </div>
                  <div style={{ fontSize: '14px', fontWeight: '700', color: '#111827', marginBottom: '4px' }}>
                    {channel.title}
                  </div>
                  <div style={{ fontSize: '12px', color: '#6B7280', marginBottom: '8px', lineHeight: 1.4 }}>
                    {channel.description}
                  </div>
                  <div style={{ fontSize: '12px', fontWeight: '600', color: channel.color, marginBottom: '2px' }}>
                    {channel.contact}
                  </div>
                  <div style={{ fontSize: '10px', color: '#9CA3AF' }}>
                    {channel.availability}
                  </div>
                </a>
              );
            })}
          </div>
        </div>

        {/* FAQ Section */}
        <div style={{ padding: '16px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#111827', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <HelpCircle size={20} color="#16A34A" />
            Frequently Asked Questions
          </h2>

          {faqs.map((category, catIdx) => {
            const CategoryIcon = category.icon;
            return (
              <div key={catIdx} style={{ marginBottom: '24px' }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  marginBottom: '12px',
                  paddingBottom: '8px',
                  borderBottom: '2px solid #E5E7EB'
                }}>
                  <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '8px',
                    background: '#DCFCE7',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <CategoryIcon size={18} color="#16A34A" />
                  </div>
                  <span style={{ fontSize: '15px', fontWeight: '700', color: '#111827' }}>
                    {category.category}
                  </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {category.questions.map((faq, faqIdx) => {
                    const isExpanded = expandedFaq === `${catIdx}-${faqIdx}`;
                    return (
                      <div
                        key={faqIdx}
                        style={{
                          background: '#fff',
                          borderRadius: '12px',
                          border: isExpanded ? '1.5px solid #16A34A' : '1.5px solid #E5E7EB',
                          overflow: 'hidden',
                          transition: 'all 0.2s ease'
                        }}
                      >
                        <button
                          onClick={() => setExpandedFaq(isExpanded ? null : `${catIdx}-${faqIdx}`)}
                          className="press-scale"
                          style={{
                            width: '100%',
                            padding: '14px 16px',
                            background: 'none',
                            border: 'none',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            cursor: 'pointer',
                            textAlign: 'left'
                          }}
                        >
                          <span style={{ fontSize: '14px', fontWeight: '600', color: '#111827', flex: 1, paddingRight: '12px' }}>
                            {faq.q}
                          </span>
                          <ChevronDown
                            size={20}
                            color="#6B7280"
                            style={{
                              transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                              transition: 'transform 0.2s ease',
                              flexShrink: 0
                            }}
                          />
                        </button>
                        {isExpanded && (
                          <div style={{
                            padding: '0 16px 14px',
                            fontSize: '13px',
                            color: '#6B7280',
                            lineHeight: 1.6,
                            animation: 'slideDown 0.2s ease'
                          }}>
                            {faq.a}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Still Need Help */}
        <div style={{
          margin: '16px',
          padding: '20px',
          background: 'linear-gradient(135deg, #16A34A 0%, #22C55E 100%)',
          borderRadius: '16px',
          textAlign: 'center',
          color: '#fff'
        }}>
          <div style={{ fontSize: '32px', marginBottom: '12px' }}>💬</div>
          <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '8px' }}>
            Still Need Help?
          </h3>
          <p style={{ fontSize: '13px', marginBottom: '16px', opacity: 0.95, lineHeight: 1.5 }}>
            Our support team is here to assist you with any questions or concerns
          </p>
          <a
            href="https://wa.me/919876543210"
            target="_blank"
            rel="noopener noreferrer"
            className="press-scale"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              background: '#fff',
              color: '#16A34A',
              padding: '12px 24px',
              borderRadius: '12px',
              fontSize: '14px',
              fontWeight: '700',
              textDecoration: 'none',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
            }}
          >
            <MessageCircle size={18} />
            Chat on WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
}
