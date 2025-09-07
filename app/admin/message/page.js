// app/admin/messages/page.js
'use client';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  TrashIcon,
  EnvelopeIcon,
  EnvelopeOpenIcon,
  MagnifyingGlassIcon,
  PhoneIcon,
} from '@heroicons/react/24/outline';
import { FaWhatsapp, FaEnvelope } from 'react-icons/fa';
import toast from 'react-hot-toast';
import ConfirmationDialog from '@/components/ui/ConfirmationDialog';

export default function AdminMessagesPage() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteMessage, setDeleteMessage] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const fetchMessages = () => {
    setLoading(true);
    fetch('/api/admin/message')
      .then((res) => res.json())
      .then((data) => {
        setMessages(Array.isArray(data) ? data : []);
      })
      .catch(() => setError('Failed to load messages'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  const handleDelete = async (id) => {
    try {
      const response = await fetch(`/api/admin/message/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Delete failed');
      toast.success('Message deleted');
      fetchMessages();
    } catch (err) {
      toast.error('Failed to delete');
    }
  };

  const toggleReadStatus = async (id, isRead) => {
    try {
      const response = await fetch(`/api/admin/message/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isRead: !isRead }),
      });
      if (!response.ok) throw new Error('Update failed');
      toast.success(`Marked as ${!isRead ? 'read' : 'unread'}`);
      fetchMessages();
    } catch (err) {
      toast.error('Failed to update');
    }
  };

  const filteredMessages = messages.filter((msg) => {
    const matchesSearch =
      msg.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      msg.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      msg.message?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'read' && msg.isRead) ||
      (statusFilter === 'unread' && !msg.isRead);

    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="admin-page">
        <div className="flex items-center justify-center min-h-screen">
          <div className="admin-card text-center">
            <div className="spinner mx-auto mb-4"></div>
            <p className="text-neutral-600">Loading messages...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-page">
        <div className="flex items-center justify-center min-h-screen">
          <div className="admin-card text-center">
            <p className="text-error-600">{error}</p>
            <button onClick={fetchMessages} className="btn-primary mt-4">
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <div className="max-w-7xl mx-auto p-0 md:p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="admin-header">Messages</h1>
          <p className="admin-subheader">Manage customer messages</p>
        </div>

        {/* Controls */}
        <div className="admin-card mb-8 flex flex-col md:flex-row gap-4 justify-between items-center">
          <div className="flex w-full md:w-auto items-center gap-2">
            <MagnifyingGlassIcon className="w-5 h-5 text-neutral-400" />
            <input
              type="text"
              placeholder="Search messages..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full md:w-64"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full md:w-32"
          >
            <option value="all">All</option>
            <option value="read">Read</option>
            <option value="unread">Unread</option>
          </select>
        </div>

        {/* Confirmation Dialog for Delete */}
        <ConfirmationDialog
          isOpen={showDeleteConfirm}
          onClose={() => setShowDeleteConfirm(false)}
          onConfirm={() => {
            if (deleteMessage) {
              handleDelete(deleteMessage._id);
            }
            setShowDeleteConfirm(false);
          }}
          title="Confirm Deletion"
          message={`Are you sure you want to delete this message from "${deleteMessage?.name}"?`}
          confirmText="Delete"
          cancelText="Cancel"
        />

        {/* Messages Grid */}
        {filteredMessages.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {filteredMessages.map((msg, index) => (
                <motion.div
                  key={msg._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.05 }}
                  className="card card-hover"
                >
                  <div className="p-4 flex flex-col h-full">
                    {/* Header */}
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold text-lg">{msg.name}</h3>
                      <span
                        className={`badge-new ${
                          msg.isRead
                            ? 'bg-success-100 text-success-700'
                            : 'bg-warning-100 text-warning-700'
                        }`}
                      >
                        {msg.isRead ? 'Read' : 'Unread'}
                      </span>
                    </div>

                    {/* Contact Icons */}
                    <div className="flex gap-3 mb-4">
                      {/* Call */}
                      {msg.phone && (
                        <a
                          href={`tel:${msg.phone}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-neutral-500 hover:text-primary-600"
                          title="Call"
                        >
                          <PhoneIcon className="w-5 h-5" />
                        </a>
                      )}

                      {/* WhatsApp */}
                      {msg.phone && (
                        <a
                          href={`https://wa.me/${msg.phone}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-green-600 hover:text-green-700"
                          title="WhatsApp"
                        >
                          <FaWhatsapp className="w-5 h-5" />
                        </a>
                      )}

                      {/* Email */}
                      {msg.email && (
                        <a
                          href={`mailto:${msg.email}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-700"
                          title="Email"
                        >
                          <FaEnvelope className="w-5 h-5" />
                        </a>
                      )}
                    </div>

                    <p className="text-neutral-700 mb-4 line-clamp-3">
                      {msg.message}
                    </p>
                    <p className="text-xs text-neutral-400 mb-4">
                      {new Date(msg.createdAt).toLocaleString()}
                    </p>

                    {/* Actions */}
                    <div className="flex gap-2 mt-auto">
                      <button
                        onClick={() => toggleReadStatus(msg._id, msg.isRead)}
                        className="flex-1 btn-outline py-2 text-sm flex items-center justify-center gap-1"
                      >
                        {msg.isRead ? (
                          <>
                            <EnvelopeIcon className="w-4 h-4" />
                            Mark Unread
                          </>
                        ) : (
                          <>
                            <EnvelopeOpenIcon className="w-4 h-4" />
                            Mark Read
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => {
                          setDeleteMessage(msg);
                          setShowDeleteConfirm(true);
                        }}
                        className="btn-outline py-2 text-sm text-error-600 border-error-300 hover:border-error-500 hover:text-error-700 flex items-center justify-center gap-1"
                      >
                        <TrashIcon className="w-4 h-4" />
                        Delete
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        ) : (
          <div className="admin-card text-center">
            <p className="text-neutral-600">No messages found</p>
          </div>
        )}
      </div>
    </div>
  );
}
