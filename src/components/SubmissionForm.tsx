import React, { useState } from 'react';
import { Upload, Loader2, Shield } from 'lucide-react';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';

export function SubmissionForm() {
  const [name, setName] = useState('');
  const [handle, setHandle] = useState('');
  const [files, setFiles] = useState<FileList | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploaded, setIsUploaded] = useState(false);
  const [formKey, setFormKey] = useState(0); // Key to force re-render the form

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFiles(e.target.files);
    setIsUploaded(false); // Allow new uploads
  };

  const resetForm = () => {
    setName('');
    setHandle('');
    setFiles(null);
    setIsUploaded(false);
    setFormKey((prevKey) => prevKey + 1); // Force form re-render
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!files || files.length === 0) {
      toast.error('Please select at least one image');
      return;
    }

    for (let file of files) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error(`File ${file.name} exceeds the size limit of 10MB.`);
        return;
      }
    }

    setIsSubmitting(true);
    try {
      const imageUrls = await Promise.all(
        Array.from(files).map(async (file) => {
          const fileName = `${Date.now()}-${file.name}`;
          const { data, error: uploadError } = await supabase.storage
            .from('submissions')
            .upload(fileName, file);

          if (uploadError) throw uploadError;

          const { data: { publicUrl }, error: urlError } = supabase.storage
            .from('submissions')
            .getPublicUrl(fileName);

          if (urlError) throw urlError;

          return publicUrl;
        })
      );

      const { error: dbError } = await supabase
        .from('user_submissions')
        .insert({
          name,
          social_media_handle: handle,
          image_urls: imageUrls,
        });

      if (dbError) throw dbError;

      toast.success('Submission successful!');
      resetForm(); // Reset the form after successful submission
    } catch (error) {
      console.error('Error:', error);
      toast.error('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900">Submit Your Content</h2>
          <p className="mt-2 text-sm text-gray-600">
            Share your social media content with us
          </p>
        </div>

        <form
          key={formKey} // Use key to force re-render
          onSubmit={handleSubmit}
          className="mt-8 space-y-6 bg-white p-8 shadow rounded-lg"
        >
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              Name
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="mt-1 block w-full rounded-md shadow-sm"
            />
          </div>

          <div>
            <label htmlFor="handle" className="block text-sm font-medium text-gray-700">
              Social Media Handle
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-gray-500 sm:text-sm">@</span>
              </div>
              <input
                type="text"
                id="handle"
                value={handle}
                onChange={(e) => setHandle(e.target.value)}
                required
                className="block w-full pl-8 rounded-md"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Images</label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md hover:border-indigo-500 transition-colors">
              <div className="space-y-1 text-center">
                {!isUploaded && (
                  <>
                    <Upload className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="flex text-sm text-gray-600">
                      <label htmlFor="images" className="relative cursor-pointer rounded-md font-medium text-indigo-600 hover:text-indigo-500">
                        <span>Upload files</span>
                        <input
                          id="images"
                          type="file"
                          multiple
                          accept="image/*"
                          className="sr-only"
                          onChange={handleFileChange}
                        />
                      </label>
                    </div>
                    <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB each</p>
                  </>
                )}
                {files && !isUploaded && (
                  <>
                    <p className="text-sm text-gray-600">
                      {files.length} {files.length === 1 ? 'file' : 'files'} selected
                    </p>
                    <div className="mt-2 flex flex-wrap">
                      {Array.from(files).map((file, index) => (
                        <img
                          key={index}
                          src={URL.createObjectURL(file)}
                          alt="Preview"
                          className="w-20 h-20 object-cover m-1"
                        />
                      ))}
                    </div>
                  </>
                )}
                {isUploaded && <p className="text-sm text-green-600">Files uploaded successfully!</p>}
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" />
                Submitting...
              </>
            ) : (
              'Submit'
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link
            to="/login"
            className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700"
          >
            <Shield className="h-4 w-4 mr-1" />
            Admin Login
          </Link>
        </div>
      </div>
    </div>
  );
}
