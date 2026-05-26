import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import axios from "axios";
import { 
  BookPlus, Type, User, Tag, Hash, Building2, 
  Layers, IndianRupee, Image as ImageIcon, 
  FileText, ShieldCheck, ArrowRight, AlertCircle,
  X, UploadCloud
} from "lucide-react";
import { Server_URL } from "../../utils/config";
import { showErrorToast, showSuccessToast } from "../../utils/toasthelper";
import "./addbook.css";

const CATEGORIES = [
  "Fiction", "Non-fiction", "Science", "History", "Technology",
  "Biography", "Philosophy", "Arts & Design", "Business", "Education",
];

const AddBookForm = () => {
  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);

  // Watch the file input to create a live preview
  const coverImageFile = watch("coverImage");

  useEffect(() => {
    if (coverImageFile && coverImageFile.length > 0) {
      const file = coverImageFile[0];
      const objectUrl = URL.createObjectURL(file);
      setImagePreview(objectUrl);
      return () => URL.revokeObjectURL(objectUrl);
    } else {
      setImagePreview(null);
    }
  }, [coverImageFile]);

  const removeImage = (e) => {
    e.preventDefault(); // Prevent form submission
    setValue("coverImage", null);
    setImagePreview(null);
  };

  const onReset = () => {
    reset();
    setImagePreview(null);
  }

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      Object.keys(data).forEach((key) => {
        if (key !== "coverImage") formData.append(key, data[key]);
      });

      if (data.coverImage && data.coverImage[0]) {
        formData.append("coverImage", data.coverImage[0]);
      }

      const authToken = localStorage.getItem("authToken");
      const url = Server_URL + "books/add";

      const response = await axios.post(url, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${authToken}`,
        },
      });

      if (response.data.error) {
        showErrorToast(response.data.message || "Failed to add book!");
      } else {
        showSuccessToast(response.data.message || "Book added successfully!");
        onReset();
      }
    } catch (err) {
      showErrorToast(err.response?.data?.message || err.message || "Failed to add book!");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="addbook-page">
      <div className="addbook-container">
        
        {/* ── PREMIUM HERO HEADER ── */}
        <header className="ab-hero-header">
          <div>
            <h1 className="ab-title">Add New Book</h1>
            <p className="ab-subtitle">Register and manage your library inventory with modern acquisition tracking.</p>
          </div>
          <div className="ab-analytics-pill">
            <BookPlus size={20} />
            <span className="ab-pill-text">Inventory Module</span>
            <div className="ab-pulse-dot"></div>
          </div>
        </header>

        {/* ── MAIN FORM ── */}
        <form onSubmit={handleSubmit(onSubmit)} className="ab-form-grid">
          
          {/* CARD 1: Basic Information */}
          <div className="ab-section-card">
            <h3 className="ab-section-title"><FileText size={20} /> Basic Information</h3>
            
            <div className="ab-form-group">
              <label className="ab-label"><Type size={14} /> Book Title</label>
              <div className="ab-input-wrapper">
                <input
                  type="text"
                  className="ab-input with-icon"
                  placeholder="Enter full book title"
                  {...register("title", { required: "Title is required" })}
                />
                <Type size={18} className="ab-input-icon" />
              </div>
              {errors.title && <span className="ab-error-text"><AlertCircle size={14} /> {errors.title.message}</span>}
            </div>

            <div className="ab-form-group">
              <label className="ab-label"><User size={14} /> Author Name</label>
              <div className="ab-input-wrapper">
                <input
                  type="text"
                  className="ab-input with-icon"
                  placeholder="Primary author name"
                  {...register("author", { required: "Author is required" })}
                />
                <User size={18} className="ab-input-icon" />
              </div>
              {errors.author && <span className="ab-error-text"><AlertCircle size={14} /> {errors.author.message}</span>}
            </div>

            <div className="ab-form-group">
              <label className="ab-label"><Tag size={14} /> Category / Genre</label>
              <div className="ab-input-wrapper">
                <select
                  className="ab-select with-icon"
                  {...register("category", { required: "Category is required" })}
                >
                  <option value="">Select Genre</option>
                  {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
                <Tag size={18} className="ab-input-icon" />
              </div>
              {errors.category && <span className="ab-error-text"><AlertCircle size={14} /> {errors.category.message}</span>}
            </div>
          </div>

          {/* CARD 2: Publication & Inventory */}
          <div className="ab-section-card">
            <h3 className="ab-section-title"><Building2 size={20} /> Publication & Inventory</h3>
            
            <div className="ab-form-group">
              <label className="ab-label"><Hash size={14} /> ISBN Number</label>
              <div className="ab-input-wrapper">
                <input
                  type="text"
                  className="ab-input with-icon"
                  placeholder="ISBN-13"
                  {...register("isbn", { required: "ISBN is required" })}
                />
                <Hash size={18} className="ab-input-icon" />
              </div>
              {errors.isbn && <span className="ab-error-text"><AlertCircle size={14} /> {errors.isbn.message}</span>}
            </div>

            <div className="ab-form-group">
              <label className="ab-label"><Layers size={14} /> Total Copies</label>
              <div className="ab-input-wrapper">
                <input
                  type="number"
                  className="ab-input with-icon"
                  placeholder="No. of copies"
                  {...register("totalCopies", { required: "Required", min: 1 })}
                />
                <Layers size={18} className="ab-input-icon" />
              </div>
              {errors.totalCopies && <span className="ab-error-text"><AlertCircle size={14} /> {errors.totalCopies.message}</span>}
            </div>

            <div className="ab-form-group">
              <label className="ab-label"><IndianRupee size={14} /> Book Price</label>
              <div className="ab-input-wrapper">
                <input
                  type="number"
                  step="0.01"
                  className="ab-input with-icon"
                  placeholder="0.00"
                  {...register("price")}
                />
                <IndianRupee size={18} className="ab-input-icon" />
              </div>
            </div>
          </div>

          {/* CARD 3: Book Presentation (File Upload) */}
          <div className="ab-section-card">
            <h3 className="ab-section-title"><ImageIcon size={20} /> Book Presentation</h3>
            
            <div className="ab-form-group" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <label className="ab-label" style={{ marginBottom: '8px' }}><ImageIcon size={14} /> Cover Image</label>
              
              {!imagePreview ? (
                <div className="ab-upload-zone">
                  <input
                    type="file"
                    className="ab-file-input"
                    accept="image/*"
                    {...register("coverImage")}
                  />
                  <div className="ab-upload-icon-circle">
                    <UploadCloud size={32} color="#A78BFA" />
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <p className="ab-upload-text">Drag & Drop Book Cover</p>
                    <p className="ab-upload-subtext">or click to browse</p>
                  </div>
                  <p className="ab-upload-subtext" style={{ fontSize: '0.75rem', marginTop: '8px' }}>Supported: JPG, PNG, WEBP</p>
                </div>
              ) : (
                <div className="ab-image-preview-container">
                  <img src={imagePreview} alt="Book Cover Preview" className="ab-image-preview" />
                  <button className="ab-remove-image-btn" onClick={removeImage} title="Remove image">
                    <X size={20} />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* CARD 4: Description & Metadata */}
          <div className="ab-section-card">
            <h3 className="ab-section-title"><FileText size={20} /> Description & Metadata</h3>
            
            <div className="ab-form-group" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <label className="ab-label" style={{ marginBottom: '8px' }}><FileText size={14} /> Short Description</label>
              <textarea
                className="ab-textarea"
                placeholder="Provide a brief summary of the book content, key themes, and target audience..."
                {...register("description", { required: "Description is required" })}
                style={{ flex: 1 }}
              ></textarea>
              {errors.description && <span className="ab-error-text"><AlertCircle size={14} /> {errors.description.message}</span>}
            </div>
          </div>

          {/* ── FORM ACTIONS ── */}
          <div className="ab-form-actions">
            <button type="button" className="ab-btn-secondary" onClick={onReset} disabled={isSubmitting}>
              Reset Details
            </button>
            <button type="submit" className="ab-btn-primary" disabled={isSubmitting}>
              {isSubmitting ? (
                <><div className="ab-spinner" /> Adding Book...</>
              ) : (
                <><ShieldCheck size={20} /> Add Book <ArrowRight size={18} /></>
              )}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default AddBookForm;
