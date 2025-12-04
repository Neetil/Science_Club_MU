"use client";

import { useState, useEffect } from "react";
import { TeamMember } from "@/lib/data";

export default function TeamPage() {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    try {
      const res = await fetch("/api/admin/team");
      const data = await res.json();
      setMembers(data);
    } catch (error) {
      console.error("Failed to fetch members:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this team member?")) return;

    try {
      await fetch(`/api/admin/team?id=${id}`, { method: "DELETE" });
      fetchMembers();
    } catch (error) {
      console.error("Failed to delete member:", error);
    }
  };

  if (loading) {
    return <div className="text-white">Loading...</div>;
  }

  const executives = members.filter((m) => m.category === "executive");
  const coordinators = members.filter((m) => m.category === "coordinator");
  const mentors = members.filter((m) => m.category === "mentor");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Team Management</h1>
          <p className="text-zinc-400">Manage team members and their roles</p>
        </div>
        <button
          onClick={() => {
            setEditingMember(null);
            setShowForm(true);
          }}
          className="px-4 py-2 rounded-lg bg-cyan-600 text-white hover:bg-cyan-500 transition-colors"
        >
          + Add Member
        </button>
      </div>

      {showForm && (
        <MemberForm
          member={editingMember}
          onClose={() => {
            setShowForm(false);
            setEditingMember(null);
          }}
          onSuccess={() => {
            fetchMembers();
            setShowForm(false);
            setEditingMember(null);
          }}
        />
      )}

      <div className="space-y-8">
        {executives.length > 0 && (
          <section>
            <h2 className="text-xl font-semibold text-white mb-4">Executive Team</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {executives.map((member) => (
                <MemberCard key={member.id} member={member} onEdit={setEditingMember} onDelete={handleDelete} />
              ))}
            </div>
          </section>
        )}

        {coordinators.length > 0 && (
          <section>
            <h2 className="text-xl font-semibold text-white mb-4">Coordinators</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {coordinators.map((member) => (
                <MemberCard key={member.id} member={member} onEdit={setEditingMember} onDelete={handleDelete} />
              ))}
            </div>
          </section>
        )}

        {mentors.length > 0 && (
          <section>
            <h2 className="text-xl font-semibold text-white mb-4">Mentors</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {mentors.map((member) => (
                <MemberCard key={member.id} member={member} onEdit={setEditingMember} onDelete={handleDelete} />
              ))}
            </div>
          </section>
        )}
      </div>

      {members.length === 0 && (
        <div className="text-center py-12 text-zinc-400">
          <p className="text-lg mb-2">No team members yet</p>
          <p className="text-sm">Click "Add Member" to add your first team member</p>
        </div>
      )}
    </div>
  );
}

function MemberCard({
  member,
  onEdit,
  onDelete,
}: {
  member: TeamMember;
  onEdit: (member: TeamMember) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.02] p-6">
      <h3 className="text-lg font-semibold text-white mb-1">{member.name}</h3>
      <p className="text-sm text-cyan-400 mb-2">{member.role}</p>
      <p className="text-sm text-zinc-300 mb-4">{member.focus}</p>
      <div className="flex gap-2">
        <button
          onClick={() => onEdit(member)}
          className="flex-1 px-3 py-2 rounded-lg bg-white/5 text-white hover:bg-white/10 transition-colors text-sm"
        >
          Edit
        </button>
        <button
          onClick={() => onDelete(member.id)}
          className="px-3 py-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors text-sm"
        >
          Delete
        </button>
      </div>
    </div>
  );
}

function MemberForm({
  member,
  onClose,
  onSuccess,
}: {
  member: TeamMember | null;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [formData, setFormData] = useState({
    name: member?.name || "",
    role: member?.role || "",
    focus: member?.focus || "",
    category: member?.category || "executive",
    image: member?.image || "",
    order: member?.order || 0,
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const url = "/api/admin/team";
      const method = member ? "PUT" : "POST";
      const body = member ? { ...formData, id: member.id } : formData;

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        onSuccess();
      } else {
        alert("Failed to save member");
      }
    } catch (error) {
      console.error("Error saving member:", error);
      alert("Failed to save member");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
      <div className="bg-[#0a0d14] rounded-2xl border border-white/10 p-6 w-full max-w-lg">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">
            {member ? "Edit Member" : "Add Member"}
          </h2>
          <button onClick={onClose} className="text-zinc-400 hover:text-white">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">
              Name *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">
              Role *
            </label>
            <input
              type="text"
              required
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">
              Focus/Description *
            </label>
            <textarea
              required
              rows={3}
              value={formData.focus}
              onChange={(e) => setFormData({ ...formData, focus: e.target.value })}
              className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">
              Category *
            </label>
            <select
              required
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
              className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white"
            >
              <option value="executive">Executive</option>
              <option value="coordinator">Coordinator</option>
              <option value="mentor">Mentor</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">
              Image URL
            </label>
            <input
              type="url"
              value={formData.image}
              onChange={(e) => setFormData({ ...formData, image: e.target.value })}
              className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">
              Order
            </label>
            <input
              type="number"
              value={formData.order}
              onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
              className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 rounded-lg bg-cyan-600 text-white hover:bg-cyan-500 disabled:opacity-50"
            >
              {loading ? "Saving..." : "Save Member"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-white/5 text-white hover:bg-white/10"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

