// Settings management page
'use client';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  CogIcon, 
  SaveIcon, 
  CheckIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';
import { AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState({
    siteName: 'Anabeya Collection',
    siteDescription: 'Premium Handmade Clothing',
    contactEmail: 'contact@anabeya.com',
    contactPhone: '+1 (555) 123-4567',
    address: '123 Fashion Street, Style City, SC 12345',
    currency: 'USD',
    taxRate: '8.5',
    shippingCost: '5.99',
    freeShippingThreshold: '50.00',
    maintenanceMode: false,
    allowGuestCheckout: true,
    requireEmailVerification: true,
    maxItemsPerOrder: '10',
    returnPolicy: '30 days',
    socialMedia: {
      facebook: 'https://facebook.com/anabeya',
      instagram: 'https://instagram.com/anabeya',
      twitter: 'https://twitter.com/anabeya'
    }
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [originalSettings, setOriginalSettings] = useState({});

  useEffect(() => {
    fetchSettings();
  }, []);

  useEffect(() => {
    // Check if settings have changed
    setHasChanges(JSON.stringify(settings) !== JSON.stringify(originalSettings));
  }, [settings, originalSettings]);

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/admin/settings');
      if (!response.ok) throw new Error('Failed to load settings');
      
      const data = await response.json();
      if (data && Object.keys(data).length > 0) {
        // Ensure socialMedia object exists with default values
        const settingsWithDefaults = {
          ...settings, // Start with our default settings
          ...data, // Override with API data
          socialMedia: {
            facebook: 'https://facebook.com/anabeya',
            instagram: 'https://instagram.com/anabeya',
            twitter: 'https://twitter.com/anabeya',
            ...(data.socialMedia || {}) // Merge with API socialMedia if it exists
          }
        };
        setSettings(settingsWithDefaults);
        setOriginalSettings(settingsWithDefaults);
      }
    } catch (err) {
      console.error('Error loading settings:', err);
      setError('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (key, value) => {
    setSettings(prev => {
      const newSettings = { ...prev };
      
      // Handle nested objects like socialMedia
      if (key.includes('.')) {
        const [parent, child] = key.split('.');
        // Ensure the parent object exists
        if (!newSettings[parent]) {
          newSettings[parent] = {};
        }
        newSettings[parent] = { ...newSettings[parent], [child]: value };
      } else {
        newSettings[key] = value;
      }
      
      return newSettings;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSuccess(false);
    
    try {
      const response = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update settings');
      }
      
      setOriginalSettings(settings);
      setHasChanges(false);
      setSuccess(true);
      
      // Hide success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      setError('Failed to update settings');
      setTimeout(() => setError(''), 5000);
    } finally {
      setSaving(false);
    }
  };

  const resetToDefault = () => {
    if (window.confirm('Are you sure you want to reset all settings to default values? This action cannot be undone.')) {
      const defaultSettings = {
        siteName: 'Anabeya Collection',
        siteDescription: 'Premium Handmade Clothing',
        contactEmail: 'contact@anabeya.com',
        contactPhone: '+1 (555) 123-4567',
        address: '123 Fashion Street, Style City, SC 12345',
        currency: 'USD',
        taxRate: '8.5',
        shippingCost: '5.99',
        freeShippingThreshold: '50.00',
        maintenanceMode: false,
        allowGuestCheckout: true,
        requireEmailVerification: true,
        maxItemsPerOrder: '10',
        returnPolicy: '30 days',
        socialMedia: {
          facebook: 'https://facebook.com/anabeya',
          instagram: 'https://instagram.com/anabeya',
          twitter: 'https://twitter.com/anabeya'
        }
      };
      
      setSettings(defaultSettings);
      setHasChanges(true);
    }
  };

  if (loading) {
    return (
      <div className="admin-page">
        <div className="flex items-center justify-center min-h-screen">
          <div className="admin-card text-center">
            <div className="spinner mx-auto mb-4"></div>
            <p className="text-neutral-600">Loading settings...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="admin-header">Site Settings</h1>
          <p className="admin-subheader">Configure your website settings and preferences</p>
        </div>

        {/* Success/Error Messages */}
        <AnimatePresence>
          {success && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="admin-card border-l-4 border-l-success-500 bg-success-50 mb-6"
            >
              <div className="flex items-center gap-3">
                <CheckIcon className="w-6 h-6 text-success-600" />
                <p className="text-success-800 font-medium">Settings updated successfully!</p>
              </div>
            </motion.div>
          )}

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="admin-card border-l-4 border-l-error-500 bg-error-50 mb-6"
            >
              <div className="flex items-center gap-3">
                <ExclamationTriangleIcon className="w-6 h-6 text-error-600" />
                <p className="text-error-800 font-medium">{error}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="admin-card"
          >
            <div className="flex items-center gap-3 mb-6">
              <CogIcon className="w-6 h-6 text-primary-600" />
              <h2 className="text-xl font-semibold text-neutral-900">Basic Information</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="form-label">Site Name *</label>
                <input
                  type="text"
                  value={settings.siteName}
                  onChange={e => handleChange('siteName', e.target.value)}
                  required
                  className="w-full"
                />
              </div>
              
              <div>
                <label className="form-label">Site Description</label>
                <input
                  type="text"
                  value={settings.siteDescription}
                  onChange={e => handleChange('siteDescription', e.target.value)}
                  className="w-full"
                />
              </div>
              
              <div>
                <label className="form-label">Contact Email *</label>
                <input
                  type="email"
                  value={settings.contactEmail}
                  onChange={e => handleChange('contactEmail', e.target.value)}
                  required
                  className="w-full"
                />
              </div>
              
              <div>
                <label className="form-label">Contact Phone</label>
                <input
                  type="tel"
                  value={settings.contactPhone}
                  onChange={e => handleChange('contactPhone', e.target.value)}
                  className="w-full"
                />
              </div>
              
              <div className="md:col-span-2">
                <label className="form-label">Business Address</label>
                <textarea
                  value={settings.address}
                  onChange={e => handleChange('address', e.target.value)}
                  className="w-full h-20 resize-none"
                />
              </div>
            </div>
          </motion.div>

          {/* E-commerce Settings */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="admin-card"
          >
            <div className="flex items-center gap-3 mb-6">
              <CogIcon className="w-6 h-6 text-secondary-600" />
              <h2 className="text-xl font-semibold text-neutral-900">E-commerce Settings</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="form-label">Currency</label>
                <select
                  value={settings.currency}
                  onChange={e => handleChange('currency', e.target.value)}
                  className="w-full"
                >
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                  <option value="CAD">CAD (C$)</option>
                </select>
              </div>
              
              <div>
                <label className="form-label">Tax Rate (%)</label>
                <input
                  type="number"
                  value={settings.taxRate}
                  onChange={e => handleChange('taxRate', e.target.value)}
                  min="0"
                  max="100"
                  step="0.1"
                  className="w-full"
                />
              </div>
              
              <div>
                <label className="form-label">Shipping Cost ($)</label>
                <input
                  type="number"
                  value={settings.shippingCost}
                  onChange={e => handleChange('shippingCost', e.target.value)}
                  min="0"
                  step="0.01"
                  className="w-full"
                />
              </div>
              
              <div>
                <label className="form-label">Free Shipping Threshold ($)</label>
                <input
                  type="number"
                  value={settings.freeShippingThreshold}
                  onChange={e => handleChange('freeShippingThreshold', e.target.value)}
                  min="0"
                  step="0.01"
                  className="w-full"
                />
              </div>
              
              <div>
                <label className="form-label">Max Items Per Order</label>
                <input
                  type="number"
                  value={settings.maxItemsPerOrder}
                  onChange={e => handleChange('maxItemsPerOrder', e.target.value)}
                  min="1"
                  className="w-full"
                />
              </div>
              
              <div>
                <label className="form-label">Return Policy (days)</label>
                <input
                  type="number"
                  value={settings.returnPolicy}
                  onChange={e => handleChange('returnPolicy', e.target.value)}
                  min="0"
                  className="w-full"
                />
              </div>
            </div>
          </motion.div>

          {/* Site Configuration */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="admin-card"
          >
            <div className="flex items-center gap-3 mb-6">
              <CogIcon className="w-6 h-6 text-warning-600" />
              <h2 className="text-xl font-semibold text-neutral-900">Site Configuration</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.maintenanceMode}
                  onChange={e => handleChange('maintenanceMode', e.target.checked)}
                  className="w-4 h-4 text-primary-600"
                />
                <span className="font-medium">Maintenance Mode</span>
                <InformationCircleIcon className="w-4 h-4 text-neutral-400" title="Site will be unavailable to visitors" />
              </label>
              
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.allowGuestCheckout}
                  onChange={e => handleChange('allowGuestCheckout', e.target.checked)}
                  className="w-4 h-4 text-primary-600"
                />
                <span className="font-medium">Allow Guest Checkout</span>
                <InformationCircleIcon className="w-4 h-4 text-neutral-400" title="Visitors can checkout without creating an account" />
              </label>
              
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.requireEmailVerification}
                  onChange={e => handleChange('requireEmailVerification', e.target.checked)}
                  className="w-4 h-4 text-primary-600"
                />
                <span className="font-medium">Require Email Verification</span>
                <InformationCircleIcon className="w-4 h-4 text-neutral-400" title="Users must verify their email before accessing the site" />
              </label>
            </div>
          </motion.div>

          {/* Social Media */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="admin-card"
          >
            <div className="flex items-center gap-3 mb-6">
              <CogIcon className="w-6 h-6 text-success-600" />
              <h2 className="text-xl font-semibold text-neutral-900">Social Media Links</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="form-label">Facebook URL</label>
                <input
                  type="url"
                  value={settings.socialMedia.facebook}
                  onChange={e => handleChange('socialMedia.facebook', e.target.value)}
                  placeholder="https://facebook.com/yourpage"
                  className="w-full"
                />
              </div>
              
              <div>
                <label className="form-label">Instagram URL</label>
                <input
                  type="url"
                  value={settings.socialMedia.instagram}
                  onChange={e => handleChange('socialMedia.instagram', e.target.value)}
                  placeholder="https://instagram.com/yourpage"
                  className="w-full"
                />
              </div>
              
              <div>
                <label className="form-label">Twitter URL</label>
                <input
                  type="url"
                  value={settings.socialMedia.twitter}
                  onChange={e => handleChange('socialMedia.twitter', e.target.value)}
                  placeholder="https://twitter.com/yourpage"
                  className="w-full"
                />
              </div>
            </div>
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-4 justify-between items-center"
          >
            <div className="flex gap-3">
              <button
                type="button"
                onClick={resetToDefault}
                className="btn-outline text-warning-600 border-warning-300 hover:border-warning-500 hover:text-warning-700"
              >
                Reset to Default
              </button>
              
              {hasChanges && (
                <span className="text-sm text-neutral-500 flex items-center gap-2">
                  <InformationCircleIcon className="w-4 h-4" />
                  You have unsaved changes
                </span>
              )}
            </div>
            
            <div className="flex gap-3">
              <button
                type="submit"
                className="btn-primary"
                disabled={saving || !hasChanges}
              >
                {saving ? (
                  <div className="flex items-center gap-2">
                    <div className="spinner w-4 h-4"></div>
                    Saving...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    {/* <SaveIcon className="w-5 h-5" /> */}
                    Save Settings
                  </div>
                )}
              </button>
            </div>
          </motion.div>
        </form>
      </div>
    </div>
  );
}