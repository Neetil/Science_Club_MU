export default function AdminDashboard() {
  // Authentication is handled by middleware

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
        <p className="text-zinc-400">Welcome to the admin panel</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-xl border border-white/10 bg-white/[0.02] p-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-2xl">📅</span>
            <span className="text-xs text-zinc-400">Events</span>
          </div>
          <p className="text-3xl font-bold text-white">0</p>
          <p className="text-sm text-zinc-400 mt-1">Total events</p>
        </div>

        <div className="rounded-xl border border-white/10 bg-white/[0.02] p-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-2xl">🖼️</span>
            <span className="text-xs text-zinc-400">Gallery</span>
          </div>
          <p className="text-3xl font-bold text-white">0</p>
          <p className="text-sm text-zinc-400 mt-1">Total images</p>
        </div>

        <div className="rounded-xl border border-white/10 bg-white/[0.02] p-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-2xl">👥</span>
            <span className="text-xs text-zinc-400">Team</span>
          </div>
          <p className="text-3xl font-bold text-white">0</p>
          <p className="text-sm text-zinc-400 mt-1">Team members</p>
        </div>

        <div className="rounded-xl border border-white/10 bg-white/[0.02] p-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-2xl">✉️</span>
            <span className="text-xs text-zinc-400">Messages</span>
          </div>
          <p className="text-3xl font-bold text-white">0</p>
          <p className="text-sm text-zinc-400 mt-1">Unread messages</p>
        </div>
      </div>

      <div className="rounded-xl border border-white/10 bg-white/[0.02] p-6">
        <h2 className="text-xl font-semibold text-white mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <a
            href="/admin/events"
            className="p-4 rounded-lg border border-white/10 hover:border-cyan-500/50 hover:bg-cyan-500/10 transition-colors"
          >
            <h3 className="font-medium text-white mb-1">Manage Events</h3>
            <p className="text-sm text-zinc-400">Create, edit, or delete events</p>
          </a>
          <a
            href="/admin/gallery"
            className="p-4 rounded-lg border border-white/10 hover:border-cyan-500/50 hover:bg-cyan-500/10 transition-colors"
          >
            <h3 className="font-medium text-white mb-1">Manage Gallery</h3>
            <p className="text-sm text-zinc-400">Upload and organize images</p>
          </a>
          <a
            href="/admin/team"
            className="p-4 rounded-lg border border-white/10 hover:border-cyan-500/50 hover:bg-cyan-500/10 transition-colors"
          >
            <h3 className="font-medium text-white mb-1">Manage Team</h3>
            <p className="text-sm text-zinc-400">Add or update team members</p>
          </a>
          <a
            href="/admin/contact"
            className="p-4 rounded-lg border border-white/10 hover:border-cyan-500/50 hover:bg-cyan-500/10 transition-colors"
          >
            <h3 className="font-medium text-white mb-1">View Messages</h3>
            <p className="text-sm text-zinc-400">Check contact form submissions</p>
          </a>
        </div>
      </div>
    </div>
  );
}

