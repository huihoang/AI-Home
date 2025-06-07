import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaLightbulb, FaTemperatureHigh, FaCamera, FaMicrophone, FaShieldAlt, FaMobile } from 'react-icons/fa';
import LoginModal from '../components/LoginModal';
import RegisterModal from '../components/RegisterModal';
import '../styles/LandingPage.css';

const LandingPage = () => {
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);

  const openLoginModal = () => {
    setShowLoginModal(true);
    setShowRegisterModal(false);
  };

  const openRegisterModal = () => {
    setShowRegisterModal(true);
    setShowLoginModal(false);
  };

  const closeModals = () => {
    setShowLoginModal(false);
    setShowRegisterModal(false);
  };

  const [activeSection, setActiveSection] = React.useState('hero');
  
  React.useEffect(() => {
    const handleScroll = () => {
      const sections = document.querySelectorAll('section');
      const scrollPosition = window.scrollY + window.innerHeight / 3;
      
      sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.offsetHeight;
        
        if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
          const id = section.getAttribute('id') || section.classList[0];
          setActiveSection(id);
        }
      });
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  const scrollToSection = (sectionId) => {
    const section = document.getElementById(sectionId) || document.querySelector(`.${sectionId}`);
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="landing-page">
      {/* Scroll Indicator */}
      {/* <div className="scroll-indicator">
        <div 
          className={`scroll-dot ${activeSection === 'hero' ? 'active' : ''}`} 
          onClick={() => scrollToSection('hero')}
        />
        <div 
          className={`scroll-dot ${activeSection === 'features' ? 'active' : ''}`} 
          onClick={() => scrollToSection('features')}
        />
        <div 
          className={`scroll-dot ${activeSection === 'benefits' ? 'active' : ''}`} 
          onClick={() => scrollToSection('benefits')}
        />
        <div 
          className={`scroll-dot ${activeSection === 'faq' ? 'active' : ''}`} 
          onClick={() => scrollToSection('faq')}
        />
        <div 
          className={`scroll-dot ${activeSection === 'cta-footer-section' ? 'active' : ''}`} 
          onClick={() => scrollToSection('cta-footer-section')}
        />
      </div> */}

      {/* Header/Navigation */}
      <header className="header">
        <div className="container header-container">
          <div className="logo-container">
            <span className="logo">AI-Home</span>
          </div>
          <nav className="nav-menu">
            <ul className="nav-list">
              <li className="nav-item"><a href="#features" className="nav-link">Tính năng</a></li>
              <li className="nav-item"><a href="#benefits" className="nav-link">Lợi ích</a></li>
              <li className="nav-item"><a href="#faq" className="nav-link">FAQ</a></li>
            </ul>
          </nav>
          <div className="auth-buttons">
            <button onClick={openLoginModal} className="btn btn-outline">
              Đăng nhập
            </button>
            <button onClick={openRegisterModal} className="btn btn-primary">
              Đăng ký
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero">
        <div className="container hero-container">
          <div className="hero-content">
            <h1 className="hero-title">
              Biến ngôi nhà thành <span className="hero-highlight">Nhà thông minh</span> của bạn
            </h1>
            <p className="hero-description">
              Điều khiển thiết bị, theo dõi cảm biến và bảo vệ ngôi nhà của bạn mọi lúc, mọi nơi với AI-Home - giải pháp nhà thông minh toàn diện.
            </p>
            <div className="hero-buttons">
              <button onClick={openLoginModal} className="btn btn-hero btn-hero-primary">
                Bắt đầu ngay
              </button>
              <button onClick={openRegisterModal} className="btn btn-hero btn-hero-outline">
                Tạo tài khoản
              </button>
            </div>
          </div>
          <div className="hero-image">
            <img 
              src="/images/smart-home-illustration.svg" 
              alt="Smart Home" 
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = "https://via.placeholder.com/500x400?text=AI-Home";
              }}
            />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="features">
        <div className="container">
          <h2 className="section-title">Tính năng nổi bật</h2>
          
          <div className="features-grid">
            {[
              {
                icon: <FaLightbulb className="text-yellow-500" size={28} />,
                title: "Điều khiển thiết bị",
                description: "Điều khiển đèn, quạt, cửa và các thiết bị trong nhà từ điện thoại hoặc máy tính của bạn."
              },
              {
                icon: <FaTemperatureHigh className="text-red-500" size={28} />,
                title: "Giám sát cảm biến",
                description: "Theo dõi nhiệt độ, độ ẩm và ánh sáng trong nhà với biểu đồ trực quan."
              },
              {
                icon: <FaCamera className="text-blue-500" size={28} />,
                title: "Camera an ninh",
                description: "Xem hình ảnh từ camera giám sát."
              },
              {
                icon: <FaMicrophone className="text-purple-500" size={28} />,
                title: "Điều khiển bằng giọng nói",
                description: "Ra lệnh điều khiển thiết bị bằng giọng nói của bạn một cách dễ dàng."
              },
              {
                icon: <FaShieldAlt className="text-green-500" size={28} />,
                title: "Cảnh báo thông minh",
                description: "Nhận thông báo khi các thông số môi trường vượt quá ngưỡng cài đặt."
              },
              {
                icon: <FaMobile className="text-indigo-500" size={28} />,
                title: "Truy cập mọi lúc, mọi nơi",
                description: "Truy cập và điều khiển hệ thống từ bất kỳ thiết bị nào có kết nối internet."
              }
            ].map((feature, index) => (
              <div key={index} className="feature-card">
                <div className="feature-header">
                  <span className="feature-icon">{feature.icon}</span>
                  <h3 className="feature-title">{feature.title}</h3>
                </div>
                <p className="feature-description">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section id="benefits" className="benefits">
        <div className="container">
          <h2 className="section-title">Lợi ích của nhà thông minh</h2>
          
          <div className="benefits-grid">
            <div className="benefit-card benefit-card-primary">
              <h3 className="benefit-title">Tiện nghi & Thoải mái</h3>
              <ul className="benefit-list">
                <li className="benefit-item">
                  <svg className="benefit-icon" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path>
                  </svg>
                  <span>Điều khiển thiết bị từ xa, không cần đi lại</span>
                </li>
                <li className="benefit-item">
                  <svg className="benefit-icon" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path>
                  </svg>
                  <span>Tạo lịch trình tự động hóa cho thiết bị</span>
                </li>
                <li className="benefit-item">
                  <svg className="benefit-icon" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path>
                  </svg>
                  <span>Điều khiển bằng giọng nói, không cần tay</span>
                </li>
              </ul>
            </div>
            
            <div className="benefit-card benefit-card-success">
              <h3 className="benefit-title">An toàn & Bảo mật</h3>
              <ul className="benefit-list">
                <li className="benefit-item">
                  <svg className="benefit-icon" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path>
                  </svg>
                  <span>Camera giám sát với nhận diện có người</span>
                </li>
                <li className="benefit-item">
                  <svg className="benefit-icon" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path>
                  </svg>
                  <span>Cảnh báo khi phát hiện chuyển động bất thường</span>
                </li>
                <li className="benefit-item">
                  <svg className="benefit-icon" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path>
                  </svg>
                  <span>Kiểm soát cửa ra vào từ xa</span>
                </li>
              </ul>
            </div>

            <div className="benefit-card benefit-card-info">
              <h3 className="benefit-title">Tiết kiệm năng lượng</h3>
              <ul className="benefit-list">
                <li className="benefit-item">
                  <svg className="benefit-icon" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path>
                  </svg>
                  <span>Tự động tắt thiết bị khi không sử dụng</span>
                </li>
                <li className="benefit-item">
                  <svg className="benefit-icon" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path>
                  </svg>
                  <span>Điều chỉnh nhiệt độ tối ưu theo thời gian thực</span>
                </li>
                <li className="benefit-item">
                  <svg className="benefit-icon" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path>
                  </svg>
                  <span>Theo dõi và giảm lượng điện năng tiêu thụ</span>
                </li>
              </ul>
            </div>

            <div className="benefit-card benefit-card-warning">
              <h3 className="benefit-title">Nâng cao chất lượng sống</h3>
              <ul className="benefit-list">
                <li className="benefit-item">
                  <svg className="benefit-icon" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path>
                  </svg>
                  <span>Không gian sống thông minh, hiện đại</span>
                </li>
                <li className="benefit-item">
                  <svg className="benefit-icon" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path>
                  </svg>
                  <span>Tăng giá trị tài sản nhà của bạn</span>
                </li>
                <li className="benefit-item">
                  <svg className="benefit-icon" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path>
                  </svg>
                  <span>Môi trường sống tối ưu cho sức khỏe</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="faq">
        <div className="container">
          <h2 className="section-title">Câu hỏi thường gặp</h2>
          
          <div className="faq-container">
            {[
              {
                question: "AI-Home hoạt động như thế nào?",
                answer: "AI-Home sử dụng kết nối internet để điều khiển và giám sát các thiết bị thông minh trong nhà của bạn. Dữ liệu từ các cảm biến được thu thập và hiển thị trên giao diện web hoặc ứng dụng di động, giúp bạn theo dõi và điều khiển từ xa."
              },
              {
                question: "Có cần kiến thức kỹ thuật để sử dụng AI-Home không?",
                answer: "Không, AI-Home được thiết kế để dễ dàng sử dụng cho mọi người. Giao diện trực quan và hướng dẫn chi tiết giúp bạn thiết lập và sử dụng hệ thống một cách nhanh chóng và đơn giản."
              },
              {
                question: "AI-Home có an toàn không?",
                answer: "Có, bảo mật là ưu tiên hàng đầu của chúng tôi. AI-Home sử dụng mã hóa dữ liệu, xác thực hai lớp và các biện pháp bảo mật tiên tiến để đảm bảo hệ thống nhà thông minh của bạn được bảo vệ khỏi truy cập trái phép."
              },
              {
                question: "Tôi có thể điều khiển những thiết bị nào với AI-Home?",
                answer: "AI-Home hỗ trợ nhiều loại thiết bị khác nhau như đèn, quạt, cửa, camera và nhiều cảm biến như nhiệt độ, độ ẩm, chuyển động và ánh sáng. Hệ thống có thể mở rộng để hỗ trợ thêm nhiều thiết bị khác trong tương lai."
              }
            ].map((item, index) => (
              <div key={index} className="faq-item">
                <h3 className="faq-question">{item.question}</h3>
                <p className="faq-answer">{item.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Combine CTA and Footer in one screen */}
      <section className="cta-footer-section">
        {/* Call To Action */}
        <div className="cta">
          <div className="container">
            <h2 className="cta-title">Sẵn sàng trải nghiệm nhà thông minh?</h2>
            <p className="cta-description">
              Biến ngôi nhà của bạn thành không gian thông minh, an toàn và tiện nghi với AI-Home ngay hôm nay.
            </p>
            <Link to="/login" className="btn-cta">
              Bắt đầu ngay
            </Link>
          </div>
        </div>

        {/* Footer */}
        <footer className="footer">
          <div className="container">
            <div className="footer-content">
              <div className="footer-brand">
                <h3 className="footer-brand-title">AI-Home</h3>
                <p className="footer-brand-description">
                  Giải pháp nhà thông minh toàn diện, mang đến sự tiện nghi và an ninh cho ngôi nhà của bạn.
                </p>
              </div>
              
              <div className="footer-links">
                <div className="footer-link-group">
                  <h4 className="footer-link-group-title">Sản phẩm</h4>
                  <ul className="footer-link-list">
                    <li className="footer-link-item"><a href="#" className="footer-link">Tính năng</a></li>
                    <li className="footer-link-item"><a href="#" className="footer-link">Thiết bị hỗ trợ</a></li>
                    <li className="footer-link-item"><a href="#" className="footer-link">Bảng giá</a></li>
                  </ul>
                </div>
                
                <div className="footer-link-group">
                  <h4 className="footer-link-group-title">Liên kết</h4>
                  <ul className="footer-link-list">
                    <li className="footer-link-item"><Link to="/login" className="footer-link">Đăng nhập</Link></li>
                    <li className="footer-link-item"><Link to="/register" className="footer-link">Đăng ký</Link></li>
                    <li className="footer-link-item"><a href="#" className="footer-link">Trợ giúp</a></li>
                  </ul>
                </div>
                
                <div className="footer-link-group">
                  <h4 className="footer-link-group-title">Liên hệ</h4>
                  <ul className="footer-link-list">
                    <li className="footer-link-item">Email: contact@ai-home.com</li>
                    <li className="footer-link-item">Điện thoại: (84) 28 1234 5678</li>
                  </ul>
                </div>
              </div>
            </div>
            
            <div className="footer-bottom">
              <p className="footer-copyright">© {new Date().getFullYear()} AI-Home. Tất cả các quyền được bảo lưu.</p>
              <div className="footer-policy-links">
                <a href="#" className="footer-policy-link">Điều khoản sử dụng</a>
                <a href="#" className="footer-policy-link">Chính sách bảo mật</a>
              </div>
            </div>
          </div>
        </footer>
      </section>

      {/* Login Modal */}
      {showLoginModal && (
        <LoginModal onClose={closeModals} onSwitchToRegister={openRegisterModal} />
      )}

      {/* Register Modal */}
      {showRegisterModal && (
        <RegisterModal onClose={closeModals} onSwitchToLogin={openLoginModal} />
      )}
    </div>
  );
};

export default LandingPage;