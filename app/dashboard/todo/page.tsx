'use client';

import React, { useState, useEffect } from 'react';
import {
    Plus, Calendar, CheckCircle2, Circle, Trash2,
    Flag, ArrowUp, ArrowDown, Filter, Loader2, Check
} from 'lucide-react';
import { toast } from 'react-hot-toast';

interface Task {
    id: string;
    title: string;
    isCompleted: boolean;
    dueDate: string | null;
    priority: 'low' | 'medium' | 'high';
    createdAt: string;
}

const PRIORITIES = {
    high: { color: 'text-red-600 bg-red-50 border-red-200', icon: ArrowUp, label: 'High' },
    medium: { color: 'text-yellow-600 bg-yellow-50 border-yellow-200', icon: Circle, label: 'Medium' },
    low: { color: 'text-blue-600 bg-blue-50 border-blue-200', icon: ArrowDown, label: 'Low' },
};

export default function TodoPage() {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(true);
    const [newTaskTitle, setNewTaskTitle] = useState('');
    const [newPriority, setNewPriority] = useState<'low' | 'medium' | 'high'>('medium');
    const [newDueDate, setNewDueDate] = useState('');
    const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');

    useEffect(() => {
        fetchTasks();
    }, []);

    const fetchTasks = async () => {
        try {
            const res = await fetch('/api/tasks');
            const data = await res.json();
            if (Array.isArray(data)) {
                setTasks(data);
            }
        } catch (error) {
            console.error('Failed to fetch tasks', error);
            toast.error('Failed to load tasks');
        } finally {
            setLoading(false);
        }
    };

    const handleAddTask = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!newTaskTitle.trim()) return;

        try {
            const res = await fetch('/api/tasks', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: newTaskTitle,
                    priority: newPriority,
                    dueDate: newDueDate || null,
                }),
            });

            if (res.ok) {
                const task = await res.json();
                setTasks([task, ...tasks]);
                setNewTaskTitle('');
                setNewPriority('medium');
                setNewDueDate('');
                toast.success('Task added');
            }
        } catch (error) {
            toast.error('Failed to add task');
        }
    };

    const toggleTask = async (task: Task) => {
        try {
            // Optimistic update
            const updatedTasks = tasks.map(t =>
                t.id === task.id ? { ...t, isCompleted: !t.isCompleted } : t
            ).sort((a, b) => Number(a.isCompleted) - Number(b.isCompleted));

            setTasks(updatedTasks);

            await fetch('/api/tasks', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: task.id, isCompleted: !task.isCompleted }),
            });
        } catch (error) {
            fetchTasks(); // Revert
            toast.error('Failed to update task');
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Delete this task?')) return;
        try {
            const res = await fetch(`/api/tasks?id=${id}`, { method: 'DELETE' });
            if (res.ok) {
                setTasks(tasks.filter(t => t.id !== id));
                toast.success('Task deleted');
            }
        } catch (error) {
            toast.error('Failed to delete task');
        }
    };

    const filteredTasks = tasks.filter(task => {
        if (filter === 'active') return !task.isCompleted;
        if (filter === 'completed') return task.isCompleted;
        return true;
    });

    const stats = {
        total: tasks.length,
        active: tasks.filter(t => !t.isCompleted).length,
        completed: tasks.filter(t => t.isCompleted).length,
    };

    if (loading) return <div className="p-8 flex justify-center"><Loader2 className="animate-spin" /></div>;

    return (
        <div className="p-6 max-w-5xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        ✅ To-Do List
                    </h1>
                    <p className="text-gray-500 text-sm">Stay organized and get things done</p>
                </div>

                <div className="flex bg-white p-1 rounded-lg border border-gray-200">
                    {(['all', 'active', 'completed'] as const).map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${filter === f ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50'}`}
                        >
                            {f.charAt(0).toUpperCase() + f.slice(1)}
                            <span className="ml-2 text-xs opacity-60">
                                {f === 'all' ? stats.total : f === 'active' ? stats.active : stats.completed}
                            </span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Add Task Form */}
            <form onSubmit={handleAddTask} className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm mb-8 flex flex-col md:flex-row gap-4 items-center">
                <div className="flex-1 w-full">
                    <input
                        type="text"
                        placeholder="What needs to be done?"
                        value={newTaskTitle}
                        onChange={(e) => setNewTaskTitle(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>

                <div className="flex w-full md:w-auto gap-3">
                    <select
                        value={newPriority}
                        onChange={(e) => setNewPriority(e.target.value as any)}
                        className="px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:ring-blue-500"
                    >
                        <option value="low">Low Priority</option>
                        <option value="medium">Medium Priority</option>
                        <option value="high">High Priority</option>
                    </select>

                    <input
                        type="date"
                        value={newDueDate}
                        onChange={(e) => setNewDueDate(e.target.value)}
                        className="px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:ring-blue-500"
                    />

                    <button
                        type="submit"
                        disabled={!newTaskTitle.trim()}
                        className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 whitespace-nowrap"
                    >
                        <Plus className="w-4 h-4" />
                        Add Task
                    </button>
                </div>
            </form>

            {/* Task List */}
            <div className="space-y-3">
                {filteredTasks.length === 0 ? (
                    <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-200 text-gray-400">
                        <CheckCircle2 className="w-12 h-12 mx-auto mb-3 opacity-20" />
                        <p>No tasks found. Add one above!</p>
                    </div>
                ) : (
                    filteredTasks.map(task => {
                        const PriorityIcon = PRIORITIES[task.priority].icon;
                        const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && !task.isCompleted;

                        return (
                            <div
                                key={task.id}
                                className={`group flex items-center gap-4 p-4 bg-white rounded-xl border transition-all hover:shadow-sm ${task.isCompleted ? 'opacity-60 bg-gray-50' : 'border-gray-200'}`}
                            >
                                <button
                                    onClick={() => toggleTask(task)}
                                    className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${task.isCompleted ? 'bg-green-500 border-green-500 text-white' : 'border-gray-300 hover:border-blue-500 text-transparent'}`}
                                >
                                    <Check className="w-3.5 h-3.5" strokeWidth={3} />
                                </button>

                                <div className="flex-1 min-w-0">
                                    <p className={`font-medium truncate ${task.isCompleted ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                                        {task.title}
                                    </p>
                                    <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                                        {task.dueDate && (
                                            <span className={`flex items-center gap-1 ${isOverdue ? 'text-red-600 font-medium' : ''}`}>
                                                <Calendar className="w-3 h-3" />
                                                {new Date(task.dueDate).toLocaleDateString()}
                                                {isOverdue && ' (Overdue)'}
                                            </span>
                                        )}
                                        <span className={`flex items-center gap-1 px-2 py-0.5 rounded-full ${PRIORITIES[task.priority].color} bg-opacity-10 border border-opacity-20`}>
                                            <PriorityIcon className="w-3 h-3" />
                                            {PRIORITIES[task.priority].label}
                                        </span>
                                    </div>
                                </div>

                                <button
                                    onClick={() => handleDelete(task.id)}
                                    className="opacity-0 group-hover:opacity-100 p-2 text-gray-400 hover:text-red-600 transition-all"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}
