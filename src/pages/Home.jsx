import { useState, useEffect } from "react";
import BlogCard from "../components/BlogCard";
import { getAllBlogs } from "../api/blogApi";
import Spinner from "../components/Spinner";

const Home = () => {
  const [blogs, setBlogs] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [reloadIndex, setReloadIndex] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    const fetchBlogs = async () => {
      setIsLoading(true);
      setError("");
      try {
        const response = await getAllBlogs({ page, limit: 9, signal: controller.signal });
        // Support both an Axios response and an API helper that returns response.data.
        const payload = response?.data ?? response;
        const result = payload?.data ?? payload;
        const nextBlogs = Array.isArray(result?.blogs)
          ? result.blogs
          : Array.isArray(payload?.blogs)
            ? payload.blogs
            : [];
        const pagination = result?.pagination ?? payload?.pagination;

        setBlogs(nextBlogs);
        setTotalPages(Number(pagination?.totalPages) || 1);
      } catch (err) {
        if (err.name === "CanceledError" || err.code === "ERR_CANCELED") return;
        setError(
          !err.response
            ? "Network error — please check your internet connection."
            : "Could not load blogs. Please try again."
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchBlogs();
    return () => controller.abort();
  }, [page, reloadIndex]);

  const handleRetry = () => setReloadIndex((i) => i + 1);
  const goToPage = (p) => {
    if (p < 1 || p > totalPages || p === page) return;
    setPage(p);
  };

  if (isLoading) {
    return <Spinner />;
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-24 text-center">
        <p role="alert" className="text-danger text-sm font-medium">
          {error}
        </p>
        <button
          onClick={handleRetry}
          className="btn-primary text-sm px-4 py-2"
        >
          Retry
        </button>
      </div>
    );
  }

  if (blogs?.length === 0) {
    return (
      <div className="flex items-center justify-center py-24">
        <p className="text-muted text-sm">No blogs published yet. Check back soon!</p>
      </div>
    );
  }

  return (
    <>
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-ink">Explore Ideas</h1>
        <p className="text-muted mt-1 text-sm sm:text-base">
          Thoughtful, slow-paced writing from the Marginalia community.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 w-full gap-6">
        {blogs?.map((blog) => (
          <BlogCard key={blog._id} blog={blog} />
        ))}
      </div>

      {blogs && <div className="flex items-center justify-center gap-4 mt-10">
        <button
          onClick={() => goToPage(page - 1)}
          disabled={page <= 1}
          className="btn-secondary text-sm px-4 py-2 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Previous
        </button>
        <span className="text-sm text-muted">
          Page {page} of {totalPages}
        </span>
        <button
          onClick={() => goToPage(page + 1)}
          disabled={page >= totalPages}
          className="btn-secondary text-sm px-4 py-2 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Next
        </button>
      </div>}
    </>
  );
};

export default Home;