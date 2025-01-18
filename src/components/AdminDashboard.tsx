import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Image, Loader2, Trash, Search, X, Edit } from 'lucide-react';
import { useDebounce } from 'use-debounce';
import toast from 'react-hot-toast';

type Submission = {
  id: string;
  name: string;
  social_media_handle: string;
  image_urls: string[];
  created_at: string;
};

export function AdminDashboard() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [filteredSubmissions, setFilteredSubmissions] = useState<Submission[]>([]);
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editData, setEditData] = useState<Submission | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchField, setSearchField] = useState('social_media_handle');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [activeImage, setActiveImage] = useState<string | null>(null);

  const totalPages = Math.ceil(filteredSubmissions.length / itemsPerPage);
  const paginatedSubmissions = filteredSubmissions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const [debouncedSearchQuery] = useDebounce(searchQuery, 300);

  useEffect(() => {
    fetchSubmissions();

    const subscription = supabase
      .channel('user_submissions')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'user_submissions',
        },
        (payload) => {
          setSubmissions((current) => [payload.new as Submission, ...current]);
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchSubmissions = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('user_submissions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setSubmissions(data || []);
      setFilteredSubmissions(data || []);
    } catch (error) {
      console.error('Error fetching submissions:', error);
      toast.error('Failed to fetch submissions.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const filtered = submissions.filter((submission) =>
      submission[searchField].toLowerCase().includes(debouncedSearchQuery.toLowerCase())
    );
    setFilteredSubmissions(filtered);
    setCurrentPage(1);
  }, [debouncedSearchQuery, searchField, submissions]);

  const handleDelete = async (id: string) => {
    setDeleting(true);
    try {
      const { error } = await supabase.from('user_submissions').delete().eq('id', id);

      if (error) throw error;

      setSubmissions((current) => current.filter((submission) => submission.id !== id));
      setFilteredSubmissions((current) => current.filter((submission) => submission.id !== id));
      toast.success('Submission deleted successfully');
    } catch (error) {
      console.error('Error deleting submission:', error);
      toast.error('Failed to delete submission.');
    } finally {
      setDeleting(false);
    }
  };

  const handleEdit = (submission: Submission) => {
    setEditData(submission);
    setEditModalOpen(true);
  };

  const saveEdit = async () => {
    if (!editData) return;

    try {
      const { error } = await supabase
        .from('user_submissions')
        .update({
          name: editData.name,
          social_media_handle: editData.social_media_handle,
        })
        .eq('id', editData.id);

      if (error) throw error;

      setSubmissions((current) =>
        current.map((submission) =>
          submission.id === editData.id ? { ...submission, ...editData } : submission
        )
      );
      setFilteredSubmissions((current) =>
        current.map((submission) =>
          submission.id === editData.id ? { ...submission, ...editData } : submission
        )
      );

      setEditModalOpen(false);
      toast.success('Submission updated successfully!');
    } catch (error) {
      console.error('Error updating submission:', error);
      toast.error('Failed to update submission.');
    }
  };

  const handleImageClick = (url: string) => {
    setActiveImage(url);
    setImageModalOpen(true);
  };

  const closeImageModal = () => {
    setImageModalOpen(false);
    setActiveImage(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center">
          <h1 className="text-3xl font-extrabold text-gray-900">Submissions Dashboard</h1>
        </div>

        <div className="mt-8 flex items-center gap-4">
          <select
            value={searchField}
            onChange={(e) => setSearchField(e.target.value)}
            className="py-2 px-4 rounded-md border border-gray-300"
          >
            <option value="name">Name</option>
            <option value="social_media_handle">Social Media Handle</option>
          </select>
          <input
            type="text"
            placeholder={`Search by ${searchField}`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full py-2 px-4 rounded-md shadow-sm border border-gray-300"
          />
        </div>

        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {paginatedSubmissions.map((submission) => (
            <div
              key={submission.id}
              className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow"
            >
              <h2 className="text-xl font-semibold text-gray-900">{submission.name}</h2>
              <p className="text-sm text-gray-600">@{submission.social_media_handle}</p>
              <p className="mt-2 text-sm text-gray-500">
                Submitted {new Date(submission.created_at).toLocaleDateString()}
              </p>
              <div className="mt-4 grid grid-cols-2 gap-2">
                {submission.image_urls.map((url, index) => (
                  <img
                    key={index}
                    src={url}
                    alt={`Image ${index + 1}`}
                    className="w-20 h-20 object-cover rounded cursor-pointer"
                    onClick={() => handleImageClick(url)}
                  />
                ))}
              </div>
              <div className="mt-4 flex gap-2">
                <button
                  onClick={() => handleDelete(submission.id)}
                  className="text-red-600 hover:text-red-800"
                >
                  <Trash className="inline-block w-4 h-4 mr-1" />
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>

        {imageModalOpen && activeImage && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-4 shadow-lg max-w-3xl w-full relative">
              <button
                onClick={closeImageModal}
                className="absolute top-2 right-2 text-gray-600 hover:text-gray-800"
              >
                <X className="w-6 h-6" />
              </button>
              <img src={activeImage} alt="Selected View" className="w-auto h-auto rounded-md" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
