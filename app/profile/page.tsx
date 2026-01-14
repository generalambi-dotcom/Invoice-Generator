'use client';

import React, { useState, useEffect } from 'react';
import { getCurrentUser } from '@/lib/auth';
import { getCompanyDefaultsAPI, saveCompanyDefaultsAPI } from '@/lib/api-client';
import { CompanyInfo } from '@/types/invoice';

export default function ProfilePage() {
    const [user, setUser] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    // Form State
    const [personalInfo, setPersonalInfo] = useState({
        firstName: '',
        lastName: '',
        email: '',
    });

    const [businessInfo, setBusinessInfo] = useState<CompanyInfo>({
        name: '',
        address: '',
        city: '',
        state: '',
        zip: '',
        country: '',
        phone: '',
        email: '',
        website: '',
        logo: undefined,
    });

    // Extended profile data stored in company info for now
    const [profileImage, setProfileImage] = useState<string | null>(null);

    useEffect(() => {
        const loadData = async () => {
            try {
                const currentUser = getCurrentUser();
                if (currentUser) {
                    setUser(currentUser);
                    // Split name if possible
                    const names = currentUser.name ? currentUser.name.split(' ') : [''];
                    setPersonalInfo({
                        firstName: names[0] || '',
                        lastName: names.slice(1).join(' ') || '',
                        email: currentUser.email || '',
                    });
                }

                const defaults = await getCompanyDefaultsAPI();
                if (defaults && defaults.companyInfo) {
                    setBusinessInfo(defaults.companyInfo as CompanyInfo);
                    // Check if we stored profile image in the "extra" fields of company info
                    // note: we might need to cast to any to access custom fields if TS complains
                    const extraData = defaults.companyInfo as any;
                    if (extraData.profileImage) {
                        setProfileImage(extraData.profileImage);
                    }
                }
            } catch (error) {
                console.error('Error loading profile:', error);
            } finally {
                setIsLoading(false);
            }
        };
        loadData();
    }, []);

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'profile' | 'logo') => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const result = reader.result as string;
                if (type === 'profile') {
                    setProfileImage(result);
                } else {
                    setBusinessInfo(prev => ({ ...prev, logo: result }));
                }
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            // 1. Save Company Defaults (including hacked profile image)
            const companyDataToSave = {
                ...businessInfo,
                profileImage: profileImage // Storing this here for now
            };

            await saveCompanyDefaultsAPI({
                companyInfo: companyDataToSave,
                defaultCurrency: 'NGN', // Preserve or fetch existing? For now default to NGN if missing
                defaultTheme: 'slate',
                defaultTaxRate: 0
            });

            // 2. TODO: Update User Name/Email via separate API if changed
            // For now, we mainly focus on the Business Info which drives the invoices

            alert('Profile updated successfully!');
        } catch (error) {
            console.error('Error saving profile:', error);
            alert('Failed to save profile.');
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return <div className="p-8 text-center text-gray-500">Loading profile...</div>;
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Your Profile</h1>
                <p className="text-gray-600">Manage your personal and business information</p>
            </div>

            {/* Personal Information */}
            <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center gap-2 mb-6">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <h2 className="text-lg font-semibold text-gray-900">Personal Information</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                        <input
                            type="text"
                            value={personalInfo.firstName}
                            onChange={e => setPersonalInfo({ ...personalInfo, firstName: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                        <input
                            type="text"
                            value={personalInfo.lastName}
                            onChange={e => setPersonalInfo({ ...personalInfo, lastName: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                        />
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                        <input
                            type="email"
                            value={personalInfo.email}
                            readOnly
                            className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
                        />
                        <p className="text-xs text-gray-400 mt-1">Email cannot be changed directly.</p>
                    </div>
                </div>
            </section>

            {/* Business Information */}
            <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center gap-2 mb-6">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                    <h2 className="text-lg font-semibold text-gray-900">Business Information</h2>
                </div>

                <div className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Company Name</label>
                        <input
                            type="text"
                            value={businessInfo.name}
                            onChange={e => setBusinessInfo({ ...businessInfo, name: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                            placeholder="e.g. Demi Ventures"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                        <input
                            type="text"
                            value={businessInfo.phone}
                            onChange={e => setBusinessInfo({ ...businessInfo, phone: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                            placeholder="+234..."
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                        <textarea
                            value={businessInfo.address}
                            onChange={e => setBusinessInfo({ ...businessInfo, address: e.target.value })}
                            rows={3}
                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                            placeholder="Business address..."
                        />
                    </div>
                </div>
            </section>

            {/* Profile Images */}
            <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center gap-2 mb-6">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <h2 className="text-lg font-semibold text-gray-900">Profile Images</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Profile Picture */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-4">Profile Picture</label>
                        <div className="flex items-center gap-4">
                            <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden border border-gray-200">
                                {profileImage ? (
                                    <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
                                ) : (
                                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                )}
                            </div>
                            <div>
                                <label className="inline-block px-4 py-2 bg-blue-50 text-blue-600 rounded-lg text-sm font-medium cursor-pointer hover:bg-blue-100 transition-colors">
                                    Choose file
                                    <input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, 'profile')} />
                                </label>
                                <p className="text-xs text-gray-400 mt-1">JPG, PNG or GIF. Max 2MB.</p>
                            </div>
                        </div>
                    </div>

                    {/* Company Logo */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-4">Company Logo</label>
                        <div className="flex items-center gap-4">
                            <div className="w-20 h-20 rounded-lg bg-gray-50 flex items-center justify-center overflow-hidden border border-gray-200">
                                {businessInfo.logo ? (
                                    <img src={businessInfo.logo} alt="Company Logo" className="w-full h-full object-contain p-2" />
                                ) : (
                                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                    </svg>
                                )}
                            </div>
                            <div>
                                <label className="inline-block px-4 py-2 bg-blue-50 text-blue-600 rounded-lg text-sm font-medium cursor-pointer hover:bg-blue-100 transition-colors">
                                    Choose file
                                    <input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, 'logo')} />
                                </label>
                                <p className="text-xs text-gray-400 mt-1">Recommended size: 400x400px</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Save Button */}
            <div className="flex justify-end pt-4">
                <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className={`px-8 py-3 bg-blue-600 text-white rounded-lg font-medium shadow-sm hover:bg-blue-700 focus:ring-4 focus:ring-blue-100 transition-all ${isSaving ? 'opacity-70 cursor-wait' : ''}`}
                >
                    {isSaving ? 'Saving Changes...' : 'Save Changes'}
                </button>
            </div>

            <div className="h-12"></div> {/* Spacer */}
        </div>
    );
}
