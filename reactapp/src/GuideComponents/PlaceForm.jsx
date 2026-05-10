
import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import GuideNavbar from "./GuideNavbar";
import "./PlaceForm.css";
import toast, { Toaster } from "react-hot-toast";
import api from "../apiConfig";
import Navbar from "../Components/NavBar";

function App() {
  // helper: read File -> base64 data URL
  const fileToBase64DataUrl = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result); // "data:image/...;base64,AAAA..."
      reader.onerror = (e) => reject(e);
      reader.readAsDataURL(file);
    });

  const addPlace = async (payload) => {
    // JSON request with base64 string in payload.placeImage
    // console.log(api.get(`${api}/places`));
    const response = await api.post(`/places`, payload);
    return response;
  };

  // Robust scroll-to-top helper
  const scrollAbsolutelyToTop = () => {
    const candidates = [
      window,
      document.scrollingElement,
      document.documentElement,
      document.body,
      document.querySelector(".bg-page"),
    ].filter(Boolean);

    candidates.forEach((el) => {
      try {
        if (el === window) {
          window.scrollTo({ top: 0, behavior: "smooth" });
        } else if (typeof el.scrollTo === "function") {
          el.scrollTo({ top: 0, behavior: "smooth" });
        } else {
          el.scrollTop = 0;
        }
      } catch (_) {}
    });

    setTimeout(() => {
      candidates.forEach((el) => {
        try {
          if (el === window) {
            window.scrollTo({ top: 0 });
          } else if (typeof el.scrollTo === "function") {
            el.scrollTo({ top: 0 });
          } else {
            el.scrollTop = 0;
          }
        } catch (_) {}
      });
    }, 120);

    try {
      if (window.top && window.top !== window) {
        window.top.scrollTo({ top: 0, behavior: "smooth" });
        setTimeout(() => window.top.scrollTo({ top: 0 }), 120);
      }
    } catch (_) {}
  };

  // Month constants
  const MONTHS = [
    { value: "January", label: "January" },
    { value: "February", label: "February" },
    { value: "March", label: "March" },
    { value: "April", label: "April" },
    { value: "May", label: "May" },
    { value: "June", label: "June" },
    { value: "July", label: "July" },
    { value: "August", label: "August" },
    { value: "September", label: "September" },
    { value: "October", label: "October" },
    { value: "November", label: "November" },
    { value: "December", label: "December" },
  ];

  // -----------------------------
  // State
  // -----------------------------
  const [place, setPlace] = useState({
    name: "",
    category: "",
    bestTimeFrom: "",
    bestTimeTo: "",
    location: "",
    placeImage: "", // File locally; converted to base64 on submit
  });

  const navigate = useNavigate();
  const [error, setError] = useState({});
  const fileInputRef = useRef(null);

  // ---- added: max size constant (2 MB)
  const MAX_IMAGE_BYTES = 2 * 1024 * 1024;

  // -----------------------------
  // Handlers
  // -----------------------------
  const handleChange = (e) => {
    const { name, value, type, files } = e.target;

    if (type === "file") {
      const file = files && files[0] ? files[0] : null;

      // --- added: size validation ---
      if (file && file.size > MAX_IMAGE_BYTES) {
        if (fileInputRef.current) fileInputRef.current.value = "";
        setError((prev) => ({
          ...prev,
          placeImage: "Image must be 2 MB or less",
        }));
        toast.error("Image too large. Please upload a file ≤ 2 MB.", {
          position: "bottom-right",
        });
        return;
      }

      setPlace((prev) => ({
        ...prev,
        placeImage: file, // keep File; convert later
      }));
      setError((prev) => ({ ...prev, placeImage: "" }));
      return;
    }

    setPlace((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (name === "bestTimeFrom" || name === "bestTimeTo") {
      setError((prev) => ({ ...prev, bestTimeFrom: "", bestTimeTo: "" }));
    }
  };

  const validate = () => {
    const temperror = {};

    if (place.name.trim() === "") {
      temperror.name = "Name is required";
    } else if (!isNaN(place.name)) {
      temperror.name = "Name should be a string, not a number";
    }

    if (!place.category) {
      temperror.category = "Category is required";
    }

    if (!place.bestTimeFrom) {
      temperror.bestTimeFrom = "From month is required";
    }
    if (!place.bestTimeTo) {
      temperror.bestTimeTo = "Till month is required";
    }

    if (place.location.trim() === "") {
      temperror.location = "Location is required";
    } else if (!isNaN(place.location)) {
      temperror.location = "Location should be a string, not a number";
    }

    // Keep image required (backend NOT NULL)
    if (!place.placeImage) {
      temperror.placeImage = "Image is required";
    }

    setError(temperror);
    return Object.keys(temperror).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("[PlaceForm] submit clicked");

    // --- added: block submit if image has size error ---
    if (error.placeImage && error.placeImage.toLowerCase().includes("2 mb")) {
      toast.error("Please fix the image error before submitting.", {
        position: "bottom-right",
      });
      return;
    }

    const ok = validate();
    console.log("[PlaceForm] validate:", ok);
    if (!ok) return;

    let placeImageBase64DataUrl = "";
    if (place.placeImage && typeof place.placeImage !== "string") {
      try {
        console.log("[PlaceForm] reading file...");
        placeImageBase64DataUrl = await fileToBase64DataUrl(place.placeImage);
        console.log("[PlaceForm] file read OK, length:", placeImageBase64DataUrl.length);
      } catch (fe) {
        console.error("[PlaceForm] file read failed:", fe);
        setError((prev) => ({ ...prev, submit: "Image read failed" }));
        return;
      }
    }

    const bestTimeToVisit = `${place.bestTimeFrom}-${place.bestTimeTo}`;
    const payload = {
      name: place.name.trim(),
      category: place.category,
      bestTimeToVisit,
      location: place.location.trim(),
      placeImage: placeImageBase64DataUrl,
    };

    console.log("[PlaceForm] about to POST to", api.defaults.baseURL + "/places");
    try {
      await toast.promise(api.post(`/places`, payload), {
        loading: "Adding place...",
        success: "Place added successfully! 🎉",
        error: (err) =>
          err?.response?.data?.message ||
          err?.response?.data?.error ||
          err?.response?.data ||
          err?.message ||
          "Save failed",
      });
      setPlace({
        name: "",
        category: "",
        bestTimeFrom: "",
        bestTimeTo: "",
        location: "",
        placeImage: ""
      });
      navigate("/viewplace");

    } catch (err) {
      console.error("[PlaceForm] POST failed:", err?.message, err?.response?.status, err?.response?.data);
      const message =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.response?.data ||
        err?.message ||
        "Save failed";
      setError((prev) => ({ ...prev, submit: message }));
    }
  };

  // -----------------------------
  // Render
  // -----------------------------
  return (
    <>
      {/* Toasts: bottom-right, glassy */}
      <Toaster
        position="bottom-right"
        toastOptions={{
          duration: 2500,
          style: {
            background: "rgba(255,255,255,0.08)",
            color: "white",
            border: "2px solid rgba(255,255,255,0.7)",
            backdropFilter: "blur(8px)",
            WebkitBackdropFilter: "blur(8px)",
            borderRadius: "14px",
            fontSize: "14px",
          },
        }}
      />

      {/* Background wrapper */}
      <div className="bg-page">
        {/* Background video (from public/assets) */}
        <video
          className="bg-video"
          src="/assets/vid-1.mp4"
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          poster="/assets/pexels-pixabay-50594.jpg" /* optional */
        />

        {/* Dark overlay for readability */}
        <div className="bg-overlay" aria-hidden="true" />

          <Navbar />

        {/* Centered form card */}
        <div className="place-form" style={{marginTop:"120px"}}>
          <form onSubmit={handleSubmit}>
            <div className="place-form__head">
              <button
                className="back-btn"
                type="button"
                onClick={() => navigate("/")}
              >
                Back
              </button>
              <h2 style={{ marginLeft: "8%" }}><b>Create New Place</b></h2>
            </div>

            {error.submit && <div className="form-error">{error.submit}</div>}

            {/* Name */}
            <div>
              <label htmlFor="name">
                Name<span>*</span>
              </label>
              <br />
              <input
                className="container-img"
                type="text"
                name="name"
                id="name"
                placeholder="Name"
                onChange={handleChange}
                value={place.name}
              />
              <div className="form-error">{error.name}</div>
            </div>

            {/* Category */}
            <div>
              <label htmlFor="category">
                Category<span>*</span>
              </label>
              <br />
              <select
                name="category"
                id="category"
                value={place.category}
                onChange={handleChange}
              >
                <option value="">Select a category</option>
                <option value="beach">Beach</option>
                <option value="mountain">Mountain</option>
                <option value="city">City</option>
                <option value="historical">Historical</option>
                <option value="countryside">Countryside</option>
              </select>
              <div className="form-error">{error.category}</div>
            </div>

            {/* Best Time to Visit (range) */}
            <div>
              <label>
                Best time to visit<span>*</span>
              </label>
              <div className="time-range">
                <div className="time-range__field">
                  <label htmlFor="bestTimeFrom" className="sr-only">
                    From
                  </label>
                  <select
                    name="bestTimeFrom"
                    id="bestTimeFrom"
                    value={place.bestTimeFrom}
                    onChange={handleChange}
                  >
                    <option value="">From month</option>
                    {MONTHS.map((m) => (
                      <option key={m.value} value={m.value}>
                        {m.label}
                      </option>
                    ))}
                  </select>
                  <div className="form-error">{error.bestTimeFrom}</div>
                </div>
                <div className="time-range__field">
                  <label htmlFor="bestTimeTo" className="sr-only">
                    Till
                  </label>
                  <select
                    name="bestTimeTo"
                    id="bestTimeTo"
                    value={place.bestTimeTo}
                    onChange={handleChange}
                  >
                    <option value="">Till month</option>
                    {MONTHS.map((m) => (
                      <option key={m.value} value={m.value}>
                        {m.label}
                      </option>
                    ))}
                  </select>
                  <div className="form-error">{error.bestTimeTo}</div>
                </div>
              </div>

              {/* Optional hint */}
              {place.bestTimeFrom && place.bestTimeTo && (
                <div className="selection-summary">
                  Will save as: <strong>{place.bestTimeFrom}-{place.bestTimeTo}</strong>
                </div>
              )}
            </div>

            {/* Location */}
            <div>
              <label htmlFor="location">
                Location<span>*</span>
              </label>
              <br />
              <input
                type="text"
                name="location"
                id="location"
                placeholder="Location"
                onChange={handleChange}
                value={place.location}
              />
              <div className="form-error">{error.location}</div>
            </div>

            {/* Image */}
            {/* Image */}
            <div>
              <label htmlFor="placeImage">
                Place Image<span>*</span>
              </label>
              <br />
              <input
                type="file"
                name="placeImage"
                id="placeImage"
                ref={fileInputRef}
                onChange={handleChange}
                accept="image/jpeg,image/png,image/webp" // keep accept in sync with text below
                className="form-container-img"
              />
              {/* Helper line showing allowed formats & size */}
              <div className="form-hint">
                Allowed formats: JPG, PNG, WEBP. Max size: 2 MB.
              </div>

              <div className="form-error">{error.placeImage}</div>

              {/* Preview */}
              {place.placeImage && typeof place.placeImage !== "string" && (
                <div className="image-preview">
                  <img
                    src={URL.createObjectURL(place.placeImage)}
                    alt="preview"
                    className="image-preview__img"
                  />
                  <div className="image-preview__caption">Preview</div>
                </div>
              )}
            </div>

            <button className="add-btn" type="submit">
              Add Place
            </button>
          </form>
        </div>
      </div>
    </>
  );
}

export default App;
