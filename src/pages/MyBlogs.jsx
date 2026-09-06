import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import BlogCard from "../components/BlogCard";
import { Pencil, Trash2 } from "lucide-react";
import ConfirmDialog from "../components/ConfirmDialog";
import { getMyBlogs, deleteBlog } from "../api/blogApi";
import Spinner from "../components/Spinner";

const MyBlogs = () => {
    const [blogs, setBlogs] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState("");
    const [reloadIndex, setReloadIndex] = useState(0);

    const [deleteTargetId, setDeleteTargetId] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [deleteError, setDeleteError] = useState("");

    useEffect(() => {
        const controller = new AbortController();
        const fetchMyBlogs = async () => {
            setIsLoading(true);
            setLoadError("");
            try {
                const { data } = await getMyBlogs({ signal: controller.signal });
                // console.log("Blog Data:",data)
                setBlogs(data.data);
                // console.log(data.data);
            } catch (err) {
                if (err.name === "CanceledError" || err.code === "ERR_CANCELED") return;
                setLoadError(
                    !err.response
                        ? "Network error — please check your internet connection."
                        : "Could not load your blogs. Please try again."
                );
            } finally {
                setIsLoading(false);
            }
        };
        fetchMyBlogs();
        return () => controller.abort();
    }, [reloadIndex]);

    const handleDeleteConfirm = async () => {
        if (!deleteTargetId || isDeleting) return;
        setIsDeleting(true);
        setDeleteError("");
        try {
            await deleteBlog(deleteTargetId);

            setBlogs((prev) => prev.filter((b) => b._id !== deleteTargetId));
            setDeleteTargetId(null);
        } catch (err) {
            if (!err.response) {
                setDeleteError("Network error — could not delete. Please try again.");
            } else if (err.response.status === 403) {
                setDeleteError("You don't have permission to delete this blog.");
            } else if (err.response.status === 404) {
                setBlogs((prev) => prev.filter((b) => b._id !== deleteTargetId));
                setDeleteTargetId(null);
            } else {
                setDeleteError("Could not delete blog. Please try again.");
            }
        } finally {
            setIsDeleting(false);
        }
    };

    if (isLoading) return <Spinner />;

    if (loadError) {
        return (
            <div className="flex flex-col items-center justify-center gap-4 py-24 text-center">
                <p role="alert" className="text-danger text-sm font-medium">{loadError}</p>
                <button onClick={() => setReloadIndex((i) => i + 1)} className="btn-primary text-sm px-4 py-2">Retry</button>
            </div>
        );
    }

    return (
        <div className="mx-auto max-w-6xl">
            <h1 className="mb-6 text-2xl font-bold text-ink sm:text-3xl">Your Blogs</h1>
            {blogs?.length === 0 ? (
                <p className="rounded-xl border border-dashed border-border bg-canvas px-4 py-10 text-center text-sm text-muted">
                    You haven't published any blogs yet. <Link to="/create-blog" className="font-semibold text-brand hover:text-brand-hover">Create one</Link>
                </p>
            ) : (
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {blogs?.map((blog) => (
                        <div key={blog._id} className="flex flex-col gap-2">
                            <BlogCard blog={blog} />
                            <div className="flex items-center justify-between gap-1 rounded-xl border border-border bg-surface px-2 py-1.5 shadow-sm">
                                <Link to={`/edit-blog/${blog._id}`} className="btn-icon-ghost text-muted! hover:bg-canvas! hover:text-brand!">
                                    <Pencil className="w-4 h-4" />
                                </Link>
                                <button
                                    className="btn-icon-ghost text-muted! hover:bg-danger-subtle! hover:text-danger! cursor-pointer"
                                    type="button"
                                    onClick={() => setDeleteTargetId(blog._id)}>
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {deleteError && (
                <p role="alert" aria-live="assertive" className="mt-3 text-sm text-danger">
                    {deleteError}
                </p>
            )}

            <ConfirmDialog
                open={!!deleteTargetId}
                title="Delete blog"
                message="This action cannot be undone. Are you sure you want to delete this blog?"
                onConfirm={handleDeleteConfirm}
                onCancel={() => {
                    setDeleteTargetId(null);
                    setDeleteError("");
                }}
                isProcessing={isDeleting}
            />
        </div>
    );
};

export default MyBlogs;