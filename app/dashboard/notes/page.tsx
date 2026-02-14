'use client';

import React, { useState, useEffect } from 'react';
import {
    Plus, Search, Trash2, Edit2, Archive, Star,
    MoreVertical, Check, X, Loader2
} from 'lucide-react';
import { toast } from 'react-hot-toast';

interface Note {
    id: string;
    title: string;
    content: string;
    category: string;
    color: 'blue' | 'green' | 'yellow' | 'red' | 'purple';
    isPinned: boolean;
    updatedAt: string;
}

const COLORS = {
    blue: 'bg-blue-50 border-blue-200 text-blue-900',
    green: 'bg-green-50 border-green-200 text-green-900',
    yellow: 'bg-yellow-50 border-yellow-200 text-yellow-900',
    red: 'bg-red-50 border-red-200 text-red-900',
    purple: 'bg-purple-50 border-purple-200 text-purple-900',
};

const COLOR_BTNS = {
    blue: 'bg-blue-200 hover:bg-blue-300',
    green: 'bg-green-200 hover:bg-green-300',
    yellow: 'bg-yellow-200 hover:bg-yellow-300',
    red: 'bg-red-200 hover:bg-red-300',
    purple: 'bg-purple-200 hover:bg-purple-300',
};

export default function NotesPage() {
    const [notes, setNotes] = useState<Note[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingNote, setEditingNote] = useState<Note | null>(null);

    // Form State
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [category, setCategory] = useState('General');
    const [color, setColor] = useState<keyof typeof COLORS>('blue');
    const [isPinned, setIsPinned] = useState(false);

    useEffect(() => {
        fetchNotes();
    }, []);

    const fetchNotes = async () => {
        try {
            const res = await fetch('/api/notes');
            const data = await res.json();
            if (Array.isArray(data)) {
                setNotes(data);
            }
        } catch (error) {
            console.error('Failed to fetch notes', error);
            toast.error('Failed to load notes');
        } finally {
            setLoading(false);
        }
    };

    const openModal = (note?: Note) => {
        if (note) {
            setEditingNote(note);
            setTitle(note.title);
            setContent(note.content);
            setCategory(note.category);
            // Ensure color is valid, default to blue if not
            const noteColor = (Object.keys(COLORS).includes(note.color) ? note.color : 'blue') as keyof typeof COLORS;
            setColor(noteColor);
            setIsPinned(note.isPinned);
        } else {
            setEditingNote(null);
            setTitle('');
            setContent('');
            setCategory('General');
            setColor('blue');
            setIsPinned(false);
        }
        setIsModalOpen(true);
    };

    const handleSave = async () => {
        if (!title.trim() || !content.trim()) {
            toast.error('Title and content are required');
            return;
        }

        try {
            const payload = { title, content, category, color, isPinned };
            let res;

            if (editingNote) {
                res = await fetch('/api/notes', {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ id: editingNote.id, ...payload }),
                });
            } else {
                res = await fetch('/api/notes', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload),
                });
            }

            if (res.ok) {
                toast.success(editingNote ? 'Note updated' : 'Note created');
                setIsModalOpen(false);
                fetchNotes();
            } else {
                throw new Error('Failed to save');
            }
        } catch (error) {
            toast.error('Failed to save note');
        }
    };

    const handleDelete = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (!confirm('Delete this note?')) return;

        try {
            const res = await fetch(`/api/notes?id=${id}`, { method: 'DELETE' });
            if (res.ok) {
                setNotes(notes.filter(n => n.id !== id));
                toast.success('Note deleted');
            }
        } catch (error) {
            toast.error('Failed to delete note');
        }
    };

    const togglePin = async (note: Note, e: React.MouseEvent) => {
        e.stopPropagation();
        try {
            // Optimistic update
            const updatedNotes = notes.map(n =>
                n.id === note.id ? { ...n, isPinned: !n.isPinned } : n
            );
            // Re-sort: pinned first
            setNotes(updatedNotes.sort((a, b) => Number(b.isPinned) - Number(a.isPinned)));

            await fetch('/api/notes', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: note.id, isPinned: !note.isPinned }),
            });
        } catch (error) {
            fetchNotes(); // Revert on error
        }
    };

    const filteredNotes = notes.filter(note =>
        note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        note.content.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (loading) return <div className="p-8 flex justify-center"><Loader2 className="animate-spin" /></div>;

    return (
        <div className="p-6 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        📝 Notes
                    </h1>
                    <p className="text-gray-500 text-sm">Capture your thoughts and ideas</p>
                </div>

                <div className="flex flex-col sm:flex-row w-full md:w-auto gap-3">
                    <div className="relative flex-1 md:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search notes..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>
                    <button
                        onClick={() => openModal()}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 font-medium shrink-0"
                    >
                        <Plus className="w-4 h-4" />
                        Add Note
                    </button>
                </div>
            </div>

            {/* Notes Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredNotes.length === 0 ? (
                    <div className="col-span-full text-center py-12 text-gray-400 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                        <p>No notes found. Create one to get started!</p>
                    </div>
                ) : (
                    filteredNotes.map(note => (
                        <div
                            key={note.id}
                            onClick={() => openModal(note)}
                            className={`group relative p-5 rounded-xl border transition-all cursor-pointer hover:shadow-md ${COLORS[note.color as keyof typeof COLORS] || COLORS.blue}`}
                        >
                            <div className="flex justify-between items-start mb-3">
                                <h3 className="font-bold text-lg leading-tight line-clamp-1 pr-6">{note.title}</h3>
                                <button
                                    onClick={(e) => togglePin(note, e)}
                                    className={`absolute top-4 right-4 p-1 rounded-full hover:bg-black/10 transition-colors ${note.isPinned ? 'opacity-100 text-yellow-600' : 'opacity-0 group-hover:opacity-100 text-gray-400'}`}
                                >
                                    <Star className={`w-4 h-4 ${note.isPinned ? 'fill-current' : ''}`} />
                                </button>
                            </div>
                            <p className="text-sm opacity-80 h-24 overflow-hidden mb-4 line-clamp-4 whitespace-pre-wrap">
                                {note.content}
                            </p>
                            <div className="flex justify-between items-center text-xs opacity-60 mt-auto">
                                <span>{new Date(note.updatedAt).toLocaleDateString()}</span>
                                <span className="font-medium bg-black/5 px-2 py-1 rounded-full">{note.category}</span>
                            </div>

                            {/* Hover Actions */}
                            <div className="absolute bottom-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                    onClick={(e) => handleDelete(note.id, e)}
                                    title="Delete"
                                    className="p-2 bg-white rounded-full shadow-sm hover:text-red-600 text-gray-500 border border-gray-100"
                                >
                                    <Trash2 className="w-3 h-3" />
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Modal Overlay */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 transition-opacity">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden transform transition-all scale-100">
                        <div className="p-6">
                            <input
                                type="text"
                                placeholder="Title"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="w-full text-xl font-bold mb-4 focus:outline-none placeholder:text-gray-300 border-b border-transparent focus:border-gray-100 pb-2 transition-colors"
                                autoFocus
                            />
                            <textarea
                                placeholder="Write your note here..."
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                className="w-full h-48 resize-none focus:outline-none text-gray-600 placeholder:text-gray-300 leading-relaxed"
                            />

                            <div className="flex flex-col sm:flex-row gap-4 mt-6 pt-6 border-t border-gray-100">
                                <div className="flex-1">
                                    <label className="text-xs font-medium text-gray-500 mb-1.5 block uppercase tracking-wider">Category</label>
                                    <select
                                        value={category}
                                        onChange={(e) => setCategory(e.target.value)}
                                        className="w-full text-sm border-gray-200 rounded-lg focus:ring-blue-500 focus:border-blue-500 bg-gray-50"
                                    >
                                        <option>General</option>
                                        <option>Work</option>
                                        <option>Personal</option>
                                        <option>Ideas</option>
                                        <option>To-Do</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="text-xs font-medium text-gray-500 mb-1.5 block uppercase tracking-wider">Color</label>
                                    <div className="flex gap-2">
                                        {(Object.keys(COLORS) as Array<keyof typeof COLORS>).map((c) => (
                                            <button
                                                key={c}
                                                onClick={() => setColor(c)}
                                                className={`w-8 h-8 rounded-full transition-transform hover:scale-110 ${COLOR_BTNS[c]} ${color === c ? 'ring-2 ring-offset-2 ring-gray-400 scale-110' : ''}`}
                                                title={c.charAt(0).toUpperCase() + c.slice(1)}
                                            />
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="mt-4 pt-4 border-t border-gray-100 flex items-center">
                                <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer select-none hover:text-blue-600 transition-colors">
                                    <input
                                        type="checkbox"
                                        checked={isPinned}
                                        onChange={(e) => setIsPinned(e.target.checked)}
                                        className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4 border-gray-300"
                                    />
                                    Pin this note to the top
                                </label>
                            </div>
                        </div>

                        <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3 border-t border-gray-100">
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSave}
                                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium shadow-sm transition-colors flex items-center gap-2"
                            >
                                <Check className="w-4 h-4" />
                                Save Note
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
