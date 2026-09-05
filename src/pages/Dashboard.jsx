import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { PenSquare, FileText, Settings } from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { getMyBlogs } from "../api/blogApi";
import Spinner from "../components/Spinner";

const RECENT_COUNT = 5;

const Dashboard = () => {
  const { user } = useAuth();

  const [blogs, setBlogs] = useState([]);
  const [totalBlogs, setTotalBlogs] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [reloadIndex, setReloadIndex] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    const fetchOverview = async () => {
      setIsLoading(true);
      setError("");
      try {
        const { data } = await getMyBlogs({ limit: RECENT_COUNT, signal: controller.signal });
        const recentBlogs = data?.blogs ?? [];
        setBlogs(recentBlogs);
        setTotalBlogs(data?.pagination?.total ?? data?.pagenation?.total ?? recentBlogs.length);
      } catch (err) {
        if (err.name === "CanceledError" || err.code === "ERR_CANCELED" || controller.signal.aborted) return;
        setError(
          !err.response
            ? "Network error — please check your internet connection."
            : "Could not load your dashboard. Please try again."
        );
      } finally {
        setIsLoading(false);
      }
    };
    fetchOverview();
    return () => controller.abort();
  }, [reloadIndex]);

  if (isLoading) return <Spinner />;

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-24 text-center">
        <p role="alert" className="text-danger text-sm font-medium">
          {error}
        </p>
        <button onClick={() => setReloadIndex((i) => i + 1)} className="btn-primary text-sm px-4 py-2">Retry</button>
      </div>
    ); 
  }

  return (
    <div className="min-h-screen px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <header className="card mb-8 p-6 shadow-sm backdrop-blur-sm sm:p-8">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.22em] text-brand">Dashboard</p>
          <h1 className="text-3xl font-bold tracking-tight text-ink sm:text-4xl">Your Workspace</h1>
          <p className="mt-3 max-w-2xl text-sm font-medium text-muted sm:text-base">
            Analyze performance,manage recent posts, and access tools.
          </p>
        </header>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="card p-5 shadow-sm transition-shadow hover:shadow-md">
            <p className="text-sm font-semibold text-muted">Total Blogs</p>
            <p className="mt-3 text-3xl font-bold text-brand">{totalBlogs}</p>
          </div>

          <Link
            to="/create-blog"
            className="group flex items-center justify-center gap-3 rounded-2xl bg-brand px-5 py-4 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-brand-hover hover:shadow-md active:translate-y-0"
          >
            <PenSquare className="h-4 w-4 transition-transform group-hover:rotate-12" />
            Create Blog
          </Link>

          <Link
            to="/my-blogs"
            className="group flex items-center justify-center gap-3 rounded-2xl bg-accent px-5 py-4 text-sm font-semibold text-ink shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-accent-hover hover:shadow-md active:translate-y-0"
          >
            <FileText className="h-4 w-4 transition-transform group-hover:scale-110" />
            Your Blogs
          </Link>

          <Link
            to="/settings"
            className="group flex items-center justify-center gap-3 rounded-2xl bg-ink px-5 py-4 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-ink-soft hover:shadow-md active:translate-y-0"
          >
            <Settings className="h-4 w-4 transition-transform group-hover:rotate-90" />
            Profile Settings
          </Link>
        </div>

        <section className="card mt-8 p-5 shadow-sm sm:p-6">
          <div className="mb-5 flex items-center justify-between gap-3">
            <h2 className="text-lg font-bold text-ink">Recent blogs</h2>
          </div>

          {blogs?.length === 0 ? (
            <p className="rounded-xl border border-dashed border-border bg-canvas px-4 py-10 text-center text-sm text-muted">
              You haven't published anything yet. {" "}
              <Link to="/create-blog" className="font-semibold text-brand hover:text-brand-hover active:text-brand-active">
                Write your first blog
              </Link>
            </p>
          ) : (
            <ul className="space-y-3">
              {blogs?.map((blog) => (
                <li
                  key={blog._id}
                  className="flex flex-col gap-3 rounded-xl border border-border bg-canvas px-4 py-3 transition-colors hover:border-brand/40 hover:bg-brand-subtle sm:flex-row sm:items-center sm:justify-between"
                >
                  <Link to={`/blogs/${blog._id}`} className="font-medium text-ink-soft transition-colors hover:text-brand">
                    {blog.title}
                  </Link>
                  <Link
                    to={`/edit-blog/${blog._id}`}
                    className="inline-flex items-center self-start rounded-full border border-border bg-surface px-3 py-1.5 text-xs font-semibold text-muted transition-colors hover:border-brand hover:text-brand"
                  >
                    Edit
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
};

export default Dashboard;