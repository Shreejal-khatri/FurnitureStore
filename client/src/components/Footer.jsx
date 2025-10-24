import React, { useState } from "react";

const Footer = () => {
  const [showPaymentOptions, setShowPaymentOptions] = useState(false);
  const [showPrivacyPolicy, setShowPrivacyPolicy] = useState(false);
  const [showReturns, setShowReturns] = useState(false);

  const handleNavigation = (path) => {
    window.location.href = path;
  };

  return (
    <>
      <style>{`
        .footer {
          background-color: white;
          padding: 50px 80px 20px;
          font-family: Arial, sans-serif;
          border-top: 1px solid #eee;
        }

        .footer-top {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 40px;
          gap: 50px;
        }

        .footer-column {
          flex: 1;
          min-width: 200px;
        }

        .address-column {
          margin-right: 100px;
        }

        .heading {
          font-size: 18px;
          font-weight: 600;
          margin-bottom: 20px;
          color: #666;
        }

        .text {
          font-size: 16px;
          color: #333;
          line-height: 2;
          margin-bottom: 10px;
          cursor: pointer;
          font-weight: 600;
          transition: color 0.2s;
        }

        .text:hover {
          color: #000;
        }

        .address {
          font-size: 16px;
          color: #333;
          line-height: 1.8;
          margin-top: 40px;
        }

        .newsletter {
          display: flex;
          align-items: center;
          border-bottom: 1px solid #000;
          padding-bottom: 5px;
          margin-top: 5px;
        }

        .newsletter-input {
          flex: 1;
          border: none;
          outline: none;
          font-size: 16px;
          padding: 5px;
          background: transparent;
        }

        .newsletter-input::placeholder {
          color: #999;
        }

        .subscribe {
          font-size: 16px;
          font-weight: 600;
          margin-left: 10px;
          cursor: pointer;
        }

        .footer-bottom {
          border-top: 1px solid #eee;
          margin-top: 30px;
          padding-top: 15px;
          font-size: 15px;
          color: #444;
          text-align: left;
        }

        /* Popup Overlay */
        .popup-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(0, 0, 0, 0.5);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 1000;
          padding: 20px;
        }

        /* Popup Container */
        .popup {
          background-color: white;
          border-radius: 2px;
          max-width: 600px;
          width: 100%;
          max-height: 80vh;
          overflow-y: auto;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
          font-family: Arial, sans-serif;
        }

        /* Popup Header */
        .popup-header {
          padding: 30px 40px 20px;
          border-bottom: 1px solid #eee;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .popup-title {
          font-size: 24px;
          font-weight: 600;
          color: #333;
          margin: 0;
        }

        .popup-close {
          background: none;
          border: none;
          font-size: 28px;
          color: #666;
          cursor: pointer;
          padding: 0;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: color 0.2s;
        }

        .popup-close:hover {
          color: #000;
        }

        /* Popup Content */
        .popup-content {
          padding: 30px 40px 40px;
        }

        /* Payment Options */
        .payment-option {
          padding: 20px;
          border: 1px solid #eee;
          margin-bottom: 15px;
          transition: border-color 0.2s;
          cursor: pointer;
        }

        .payment-option:hover {
          border-color: #333;
        }

        .payment-option:last-child {
          margin-bottom: 0;
        }

        .payment-title {
          font-size: 18px;
          font-weight: 600;
          color: #333;
          margin-bottom: 8px;
        }

        .payment-description {
          font-size: 15px;
          color: #666;
          line-height: 1.6;
        }

        /* Privacy Policy */
        .policy-section {
          margin-bottom: 30px;
        }

        .policy-section:last-child {
          margin-bottom: 0;
        }

        .policy-heading {
          font-size: 18px;
          font-weight: 600;
          color: #333;
          margin-bottom: 12px;
        }

        .policy-text {
          font-size: 15px;
          color: #666;
          line-height: 1.8;
          margin-bottom: 10px;
        }

        /* Tablet styles */
        @media (max-width: 1024px) {
          .footer {
            padding: 40px 40px 20px;
          }

          .footer-top {
            gap: 30px;
          }

          .address-column {
            margin-right: 50px;
          }

          .footer-column {
            min-width: 150px;
          }

          .popup {
            max-width: 90%;
          }
        }

        /* Mobile styles */
        @media (max-width: 768px) {
          .footer {
            padding: 40px 24px 24px;
          }

          .footer-top {
            flex-direction: column;
            gap: 40px;
            align-items: stretch;
          }

          .footer-column {
            flex: none;
            min-width: auto;
          }

          .address-column {
            margin-right: 0;
            order: -1;
            text-align: center;
            padding-bottom: 20px;
            border-bottom: 1px solid #f0f0f0;
          }

          .address {
            margin-top: 0;
            text-align: center;
            font-size: 15px;
            line-height: 1.6;
            color: #555;
          }

          .newsletter {
            display: flex;
            flex-direction: column;
            border: 1px solid #ddd;
            border-radius: 8px;
            padding: 16px;
            background-color: #fafafa;
            border-bottom: none;
          }

          .newsletter-input {
            width: 100%;
            padding: 12px 16px;
            font-size: 15px;
            border: 1px solid #ddd;
            border-radius: 6px;
            margin-bottom: 12px;
            background-color: white;
            box-sizing: border-box;
          }

          .newsletter-input:focus {
            border-color: #333;
            outline: none;
          }

          .subscribe {
            display: block;
            width: 100%;
            padding: 12px 16px;
            background-color: #333;
            color: white;
            text-align: center;
            border: none;
            border-radius: 6px;
            font-size: 14px;
            font-weight: 600;
            cursor: pointer;
            margin-left: 0;
          }

          .subscribe:hover {
            background-color: #555;
          }

          .heading {
            font-size: 17px;
            margin-bottom: 20px;
            color: #333;
            font-weight: 700;
          }

          .text {
            font-size: 15px;
            line-height: 1.8;
            margin-bottom: 12px;
            color: #555;
            padding: 8px 0;
            border-bottom: 1px solid #f5f5f5;
          }

          .text:hover {
            color: #333;
          }

          .text:last-child {
            border-bottom: none;
          }

          .footer-bottom {
            font-size: 14px;
            text-align: center;
            margin-top: 40px;
            padding-top: 24px;
            color: #666;
          }

          .popup {
            max-width: 95%;
            max-height: 85vh;
          }

          .popup-header {
            padding: 24px 24px 16px;
          }

          .popup-title {
            font-size: 20px;
          }

          .popup-content {
            padding: 24px;
          }

          .payment-option {
            padding: 16px;
          }

          .payment-title {
            font-size: 16px;
          }

          .payment-description {
            font-size: 14px;
          }

          .policy-heading {
            font-size: 16px;
          }

          .policy-text {
            font-size: 14px;
          }
        }

        /* Small mobile styles */
        @media (max-width: 480px) {
          .footer {
            padding: 32px 20px 20px;
          }

          .footer-top {
            gap: 32px;
          }

          .address-column {
            padding-bottom: 16px;
          }

          .address {
            font-size: 14px;
            line-height: 1.5;
          }

          .heading {
            font-size: 16px;
            margin-bottom: 16px;
          }

          .text {
            font-size: 14px;
            margin-bottom: 10px;
            padding: 6px 0;
          }

          .newsletter {
            padding: 12px;
          }

          .newsletter-input {
            padding: 10px 12px;
            font-size: 14px;
            margin-bottom: 10px;
          }

          .subscribe {
            padding: 10px 12px;
            font-size: 13px;
          }

          .footer-bottom {
            font-size: 13px;
            margin-top: 32px;
            padding-top: 20px;
          }

          .popup-header {
            padding: 20px 20px 14px;
          }

          .popup-title {
            font-size: 18px;
          }

          .popup-content {
            padding: 20px;
          }
        }
      `}</style>
      <footer className="footer">
        <div className="footer-top">
          {/* Address */}
          <div className="footer-column address-column">
            <p className="address">
              400 University Drive Suite 200 Coral Gables, <br />
              FL 33134 USA
            </p>
          </div>

          {/* Links */}
          <div className="footer-column">
            <h4 className="heading">Links</h4>
            <p className="text" onClick={() => handleNavigation("/")}>Home</p>
            <p className="text" onClick={() => handleNavigation("/shop")}>Shop</p>
            <p className="text" onClick={() => handleNavigation("/about")}>About</p>
            <p className="text" onClick={() => handleNavigation("/contact")}>Contact</p>
          </div>

          {/* Help */}
          <div className="footer-column">
            <h4 className="heading">Help</h4>
            <p className="text" onClick={() => setShowPaymentOptions(true)}>Payment Options</p>
            <p className="text" onClick={() => setShowReturns(true)}>Returns</p>
            <p className="text" onClick={() => setShowPrivacyPolicy(true)}>Privacy Policies</p>
          </div>

          {/* Newsletter */}
          <div className="footer-column">
            <h4 className="heading">Newsletter</h4>
            <div className="newsletter">
              <input
                type="email"
                placeholder="Enter Your Email Address"
                className="newsletter-input"
              />
              <span className="subscribe">SUBSCRIBE</span>
            </div>
          </div>
        </div>

        {/* Bottom text */}
        <div className="footer-bottom">
          <p>2022 Meubel House. All rights reserved</p>
        </div>
      </footer>

      {/* Payment Options Popup */}
      {showPaymentOptions && (
        <div className="popup-overlay" onClick={() => setShowPaymentOptions(false)}>
          <div className="popup" onClick={(e) => e.stopPropagation()}>
            <div className="popup-header">
              <h2 className="popup-title">Payment Options</h2>
              <button className="popup-close" onClick={() => setShowPaymentOptions(false)}>×</button>
            </div>
            <div className="popup-content">
              <div className="payment-option">
                <div className="payment-title">Credit / Debit Card</div>
                <div className="payment-description">
                  We accept all major credit and debit cards including Visa, Mastercard, American Express, and Discover. Your payment information is encrypted and secure.
                </div>
              </div>
              <div className="payment-option">
                <div className="payment-title">Bank Transfer</div>
                <div className="payment-description">
                  Direct bank transfer is available for your convenience. Bank details will be provided after placing your order. Please include your order number in the transfer reference.
                </div>
              </div>
              <div className="payment-option">
                <div className="payment-title">Cash on Delivery</div>
                <div className="payment-description">
                  Pay with cash when your order is delivered to your doorstep. Available for select locations. Additional charges may apply.
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Returns Popup */}
      {showReturns && (
        <div className="popup-overlay" onClick={() => setShowReturns(false)}>
          <div className="popup" onClick={(e) => e.stopPropagation()}>
            <div className="popup-header">
              <h2 className="popup-title">Return Policy</h2>
              <button className="popup-close" onClick={() => setShowReturns(false)}>×</button>
            </div>
            <div className="popup-content">
              <div className="policy-section">
                <h3 className="policy-heading">Return Eligibility</h3>
                <p className="policy-text">
                  Items can be returned within 30 days of delivery. Products must be unused, in original packaging, and in the same condition as received.
                </p>
              </div>
              <div className="policy-section">
                <h3 className="policy-heading">Non-Returnable Items</h3>
                <p className="policy-text">
                  Custom or personalized furniture, clearance items, and products marked as final sale cannot be returned. Mattresses and upholstered items are only returnable if defective.
                </p>
              </div>
              <div className="policy-section">
                <h3 className="policy-heading">Return Process</h3>
                <p className="policy-text">
                  Contact our customer service team to initiate a return. You will receive a return authorization number and shipping instructions. Original shipping costs are non-refundable.
                </p>
              </div>
              <div className="policy-section">
                <h3 className="policy-heading">Inspection & Refund</h3>
                <p className="policy-text">
                  Once we receive and inspect your return, we will process your refund within 5-7 business days. Refunds will be issued to the original payment method. A 15% restocking fee may apply.
                </p>
              </div>
              <div className="policy-section">
                <h3 className="policy-heading">Damaged or Defective Items</h3>
                <p className="policy-text">
                  If you receive a damaged or defective item, please contact us within 48 hours of delivery with photos. We will arrange for a replacement or full refund including shipping costs.
                </p>
              </div>
              <div className="policy-section">
                <h3 className="policy-heading">Contact for Returns</h3>
                <p className="policy-text">
                  To start a return, email us at returns@meubelhouse.com or call our customer service. Please have your order number ready.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Privacy Policy Popup */}
      {showPrivacyPolicy && (
        <div className="popup-overlay" onClick={() => setShowPrivacyPolicy(false)}>
          <div className="popup" onClick={(e) => e.stopPropagation()}>
            <div className="popup-header">
              <h2 className="popup-title">Privacy Policy</h2>
              <button className="popup-close" onClick={() => setShowPrivacyPolicy(false)}>×</button>
            </div>
            <div className="popup-content">
              <div className="policy-section">
                <h3 className="policy-heading">Information Collection</h3>
                <p className="policy-text">
                  We collect information you provide directly to us, including your name, email address, shipping address, and payment information when you make a purchase or create an account.
                </p>
              </div>
              <div className="policy-section">
                <h3 className="policy-heading">Use of Information</h3>
                <p className="policy-text">
                  Your information is used to process orders, communicate with you about your purchases, improve our services, and send promotional materials if you have opted in.
                </p>
              </div>
              <div className="policy-section">
                <h3 className="policy-heading">Data Security</h3>
                <p className="policy-text">
                  We implement appropriate security measures to protect your personal information from unauthorized access, alteration, disclosure, or destruction. All payment transactions are encrypted using SSL technology.
                </p>
              </div>
              <div className="policy-section">
                <h3 className="policy-heading">Information Sharing</h3>
                <p className="policy-text">
                  We do not sell or rent your personal information to third parties. We may share your information with service providers who help us operate our business, such as payment processors and shipping companies.
                </p>
              </div>
              <div className="policy-section">
                <h3 className="policy-heading">Contact Us</h3>
                <p className="policy-text">
                  If you have any questions about our Privacy Policy, please contact us at privacy@meubelhouse.com or call us at our office address listed in the footer.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Footer;