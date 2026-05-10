
import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import NavBar from "../Components/NavBar";
import "./PlaceForm.css";
import toast, { Toaster } from "react-hot-toast";
import api from "../apiConfig";
// import "./EditPlace.css"; // optional

function EditPlace() {
  const { id } = useParams();
  const navigate = useNavigate();

  const fileInputRef = useRef(null);

  // --- Months (same as NewPlace/PlaceForm.jsx) ---
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

  // --- helper: read File -> base64 data URL ---
  const fileToBase64DataUrl = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = (e) => reject(e);
      reader.readAsDataURL(file);
    });

  // --- State: now stores From/To for the two dropdowns (parity with NewPlace) ---
  const [place, setPlace] = useState({
    name: "",
    category: "",
    bestTimeFrom: "",
    bestTimeTo: "",
    location: "",
    placeImage: "",
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState({});

  // parse "january-august" -> { from: "january", to: "august" }
  const parseBestTime = (s = "") => {
    const [from = "", to = ""] = String(s).toLowerCase().split("-").map((t) => t.trim());
    return { from, to };
  };

  useEffect(() => {
    let isMounted = true;
    (async () => {
      setLoading(true);
      try {
        const res = await api.get(`/places/${id}`);
        const p = res.data || {};
        if (isMounted) {
          const { from, to } = parseBestTime(p.bestTimeToVisit || "");
          setPlace({
            name: p.name || "",
            category: p.category || "",
            bestTimeFrom: from || "",
            bestTimeTo: to || "",
            location: p.location || "",
            placeImage: p.placeImage || "",
          });
        }
      } catch (e) {
        console.error(e);
        toast.error("Failed to load place.");
      } finally {
        if (isMounted) setLoading(false);
      }
    })();
    return () => {
      isMounted = false;
    };
  }, [id]);

  // same validate philosophy as Add, using From/To here
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

    setError(temperror);
    return Object.keys(temperror).length === 0;
  };

  // ---- added: max size constant (2 MB)
  const MAX_IMAGE_BYTES = 2 * 1024 * 1024;

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;

    if (type === "file") {
      const file = (files && files[0]) ? files[0] : null;

      // --- added: size validation ---
      if (file && file.size > MAX_IMAGE_BYTES) {
        if (fileInputRef.current) fileInputRef.current.value = "";
        setError((prev) => ({
          ...prev,
          placeImage: "Image must be 2 MB or less",
        }));
        toast.error("Image too large. Please upload a file ≤ 2 MB.", {
          position: "top-right",
        });
        return;
      }

      setPlace((prev) => ({
        ...prev,
        placeImage: file || prev.placeImage,
      }));
      setError((prev) => ({ ...prev, placeImage: "" }));
    } else {
      setPlace((prev) => ({
        ...prev,
        [name]: value,
      }));

      if (name === "bestTimeFrom" || name === "bestTimeTo") {
        setError((prev) => ({ ...prev, bestTimeFrom: "", bestTimeTo: "" }));
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // --- added: block submit if image has size error ---
    if (error.placeImage) {
      toast.error("Please fix the image error before submitting.", {
        position: "top-right",
      });
      return;
    }

    if (!validate()) return;

    try {
      let placeImageToSend = place.placeImage;
      if (placeImageToSend && typeof placeImageToSend !== "string") {
        placeImageToSend = await fileToBase64DataUrl(placeImageToSend);
      }

      // Combine From/To back into bestTimeToVisit for the API (parity with NewPlace)
      const bestTimeToVisit = `${place.bestTimeFrom}-${place.bestTimeTo}`;

      const payload = {
        name: place.name.trim(),
        category: place.category,
        bestTimeToVisit,
        location: place.location.trim(),
        placeImage: placeImageToSend || "",
      };

      await toast.promise(
        api.put(`/places/${id}`, payload, {
          headers: { "Content-Type": "application/json" },
        }),
        {
          loading: "Updating place...",
          success: "Place updated successfully! ✨",
          error: "Update failed. Please try again or check your network connection.",
        }
      );

      if (fileInputRef.current) fileInputRef.current.value = "";

      navigate("/viewplace");
    } catch (err) {
      console.error("Update error:", err?.response?.status, err?.response?.data);
      const message =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.response?.data ||
        "Update failed";
      setError((prev) => ({ ...prev, submit: message }));
      toast.error(message, { position: "top-right" });
    }
  };

  const isFile = (v) => v && typeof v !== "string";

  if (loading) {
    return (
      <>
    
        <div className="bg-page">
          {/* Background video (same as NewPlace) */}
          <video
            className="bg-video"
            src="/assets/vid-1.mp4"
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            poster="/assets/pexels-pixabay-50594.jpg"
          />
          <div className="bg-overlay" aria-hidden="true" />
          <div className="place-form">
            <p style={{ color: "#fff" }}>Loading place…</p>
          </div>
        </div>
      </>
    );
  }

  return (
    
    <>
       <NavBar/>
        <br/>
      {/* Keep as-is; if you want bottom-right like Add, change position to "bottom-right" */}
      <Toaster
        position="top-right"
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

      <div className="bg-page">
        {/* Background video (same as NewPlace) */}
        <video
          className="bg-video"
          src="/assets/vid-1.mp4"
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          poster="/assets/pexels-pixabay-50594.jpg"
        />
       
        <div className="bg-overlay" aria-hidden="true" />
        <div className="nav-overlay">
        </div>

        <div className="place-form">
          <form onSubmit={handleSubmit}>
            <div className="place-form__head">
              <button className="back-btn" type="button" onClick={() => navigate(-1)}>
                Back
              </button>
              <h2>Edit Place</h2>
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

            {/* Best Time to Visit (range) — EXACT same markup as NewPlace */}
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

              {/* Optional hint, identical to NewPlace */}
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

            {/* Place Image — with helper text & same accept as NewPlace */}
            <div>
              <label htmlFor="placeImage">
                Place Image<span style={{ opacity: 0.7 }}>(optional)</span>
              </label>
              <br />
              <input
                type="file"
                name="placeImage"
                id="placeImage"
                ref={fileInputRef}
                onChange={handleChange}
                accept="image/jpeg,image/png,image/webp"
                className="form-container-img"
              />
              <div className="form-hint">Allowed formats: JPG, PNG, WEBP. Max size: 2 MB.</div>
              <div className="form-error">{error.placeImage}</div>

              {/* Preview logic unchanged */}
              {isFile(place.placeImage) ? (
                <div className="image-preview">
                  <img
                    src={URL.createObjectURL(place.placeImage)}
                    alt="new preview"
                    className="image-preview__img"
                  />
                  <div className="image-preview__caption">New image preview</div>
                </div>
              ) : place.placeImage ? (
                <div className="image-preview">
                  <img
                    src={place.placeImage}
                    alt="current place"
                    className="image-preview__img"
                  />
                  <div className="image-preview__caption">Current image</div>
                </div>
              ) : null}
            </div>

            <button className="add-btn" type="submit">
              Update Place
            </button>
          </form>
        </div>
      </div>
    </>
  );
}

export default EditPlace;