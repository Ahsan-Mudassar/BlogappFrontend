import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getBlogById, updateBlog } from "../api/blogApi";
import Spinner from "../components/Spinner";

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

const EditBlog = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [existingImageUrl, setExistingImageUrl] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");

  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    const fetchBlog = async () => {
      setIsLoading(true);
      setLoadError("");
      try {
        const { data } = await getBlogById(id, { signal: controller.signal });
        setTitle(data.data.title);
        setDescription(data.data.description);
        setExistingImageUrl(data.data.image.url);
      } catch (err) {
        if (err.name === "CanceledError" || err.code === "ERR_CANCELED") return;
        if (err.response?.status === 404) setLoadError("Blog not found.");
        else if (err.response?.status === 403) setLoadError("You don't have permission to edit this blog.");
        else setLoadError("Could not load blog. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchBlog();
    return () => controller.abort();
  }, [id]);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    setFieldErrors((prev) => ({ ...prev, image: "" }));
    if (!file) return;

    if (!ALLOWED_TYPES.includes(file.type)) {
      setFieldErrors((prev) => ({ ...prev, image: "Only JPG, PNG or WEBP images are allowed" }));
      e.target.value = "";
      return;
    }
    if (file.size > MAX_IMAGE_SIZE) {
      setFieldErrors((prev) => ({ ...prev, image: "Image must be under 5MB" }));
      e.target.value = "";
      return;
    }

    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setImageFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const validate = () => {
    const errors = {};
    const trimmedTitle = title.trim();
    const trimmedContent = description.trim();

    if (!trimmedTitle) errors.title = "Title is required";
    else if (trimmedTitle.length < 3) errors.title = "Title must be at least 3 characters";

    if (!trimmedContent) errors.description = "Content is required";
    else if (trimmedContent.length < 20) errors.description = "Content must be at least 20 characters";

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError("");

    if (isSubmitting) return;
    if (!validate()) return;

    const formData = new FormData();
    formData.append("title", title.trim());
    formData.append("description", description.trim());
    if (imageFile) formData.append("image", imageFile);

    setIsSubmitting(true);
    setUploadProgress(0);
    try {
      const { data } = await updateBlog(id, formData, {
        onUploadProgress: (evt) => {
          if (evt.total) setUploadProgress(Math.round((evt.loaded * 100) / evt.total));
        },
      });
      navigate(`/blogs/${data.data._id}`, { replace: true });
    } catch (err) {
      if (!err.response) setServerError("Network error — please check your internet connection.");
      else if (err.response.status === 413) setServerError("Image is too large for the server.");
      else if (err.response.status === 415) setServerError("Unsupported image format.");
      else if (err.response.status === 403) setServerError("You don't have permission to edit this blog.");
      else if (err.response.status === 404) setServerError("This blog no longer exists.");
      else if (err.response.status === 400) setServerError(err.response.data?.message || "Please check the details you entered.");
      else setServerError("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
      setUploadProgress(0);
    }
  };

  if (isLoading) return <div className="page-shell flex min-h-[60vh] items-center justify-center"><Spinner /></div>;
  if (loadError) return <p className="mx-auto mt-12 max-w-xl rounded-2xl border border-danger/20 bg-danger-subtle px-5 py-4 text-center text-sm font-medium text-danger shadow-sm" role="alert">{loadError}</p>;

  return (
    <div className="mx-auto max-w-3xl animate-[fadeIn_0.5s_ease-out]">
      <div className="mb-8 text-center">
        <p className="mb-2 text-sm font-semibold uppercase tracking-[0.2em] text-brand">Your story</p>
        <h1 className="text-3xl font-bold tracking-tight text-ink sm:text-4xl">Edit Blog</h1>
        <p className="mt-3 text-muted">Refine your post and share your ideas with the world.</p>
      </div>

      <form onSubmit={handleSubmit} noValidate encType="multipart/form-data" className="card space-y-7 p-6 shadow-xl backdrop-blur sm:p-9">
        <div>
          <label className="field-label" htmlFor="title">Title</label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            aria-invalid={!!fieldErrors.title}
            className={`input-field ${fieldErrors.title ? "input-field-error" : ""}`}
          />
          {fieldErrors.title && <p className="field-error-text" role="alert">{fieldErrors.title}</p>}
        </div>

        <div>
          <label className="field-label" htmlFor="description">Content</label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={10}
            aria-invalid={!!fieldErrors.description}
            className={`input-field resize-y leading-relaxed ${fieldErrors.description ? "input-field-error" : ""}`}
          />
          {fieldErrors.description && <p className="field-error-text" role="alert">{fieldErrors.description}</p>}
        </div>

        <div className="rounded-2xl border border-dashed border-brand/30 bg-brand-subtle p-5">
          <label className="field-label" htmlFor="image">Cover image <span className="font-normal text-muted">(leave empty to keep current)</span></label>
          <input
            id="image"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleImageChange}
            className="block w-full cursor-pointer rounded-xl border border-border bg-surface text-sm text-muted file:mr-4 file:cursor-pointer file:border-0 file:bg-brand-subtle file:px-4 file:py-2.5 file:font-semibold file:text-brand transition hover:file:bg-brand/20"
          />
          {fieldErrors.image && <p className="field-error-text" role="alert">{fieldErrors.image}</p>}
          {(previewUrl || existingImageUrl) && (
            <img className="mt-5 h-56 w-full rounded-2xl object-cover shadow-md transition duration-300 hover:scale-[1.01]" src={previewUrl || existingImageUrl} alt="Cover" />
          )}
        </div>

        {isSubmitting && uploadProgress > 0 && <p className="rounded-xl bg-brand-subtle px-4 py-3 text-sm font-medium text-brand-active" aria-live="polite">Uploading... {uploadProgress}%</p>}
        {serverError && <p className="rounded-xl border border-danger/20 bg-danger-subtle px-4 py-3 text-sm text-danger" role="alert">{serverError}</p>}

        <button className="btn-primary w-full py-3.5 shadow-lg transition duration-200 hover:-translate-y-0.5 hover:shadow-xl active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60" type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : "Save changes"}
        </button>
      </form>
    </div>

  );
};

export default EditBlog;