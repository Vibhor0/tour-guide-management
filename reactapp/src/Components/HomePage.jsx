import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import "bootstrap/dist/css/bootstrap.min.css";
import "./HomePage.css";
import Navbar from "./NavBar";



const HomePage = () => {
  // Animation Variants
  const navigate = useNavigate();
  
  const fadeInUp = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.2 } }
  };

  return (
    <div className="tm-wrapper">

      <Navbar />

      {/* HERO SECTION */}
      <header className="tm-hero-home text-white overflow-hidden">
        <div className="container position-relative">
          <div className="row align-items-center pt-5">
            <motion.div 
              className="col-lg-8"
              initial="hidden" animate="visible" variants={fadeInUp}
            >
              <h1 className="hero-title-home">
                Your Next <span className="text-italic-home">Unforgettable</span> <br />
                Journey Starts Here
              </h1>
            </motion.div>
            <motion.div 
              className="col-lg-4"
              initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}
            >
              <p className="hero-subtext-home">Adventure, culture, and comfort all in one journey.</p>
            </motion.div>
          </div>

          {/* DASHED LINE PATH */}
          <svg className="tm-path" viewBox="0 0 1000 200">
            <path d="M0,150 Q250,50 500,150 T1000,100" fill="none" stroke="white" strokeDasharray="10,10" opacity="0.3" />
          </svg>
          {/* HERO CARDS */}
          <motion.div 
            className="row g-4 mt-5 pb-5"
            variants={staggerContainer} initial="hidden" animate="visible"
          >
            {[
              { name: "Canada", img: "/assets/dest1.jpg", rotate: "-5deg" },
              { name: "New Zealand", img: "/assets/dest2.jpg", rotate: "2deg" },
              { name: "Thailand", img: "/assets/dest3.jpg", rotate: "-3deg" },
              { name: "Italy", img: "/assets/dest4.jpg", rotate: "5deg" }
            ].map((dest, i) => (
              <motion.div className="col-6 col-md-3" key={i} variants={fadeInUp}>
                <div className="tm-card-hero" style={{ transform: `rotate(${dest.rotate})` }}>
                  <img src={dest.img} alt={dest.name} />
                  <span className="badge rounded-pill bg-white text-dark position-absolute bottom-0 start-50 translate-middle-x mb-3">
                    📍 {dest.name}
                  </span>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </header>

      {/* ABOUT SECTION */}
      <section className="tm-about py-5 bg-white">
        <div className="container py-5">
          <div className="row align-items-center">
            <motion.div className="col-lg-6" whileInView="visible" initial="hidden" variants={fadeInUp}>
              <span className="tm-tag">Our Mission</span>
              <h2 className="section-title mt-3">The Passion Behind Every Destination</h2>
              <p className="text-muted mt-4">
                Travel isn't just what we do; it's who we are. Founded by passionate explorers, 
                Travel Tales was created to help people experience the world in meaningful ways.
              </p>
              <button className="btn btn-dark rounded-pill px-4 mt-3" onClick={()=>{navigate('/viewplace')}}>Discovery Now ↗</button>
            </motion.div>
            
            <div className="col-lg-6 mt-5 mt-lg-0 d-flex justify-content-center">
              <div className="tm-gallery-stack">
                <motion.div 
                  className="gallery-item item-1" 
                  whileHover={{ scale: 1.1, zIndex: 10 }}
                ><img src="/assets/dest1.jpg" alt="1" /></motion.div>
                <motion.div 
                  className="gallery-item item-2 active" 
                  whileHover={{ scale: 1.1, zIndex: 10 }}
                ><img src="/assets/dest2.jpg" alt="2" /></motion.div>
                <motion.div 
                  className="gallery-item item-3" 
                  whileHover={{ scale: 1.1, zIndex: 10 }}
                ><img src="/assets/dest3.jpg" alt="3" /></motion.div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="tm-footer py-5 text-white">
        <div className="container">
          <div className="row g-4 align-items-center">
            <div className="col-md-4">
              <h3>Ready to start your journey?</h3>
              <button className="btn btn-warning rounded-pill mt-3 px-4" onClick={()=>{navigate('/login')}}>Get In Touch ↗</button>
            </div>
            <div className="col-md-4">
              <h5>Explore</h5>
              <ul className="list-unstyled opacity-75">
                <li>Destinations</li>
                <li>Travel Guides</li>
                <li>Tours & Packages</li>
              </ul>
            </div>
            <div className="col-md-4">
              <h2 className="fw-bold">TRAVEL TALES</h2>
              <p className="opacity-75">Founded by explorers, for explorers.</p>
            </div>
          </div>
          <hr className="my-5 opacity-25" />
          <p className="text-center opacity-50">© 2026 Travel Tales. All Rights Reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
