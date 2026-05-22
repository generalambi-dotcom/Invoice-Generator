'use client';

import React, { useState, useEffect } from 'react';
import { getCurrentUser } from '@/lib/auth';
import { getCompanyDefaultsAPI, saveCompanyDefaultsAPI, getUserProfileAPI, updateUserProfileAPI } from '@/lib/api-client';
import { CompanyInfo, Currency, currencySymbols } from '@/types/invoice';
import { toast } from 'react-hot-toast';
import ProfileCompletenessCard from '@/components/ProfileCompletenessCard';
import {
  INDUSTRY_OPTIONS,
  COMPANY_SIZE_OPTIONS,
} from '@/lib/profile-completeness';
import { getRegionConfig } from '@/lib/regionalization';

export default function ProfilePage() {
    const [user, setUser] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [defaultCurrency, setDefaultCurrency] = useState<Currency>('USD');

    // Profile completeness data
    const [completenessData, setCompletenessData] = useState<any>(null);

    // Form State - Personal
    const [personalInfo, setPersonalInfo] = useState({
        firstName: '',
        lastName: '',
        email: '',
    });

    // Form State - Business (existing company info)
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

    // Form State - Lead Gen Profile fields
    const [profileFields, setProfileFields] = useState({
        industry: '',
        businessType: '',
        companySize: '',
        monthlyRevenueRange: '',
        yearFounded: '',
        cacNumber: '',
        tinNumber: '',
        linkedinUrl: '',
        instagramUrl: '',
        twitterUrl: '',
    });

    // Profile image
    const [profileImage, setProfileImage] = useState<string | null>(null);

    useEffect(() => {
        const loadData = async () => {
            try {
                const currentUser = getCurrentUser();
                if (currentUser) {
                    setUser(currentUser);
                    const names = currentUser.name ? currentUser.name.split(' ') : [''];
                    setPersonalInfo({
                        firstName: names[0] || '',
                        lastName: names.slice(1).join(' ') || '',
                        email: currentUser.email || '',
                    });
                }

                // Load company defaults
                const defaults = await getCompanyDefaultsAPI();
                if (defaults) {
                    if (defaults.companyInfo) {
                        setBusinessInfo(defaults.companyInfo as CompanyInfo);
                        const extraData = defaults.companyInfo as any;
                        if (extraData.profileImage) {
                            setProfileImage(extraData.profileImage);
                        }
                    }
                    if (defaults.defaultCurrency) {
                        setDefaultCurrency(defaults.defaultCurrency as Currency);
                    }
                }

                // Load profile data including lead gen fields + completeness
                try {
                    const profileData = await getUserProfileAPI();
                    if (profileData?.user) {
                        setProfileFields({
                            industry: profileData.user.industry || '',
                            businessType: profileData.user.businessType || '',
                            companySize: profileData.user.companySize || '',
                            monthlyRevenueRange: profileData.user.monthlyRevenueRange || '',
                            yearFounded: profileData.user.yearFounded?.toString() || '',
                            cacNumber: profileData.user.cacNumber || '',
                            tinNumber: profileData.user.tinNumber || '',
                            linkedinUrl: profileData.user.linkedinUrl || '',
                            instagramUrl: profileData.user.instagramUrl || '',
                            twitterUrl: profileData.user.twitterUrl || '',
                        });
                    }
                    if (profileData?.completeness) {
                        setCompletenessData(profileData.completeness);
                    }
                } catch (err) {
                    console.error('Error loading profile data:', err);
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
        if (!businessInfo.name.trim()) {
            toast.error('Company Name is required');
            return;
        }

        setIsSaving(true);
        try {
            // 1. Save Company Defaults (including hacked profile image)
            const companyDataToSave = {
                ...businessInfo,
                profileImage: profileImage
            };

            await saveCompanyDefaultsAPI({
                companyInfo: companyDataToSave,
                defaultCurrency: defaultCurrency,
                defaultTheme: 'slate',
                defaultTaxRate: 0
            });

            // 2. Save lead gen profile fields
            await updateUserProfileAPI({
                industry: profileFields.industry || null,
                businessType: profileFields.businessType || null,
                companySize: profileFields.companySize || null,
                monthlyRevenueRange: profileFields.monthlyRevenueRange || null,
                yearFounded: profileFields.yearFounded || null,
                cacNumber: profileFields.cacNumber || null,
                tinNumber: profileFields.tinNumber || null,
                linkedinUrl: profileFields.linkedinUrl || null,
                instagramUrl: profileFields.instagramUrl || null,
                twitterUrl: profileFields.twitterUrl || null,
            });

            // 3. Refresh completeness data
            try {
                const profileData = await getUserProfileAPI();
                if (profileData?.completeness) {
                    setCompletenessData(profileData.completeness);
                }
            } catch (err) {
                // non-critical
            }

            toast.success('Profile updated successfully!');
        } catch (error) {
            console.error('Error saving profile:', error);
            toast.error('Failed to save profile.');
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return <div className="p-8 text-center text-gray-500">Loading profile...</div>;
    }

    const regionConfig = getRegionConfig(defaultCurrency);

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Your Profile</h1>
                <p className="text-gray-600">Manage your personal and business information</p>
            </div>

            {/* Profile Completeness Card */}
            {completenessData && (
                <ProfileCompletenessCard
                    score={completenessData.score}
                    currentTier={completenessData.currentTier}
                    nextTier={completenessData.nextTier}
                    missingFields={completenessData.missingFields}
                />
            )}

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
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Company Name <span className="text-red-500">*</span></label>
                            <input
                                type="text"
                                value={businessInfo.name}
                                onChange={e => setBusinessInfo({ ...businessInfo, name: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                placeholder="e.g. Demi Ventures"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Default Currency</label>
                            <select
                                value={defaultCurrency}
                                onChange={(e) => setDefaultCurrency(e.target.value as Currency)}
                                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                            >
                                {Object.entries(currencySymbols).map(([code, symbol]) => (
                                    <option key={code} value={code}>
                                        {code} ({symbol})
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                            <label className="block text-sm font-medium text-gray-700 mb-2">Website</label>
                            <input
                                type="url"
                                value={businessInfo.website}
                                onChange={e => setBusinessInfo({ ...businessInfo, website: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                placeholder="https://example.com"
                            />
                        </div>
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

            {/* Business Profile (Lead Gen Fields) */}
            <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center gap-2 mb-2">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <h2 className="text-lg font-semibold text-gray-900">Business Profile</h2>
                </div>
                <p className="text-xs text-gray-500 mb-6">These details help us personalise your experience and unlock insights.</p>

                <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Industry</label>
                            <select
                                value={profileFields.industry}
                                onChange={e => setProfileFields({ ...profileFields, industry: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all bg-white"
                            >
                                <option value="">Select your industry</option>
                                {INDUSTRY_OPTIONS.map(opt => (
                                    <option key={opt} value={opt}>{opt}</option>
                                ))}
                            </select>
                            <p className="text-xs text-gray-400 mt-1">Get industry-specific invoice templates</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Business Type</label>
                            <select
                                value={profileFields.businessType}
                                onChange={e => setProfileFields({ ...profileFields, businessType: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all bg-white"
                            >
                                <option value="">Select type</option>
                                {regionConfig.businessTypes.map((opt: any) => (
                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                ))}
                            </select>
                            <p className="text-xs text-gray-400 mt-1">Helps format your tax information</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Company Size</label>
                            <select
                                value={profileFields.companySize}
                                onChange={e => setProfileFields({ ...profileFields, companySize: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all bg-white"
                            >
                                <option value="">Select size</option>
                                {COMPANY_SIZE_OPTIONS.map(opt => (
                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                ))}
                            </select>
                            <p className="text-xs text-gray-400 mt-1">Helps recommend the right plan</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Monthly Revenue Range</label>
                            <select
                                value={profileFields.monthlyRevenueRange}
                                onChange={e => setProfileFields({ ...profileFields, monthlyRevenueRange: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all bg-white"
                            >
                                <option value="">Select range</option>
                                {regionConfig.revenueRanges.map((opt: any) => (
                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                ))}
                            </select>
                            <p className="text-xs text-gray-400 mt-1">Unlock personalised financial insights</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Year Founded</label>
                            <input
                                type="number"
                                value={profileFields.yearFounded}
                                onChange={e => setProfileFields({ ...profileFields, yearFounded: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                placeholder="e.g. 2020"
                                min="1900"
                                max={new Date().getFullYear()}
                            />
                            <p className="text-xs text-gray-400 mt-1">Get your business anniversary badge</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Registration & Tax */}
            <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center gap-2 mb-2">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                    <h2 className="text-lg font-semibold text-gray-900">Registration & Tax</h2>
                    <span className="px-2 py-0.5 bg-blue-50 text-blue-600 text-[10px] font-semibold rounded-full">Earn Verified Badge</span>
                </div>
                <p className="text-xs text-gray-500 mb-6">Add these to get a &quot;Verified Business&quot; badge on all your invoices.</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            {regionConfig.registrationLabel}
                            <span className="ml-1 text-xs text-gray-400 font-normal">(Registration)</span>
                        </label>
                        <input
                            type="text"
                            value={profileFields.cacNumber}
                            onChange={e => setProfileFields({ ...profileFields, cacNumber: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                            placeholder="e.g. RC-1234567"
                        />
                        <p className="text-xs text-gray-400 mt-1">Auto-fills on invoices for a professional look</p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            {regionConfig.taxIdLabel}
                        </label>
                        <input
                            type="text"
                            value={profileFields.tinNumber}
                            onChange={e => setProfileFields({ ...profileFields, tinNumber: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                            placeholder="e.g. 12345678-0001"
                        />
                        <p className="text-xs text-gray-400 mt-1">Required for VAT invoices - add once, use forever</p>
                    </div>
                </div>
            </section>

            {/* Social & Web */}
            <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center gap-2 mb-6">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                    </svg>
                    <h2 className="text-lg font-semibold text-gray-900">Social & Web Presence</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">LinkedIn</label>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M19 3a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h14m-.5 15.5v-5.3a3.26 3.26 0 00-3.26-3.26c-.85 0-1.84.52-2.32 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 011.4 1.4v4.93h2.79M6.88 8.56a1.68 1.68 0 001.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 00-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z"/></svg>
                            </span>
                            <input
                                type="url"
                                value={profileFields.linkedinUrl}
                                onChange={e => setProfileFields({ ...profileFields, linkedinUrl: e.target.value })}
                                className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                placeholder="https://linkedin.com/in/..."
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Instagram</label>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M7.8 2h8.4C19.4 2 22 4.6 22 7.8v8.4a5.8 5.8 0 01-5.8 5.8H7.8C4.6 22 2 19.4 2 16.2V7.8A5.8 5.8 0 017.8 2m-.2 2A3.6 3.6 0 004 7.6v8.8C4 18.39 5.61 20 7.6 20h8.8a3.6 3.6 0 003.6-3.6V7.6C20 5.61 18.39 4 16.4 4H7.6m9.65 1.5a1.25 1.25 0 110 2.5 1.25 1.25 0 010-2.5M12 7a5 5 0 110 10 5 5 0 010-10m0 2a3 3 0 100 6 3 3 0 000-6z"/></svg>
                            </span>
                            <input
                                type="url"
                                value={profileFields.instagramUrl}
                                onChange={e => setProfileFields({ ...profileFields, instagramUrl: e.target.value })}
                                className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                placeholder="https://instagram.com/..."
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Twitter / X</label>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                            </span>
                            <input
                                type="url"
                                value={profileFields.twitterUrl}
                                onChange={e => setProfileFields({ ...profileFields, twitterUrl: e.target.value })}
                                className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                placeholder="https://x.com/..."
                            />
                        </div>
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

            {/* ── Two-Factor Authentication ── */}
            <TwoFactorSection />

            <div className="h-12"></div> {/* Spacer */}
        </div>
    );
}

// ── 2FA sub-component ──────────────────────────────────────────────────────────

function TwoFactorSection() {
    const [status, setStatus] = useState<'idle' | 'setup' | 'enabled'>('idle');
    const [loading, setLoading] = useState(true);
    const [secret, setSecret] = useState('');
    const [qrCodeUrl, setQrCodeUrl] = useState('');
    const [code, setCode] = useState('');
    const [disableCode, setDisableCode] = useState('');
    const [saving, setSaving] = useState(false);
    const [showDisable, setShowDisable] = useState(false);

    const token = () => typeof window !== 'undefined' ? localStorage.getItem('auth_token') : '';
    const headers = () => ({ 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` });

    React.useEffect(() => {
        // Check current 2FA status from the /api/auth/me endpoint
        fetch('/api/auth/me', { headers: { Authorization: `Bearer ${token()}` } })
            .then(r => r.json())
            .then(data => {
                setStatus(data.user?.twoFactorEnabled ? 'enabled' : 'idle');
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    const startSetup = async () => {
        setSaving(true);
        try {
            const res = await fetch('/api/auth/2fa/setup', { method: 'POST', headers: headers() });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            setSecret(data.secret);
            setQrCodeUrl(data.qrCodeUrl);
            setCode('');
            setStatus('setup');
        } catch (err: any) {
            toast.error(err.message);
        } finally {
            setSaving(false);
        }
    };

    const confirmEnable = async () => {
        if (code.length !== 6) { toast.error('Enter the 6-digit code'); return; }
        setSaving(true);
        try {
            const res = await fetch('/api/auth/2fa/enable', {
                method: 'POST', headers: headers(),
                body: JSON.stringify({ code }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            toast.success('2FA enabled! Your account is now more secure.');
            setStatus('enabled');
            setCode('');
        } catch (err: any) {
            toast.error(err.message);
        } finally {
            setSaving(false);
        }
    };

    const confirmDisable = async () => {
        if (!disableCode) { toast.error('Enter your authenticator code to confirm'); return; }
        setSaving(true);
        try {
            const res = await fetch('/api/auth/2fa/disable', {
                method: 'POST', headers: headers(),
                body: JSON.stringify({ code: disableCode }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            toast.success('2FA disabled.');
            setStatus('idle');
            setShowDisable(false);
            setDisableCode('');
        } catch (err: any) {
            toast.error(err.message);
        } finally {
            setSaving(false);
        }
    };

    if (loading) return null;

    return (
        <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                    <h2 className="text-lg font-semibold text-gray-900">Two-Factor Authentication</h2>
                    <p className="text-sm text-gray-500 mt-1">
                        Add an extra layer of security. You'll need your authenticator app every time you sign in.
                    </p>
                </div>
                <span className={`shrink-0 inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                    status === 'enabled' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'
                }`}>
                    {status === 'enabled' ? '✓ Enabled' : 'Disabled'}
                </span>
            </div>

            {status === 'idle' && (
                <button
                    onClick={startSetup}
                    disabled={saving}
                    className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-60 transition-colors"
                >
                    {saving ? 'Setting up…' : 'Set Up 2FA'}
                </button>
            )}

            {status === 'setup' && (
                <div className="space-y-5">
                    <p className="text-sm text-gray-600">
                        <strong>Step 1.</strong> Scan this QR code with Google Authenticator, Authy, or any TOTP app.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-6 items-start">
                        {qrCodeUrl && (
                            <img src={qrCodeUrl} alt="2FA QR Code" className="w-48 h-48 border border-gray-200 rounded-xl" />
                        )}
                        <div>
                            <p className="text-xs text-gray-500 mb-1">Or enter this code manually:</p>
                            <code className="block text-sm font-mono bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 break-all select-all">
                                {secret}
                            </code>
                        </div>
                    </div>
                    <p className="text-sm text-gray-600">
                        <strong>Step 2.</strong> Enter the 6-digit code shown in your app to confirm setup.
                    </p>
                    <div className="flex items-center gap-3 flex-wrap">
                        <input
                            type="text"
                            inputMode="numeric"
                            maxLength={6}
                            value={code}
                            onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                            placeholder="000000"
                            className="w-36 px-3 py-2 border border-gray-300 rounded-lg text-center text-xl font-mono tracking-widest focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <button
                            onClick={confirmEnable}
                            disabled={saving || code.length !== 6}
                            className="px-4 py-2 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-700 disabled:opacity-60 transition-colors"
                        >
                            {saving ? 'Verifying…' : 'Confirm & Enable'}
                        </button>
                        <button onClick={() => { setStatus('idle'); setCode(''); }}
                            className="text-sm text-gray-500 hover:text-gray-700">
                            Cancel
                        </button>
                    </div>
                </div>
            )}

            {status === 'enabled' && !showDisable && (
                <button
                    onClick={() => setShowDisable(true)}
                    className="px-4 py-2 bg-white border border-red-200 text-red-600 text-sm font-medium rounded-lg hover:bg-red-50 transition-colors"
                >
                    Disable 2FA
                </button>
            )}

            {status === 'enabled' && showDisable && (
                <div className="space-y-4">
                    <p className="text-sm text-gray-600">Enter your current authenticator code to disable 2FA:</p>
                    <div className="flex items-center gap-3 flex-wrap">
                        <input
                            type="text"
                            inputMode="numeric"
                            maxLength={6}
                            value={disableCode}
                            onChange={(e) => setDisableCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                            placeholder="000000"
                            className="w-36 px-3 py-2 border border-gray-300 rounded-lg text-center text-xl font-mono tracking-widest focus:outline-none focus:ring-2 focus:ring-red-500"
                        />
                        <button
                            onClick={confirmDisable}
                            disabled={saving || disableCode.length !== 6}
                            className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 disabled:opacity-60 transition-colors"
                        >
                            {saving ? 'Disabling…' : 'Confirm Disable'}
                        </button>
                        <button onClick={() => { setShowDisable(false); setDisableCode(''); }}
                            className="text-sm text-gray-500 hover:text-gray-700">
                            Cancel
                        </button>
                    </div>
                </div>
            )}
        </section>
    );
}
