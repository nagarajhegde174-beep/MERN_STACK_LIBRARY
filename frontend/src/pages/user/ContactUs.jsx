import { useForm } from "react-hook-form";
import axios from "axios";
import { FiMail, FiPhone, FiMapPin, FiClock, FiSend, FiMessageCircle } from "react-icons/fi";
import { Server_URL } from "../../utils/config";
import { showErrorToast, showSuccessToast } from "../../utils/toasthelper";

const ContactUs = () => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    try {
      const url = Server_URL + "users/contact";
      await axios.post(url, data);
      showSuccessToast("Your message has been sent! We will get back to you soon.");
      reset();
    } catch (error) {
      console.error(error);
      showErrorToast("There was a problem sending your message. Please try again later.");
    }
  };

  return (
    <div style={{ background: "var(--secondary-soft)", minHeight: "100vh", paddingBottom: "6rem" }}>
      {/* HERO SECTION */}
      <section style={{
        background: "linear-gradient(135deg, var(--primary-deep), #3b2e7d)",
        padding: "6rem 2rem",
        textAlign: "center",
        color: "white",
        marginBottom: "-4rem"
      }}>
        <div style={{ maxWidth: "800px", margin: "0 auto" }}>
          <h1 style={{ fontSize: "3rem", fontWeight: 800, marginBottom: "1rem" }}>Get in Touch</h1>
          <p style={{ fontSize: "1.1rem", opacity: 0.8 }}>We're here to help with any questions about our library services, resources, or facilities.</p>
        </div>
      </section>

      <div className="section-viewport">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "2rem", marginBottom: "4rem" }}>
          <InfoCard icon={<FiMapPin />} title="Visit Us" content="123 College Avenue, Academic City, AC 12345" />
          <InfoCard icon={<FiMail />} title="Email Us" content="library@college.edu | support@college.edu" />
          <InfoCard icon={<FiPhone />} title="Call Us" content="(123) 456-7890 | Mon-Fri, 8AM - 5PM" />
        </div>

        <div className="cotton-card" style={{ 
          display: "grid", 
          gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))", 
          overflow: "hidden",
          border: "none"
        }}>
          {/* Form Content */}
          <div style={{ padding: "4rem" }}>
            <div style={{ marginBottom: "2.5rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", color: "var(--accent-purple)", fontWeight: 700, marginBottom: "1rem" }}>
                <FiMessageCircle size={24} />
                <span>DIRECT MESSAGE</span>
              </div>
              <h2 style={{ fontSize: "2rem", fontWeight: 800, color: "var(--primary-deep)", marginBottom: "1rem" }}>Send Us a Message</h2>
              <p style={{ color: "var(--text-muted)", lineHeight: 1.6 }}>Fill out the form below and our team will get back to you as soon as possible.</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <label style={{ fontSize: "0.9rem", fontWeight: 700, color: "var(--primary-deep)" }}>Full Name</label>
                <input
                  {...register("name", { required: true })}
                  placeholder="John Doe"
                  style={inputStyle}
                />
                {errors.name && <span style={errorStyle}>Name is required</span>}
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <label style={{ fontSize: "0.9rem", fontWeight: 700, color: "var(--primary-deep)" }}>Email Address</label>
                <input
                  {...register("email", { required: true, pattern: /^\S+@\S+\.\S+$/ })}
                  placeholder="john@example.com"
                  style={inputStyle}
                />
                {errors.email && <span style={errorStyle}>Valid email is required</span>}
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <label style={{ fontSize: "0.9rem", fontWeight: 700, color: "var(--primary-deep)" }}>Subject</label>
                <select {...register("subject", { required: true })} style={inputStyle}>
                  <option value="">Select a subject</option>
                  <option value="general">General Inquiry</option>
                  <option value="resources">Resource Questions</option>
                  <option value="membership">Membership</option>
                  <option value="other">Other</option>
                </select>
                {errors.subject && <span style={errorStyle}>Subject is required</span>}
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <label style={{ fontSize: "0.9rem", fontWeight: 700, color: "var(--primary-deep)" }}>Message</label>
                <textarea
                  {...register("message", { required: true })}
                  rows="4"
                  placeholder="How can we help you?"
                  style={{ ...inputStyle, height: "auto", resize: "none" }}
                ></textarea>
                {errors.message && <span style={errorStyle}>Message is required</span>}
              </div>

              <button type="submit" className="premium-btn" style={{ padding: "16px", marginTop: "1rem" }}>
                <FiSend /> Send Message
              </button>
            </form>
          </div>

          {/* Side Illustration/Image */}
          <div style={{ 
            background: "url('https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=800&q=80') center/cover",
            position: "relative"
          }}>
            <div style={{ 
              position: "absolute", 
              inset: 0, 
              background: "linear-gradient(rgba(42, 32, 80, 0.4), var(--primary-deep))",
              display: "flex",
              flexDirection: "column",
              justifyContent: "flex-end",
              padding: "4rem",
              color: "white"
            }}>
              <FiClock size={40} style={{ marginBottom: "1.5rem" }} />
              <h3 style={{ fontSize: "1.5rem", fontWeight: 800, marginBottom: "1rem" }}>Library Hours</h3>
              <p style={{ opacity: 0.9, lineHeight: 1.8 }}>
                Mon-Fri: 8:00 AM - 10:00 PM<br />
                Sat-Sun: 10:00 AM - 6:00 PM
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const inputStyle = {
  width: "100%",
  padding: "14px 18px",
  background: "var(--secondary-soft)",
  border: "1px solid var(--border-color)",
  borderRadius: "12px",
  fontSize: "0.95rem",
  color: "var(--primary-deep)",
  transition: "all 0.2s ease",
  outline: "none"
};

const errorStyle = {
  color: "#ef4444",
  fontSize: "0.75rem",
  fontWeight: 600,
  marginTop: "4px"
};

const InfoCard = ({ icon, title, content }) => (
  <div className="cotton-card" style={{ padding: "2.5rem", textAlign: "center" }}>
    <div style={{ 
      fontSize: "2rem", 
      color: "var(--accent-purple)", 
      background: "var(--primary-glow)", 
      width: "64px", 
      height: "64px", 
      borderRadius: "20px", 
      display: "flex", 
      alignItems: "center", 
      justifyContent: "center",
      margin: "0 auto 1.5rem"
    }}>
      {icon}
    </div>
    <h3 style={{ fontSize: "1.25rem", fontWeight: 800, color: "var(--primary-deep)", marginBottom: "0.75rem" }}>{title}</h3>
    <p style={{ color: "var(--text-muted)", fontSize: "0.95rem", lineHeight: 1.6 }}>{content}</p>
  </div>
);

export default ContactUs;
